import React from 'react';
import styles from './Input.module.css';

export default function Input({
  defaultValue,
  value,
  onChange,
  onClick,
  icon,
  iconButton,
  className,
  placeholder,
  ...props
}) {
  const [iValue, setIValue] = React.useState(0);

  const change = (e) => {
    setIValue(e.target.value);
    onChange ? onChange(e) : '';
  };

  const enter = (e) => {
    if (e.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.keyCode === 13) onClick?.(iValue);
  };

  const borderInputLeft = icon ? '' : styles.borderRadiusLeft;
  const borderInputRight = iconButton ? '' : styles.borderRadiusRight;

  return (
    <div className={styles.div}>
      {icon && <div className={[styles.divIcon, styles.borderRadiusLeft].join(' ')}>{icon}</div>}
      <input
        type="text"
        className={[styles.input, className, borderInputLeft, borderInputRight].join(' ')}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        onChange={(e) => change(e)}
        onKeyDown={(e) => enter(e)}
        {...props}
      />
      {iconButton && (
        <div
          onClick={() => onClick?.(iValue)}
          className={[styles.divIcon, styles.pointer, styles.borderRadiusRight].join(' ')}
        >
          {iconButton}
        </div>
      )}
    </div>
  );
}
