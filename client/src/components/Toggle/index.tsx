import React from 'react'
import './style.scss'

const Toggle = ({ selected, setSelected, disabled = false }: { selected: boolean, setSelected: (arg0: boolean) => void, disabled?: boolean }): JSX.Element => {

  const handleToggle = () => {
    if (!disabled) setSelected(!selected)
  }

  const dataAttributes = {
    'data-selected': selected ? 'on' : 'off',
    'data-disabled': disabled ? 'disabled' : ''
  }

  return (
    <div
      className="toggle-wrapper"
      onClick={handleToggle}
      {...dataAttributes}
    >
      <div className="toggle-ball"
        onClick={handleToggle}
        {...dataAttributes}
      />
    </div>
  )
}

export default Toggle
