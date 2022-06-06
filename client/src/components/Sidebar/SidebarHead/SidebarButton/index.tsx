import React from 'react'

const SidebarButton = ({ value, current, setValue, content }) => {
  const selected = current === value;
  return (
    <button
      onClick={() => {
        if (selected) setValue(null)
        else setValue(value)
      }}
      data-active={selected ? 'active' : "inactive"}
    >
      {content}
    </button>
  )
}

export default React.memo(SidebarButton)
