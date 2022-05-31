import React from 'react'
import './style.scss'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: string | JSX.Element;
  ref?: React.MutableRefObject<HTMLButtonElement | null>
}

const Button: React.FC<ButtonProps> = (props) => <button {...props}>{props.children}</button>

export default Button
