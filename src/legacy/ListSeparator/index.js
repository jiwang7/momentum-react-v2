/** @component list-separator */

import React from 'react';
import PropTypes from 'prop-types';
import { prefix } from '../utils/index';
import { Text } from '../../components';

/**
 * @deprecated - Components in the legacy folder (/src/legacy) are deprecated. Please use a component from the components folder (/src/components) instead. Legacy components may not follow accessibility standards.
 **/
const ListSeparator = (props) => {
  const { children, className, lineColor, margin, textColor, text, textPadding, ...otherProps } =
    props;

  const lsClass = `${prefix}-list-separator`;

  return (
    <div
      className={`${lsClass}` + `${(className && ` ${className}`) || ''}`}
      style={{
        ...(lineColor && { color: lineColor }),
        ...(margin && { margin: margin }),
      }}
      {...otherProps}
    >
      <span className={`${lsClass}__container`}>
        {children ||
          (text && (
            <Text
              className={`${lsClass}__text`}
              style={{
                ...(textColor && { color: textColor }),
                ...(textPadding && { padding: textPadding }),
              }}
              type="subheader-secondary"
              tagName="span"
            >
              {children ? children : text}
            </Text>
          ))}
      </span>
    </div>
  );
};

ListSeparator.propTypes = {
  /** @prop Children nodes to render inside ListSeparator | null */
  children: PropTypes.node,
  /** @prop Optional css class name | null */
  className: PropTypes.string,
  /** @prop Color of the ListSeparator line | null */
  lineColor: PropTypes.string,
  /** @prop Margin of the ListSeparator | null */
  margin: PropTypes.string,
  /** @prop Text of the ListSeparator | null */
  text: PropTypes.string,
  /** @prop TextColor of the ListSeparator | null */
  textColor: PropTypes.string,
  /** @prop Padding around text of the ListSeparator | null */
  textPadding: PropTypes.string,
};

ListSeparator.defaultProps = {
  children: null,
  className: null,
  lineColor: null,
  margin: null,
  text: null,
  textColor: null,
  textPadding: null,
};

ListSeparator.displayName = 'ListSeparator';

export default ListSeparator;
