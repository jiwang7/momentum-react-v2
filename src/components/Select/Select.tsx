/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  ReactElement,
  useCallback,
  RefObject,
  useRef,
  forwardRef,
  useState,
  useEffect,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import classnames from 'classnames';

import './Select.style.scss';
import { Props } from './Select.types';
import { DEFAULTS, STYLE } from './Select.constants';
import { useSelectState } from '@react-stately/select';
import { useButton } from '@react-aria/button';
import { HiddenSelect, useSelect } from '@react-aria/select';
import Icon from '../Icon';
import ListBoxBase from '../ListBoxBase';
import Popover, { PopoverInstance } from '../Popover';
import Text from '../Text';
import { useSpatialNavigationContext } from '../SpatialNavigationProvider/SpatialNavigationProvider.utils';
import { useKeyboard } from '@react-aria/interactions';

// eslint-disable-next-line @typescript-eslint/ban-types
function Select<T extends object>(props: Props<T>, ref: RefObject<HTMLDivElement>): ReactElement {
  const {
    'aria-labelledby': ariaLabelledBy,
    className,
    style,
    id,
    isDisabled,
    label,
    name,
    placeholder,
    direction = DEFAULTS.DIRECTION,
    title,
    showBorder = DEFAULTS.SHOULD_SHOW_BORDER,
    listboxMaxHeight,
    isInForm = DEFAULTS.IS_IN_FORM,
    listboxWidth,
    shallowDisabled,
    popoverSingleOpenGroupId,
  } = props;
  const [popoverInstance, setPopoverInstance] = useState<PopoverInstance>();
  const hasBeenOpened = useRef<boolean>(false);

  const selectRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLUListElement>(null);
  const spatialNav = useSpatialNavigationContext();

  const state = useSelectState(props);
  const { labelProps, triggerProps, valueProps, menuProps } = useSelect(props, state, selectRef);
  const { buttonProps } = useButton(
    {
      ...triggerProps,
      isDisabled,
      ...(ariaLabelledBy === ''
        ? { 'aria-labelledby': null }
        : ariaLabelledBy
        ? { 'aria-labelledby': ariaLabelledBy }
        : {}),
    },
    selectRef
  );
  const ariaActivedesecendant =
    menuProps?.id &&
    state?.selectionManager?.focusedKey &&
    `${menuProps.id}-option-${state.selectionManager.focusedKey}`;

  delete buttonProps.color;
  delete buttonProps.onKeyDown;

  const getArrowIcon = (isOpen: boolean) => (isOpen ? 'arrow-up' : 'arrow-down');

  const handleFocusBackOnTrigger = useCallback(() => {
    selectRef.current?.focus();
  }, []);

  useEffect(() => {
    if (popoverInstance) {
      if (state.isOpen) {
        // show popover once state changes to isOpen = true
        popoverInstance.show();
        hasBeenOpened.current = true;
      } else {
        // hide popover once state changes to isOpen = false
        popoverInstance.hide();
        if (hasBeenOpened.current) {
          // only do this if it has been opened previously to prevent unexpected focus
          handleFocusBackOnTrigger();
        }
      }
    }
  }, [state.isOpen, popoverInstance, handleFocusBackOnTrigger]);

  /**
   * Handle closeOnSelect from @react-aria manually
   */
  const closePopover = useCallback(() => {
    state.close();
  }, [state]);

  /**
   * Handle onKeyDown from @react-aria manually
   */
  const onKeyDown = useCallback(
    (e) => {
      if (spatialNav) {
        return;
      }
      switch (e.key) {
        // useButton already provides Keyboard event support for Enter and Space
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          state.open();
          break;
      }
    },
    [spatialNav, state]
  );

  const otherProps = shallowDisabled
    ? {
        'aria-disabled': true,
        'data-shallow-disabled': true,
        onMouseDown: (e: MouseEvent<HTMLButtonElement>) => {
          e.currentTarget.focus();
        },
        onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => {
          if (e.key !== 'Tab') {
            e.preventDefault();
          }
        },
        onPointerDown: undefined,
      }
    : {
        onKeyDown,
      };

  const triggerComponent = (
    <button
      id={name}
      {...buttonProps}
      role="combobox"
      aria-expanded={!!state.isOpen}
      aria-controls={id}
      aria-activedescendant={ariaActivedesecendant}
      className={classnames(
        STYLE.dropdownInput,
        { [STYLE.selected]: state.selectedItem },
        { [STYLE.open]: state.isOpen },
        { [STYLE.borderLess]: !showBorder }
      )}
      title={title}
      {...otherProps}
    >
      <span
        title={state.selectedItem?.textValue}
        {...valueProps}
        className={STYLE.selectedItemWrapper}
      >
        {state.selectedItem ? state.selectedItem.rendered : placeholder}
      </span>
      <span aria-hidden="true" className={STYLE.iconWrapper}>
        <Icon name={getArrowIcon(state.isOpen)} weight="bold" scale={16} />
      </span>
    </button>
  );

  // special handling for spatial navigation
  const { keyboardProps } = useKeyboard({
    onKeyDown: (event) => {
      if (spatialNav && event.key === spatialNav.back) {
        closePopover();
        event.nativeEvent.stopImmediatePropagation();
      }
    },
  });

  // delete color prop which is passed down and used in the ModalContainer
  // because it conflicts with the HTML color property
  delete keyboardProps.color;

  return (
    <div
      className={classnames(className, STYLE.wrapper)}
      ref={ref}
      /* @ts-ignore: next-line */
      style={{ '--local-width': listboxWidth || '100%', ...style }}
      id={id}
    >
      {label && (
        <label htmlFor={name} {...labelProps}>
          <Text tagName="p">{label}</Text>
        </label>
      )}
      {isInForm && (
        <HiddenSelect
          isDisabled={isDisabled}
          state={state}
          triggerRef={selectRef}
          label={label}
          name={name}
        />
      )}
      <Popover
        interactive
        showArrow={false}
        // remove role of Popover ModalContainer since the listbox role is passed through the ListBoxBase component via menuProps
        // eslint-disable-next-line jsx-a11y/aria-role
        role={null}
        triggerComponent={React.cloneElement(triggerComponent, {
          ref: selectRef,
        })}
        trigger="manual"
        setInstance={setPopoverInstance}
        placement={direction}
        onClickOutside={closePopover}
        onHide={closePopover}
        hideOnEsc={!spatialNav} // disable hide on Esc key if spatial navigation is enabled
        style={{ maxHeight: listboxMaxHeight || 'none' }}
        className={STYLE.popover}
        strategy={listboxWidth ? 'fixed' : 'absolute'}
        singleOpenGroupId={popoverSingleOpenGroupId}
        {...(spatialNav ? (keyboardProps as any) : {})}
      >
        <ListBoxBase
          {...menuProps}
          ref={boxRef}
          state={state}
          disallowEmptySelection
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={state.focusStrategy || DEFAULTS.FOCUS_STRATEGY}
          className={STYLE.menuListBox}
        />
      </Popover>
    </div>
  );
}

/**
 * Dropdown / Select Element which displays a listbox with options.
 */

const _Select = forwardRef(Select);

_Select.displayName = 'Select';

export default _Select as <T>(
  props: Props<T> & { ref?: RefObject<HTMLDivElement> }
) => ReactElement;
