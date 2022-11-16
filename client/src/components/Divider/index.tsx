import React from 'react'
import "./style.scss"

const Divider = ({ className }: { className: string }): JSX.Element => {
  return (
    <div className={className}>
      <div className="top" />
      <div className="divider" />
      <div className="bottom" />
    </div>
  )

}

export default Divider
