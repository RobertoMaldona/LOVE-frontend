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
    console.log(e);
    setIValue(e.target.value);
    onChange ? onChange(e) : '';
  };
  // console.log(onClick, iValue);
  return (
    <div className={styles.div}>
      {icon ? <span className={styles.spanIcon}>{icon}</span> : ''}
      <input
        type="text"
        className={[styles.input, className].join(' ')}
        defaultValue={defaultValue}
        value={value}
        placeholder={placeholder}
        onChange={(e) => change(e)}
        {...props}
      />
      {iconButton && (
        <span onClick={() => onClick(iValue)} className={[styles.spanIcon, styles.pointer].join(' ')}>
          {iconButton}
        </span>
      )}
    </div>
  );
}
