import React from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

export default function NumericInput({ value, onChange, className, disabled, ...props }) {
  return (
    <input
      type="number"
      disabled={disabled}
      className={[styles.input, className].join(' ')}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

NumericInput.propTypes = {
  /**
   * The value to give to the component
   */
  value: PropTypes.number,
  /**
   * The callback function for when the input changes
   */
  onChange: PropTypes.func,
  /**
   * Extra styling class names
   */
  className: PropTypes.string,
  /**
   * Disable the input
   */
  disabled: PropTypes.bool,
};
