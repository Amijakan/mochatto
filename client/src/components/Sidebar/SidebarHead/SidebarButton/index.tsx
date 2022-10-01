import React from 'react'
import { SIDEBAR_ITEM } from '../../'

const SidebarButton = (
  {
    value,
    selectedItem,
    setSelectedItem,
    content
  } : {
    value: SIDEBAR_ITEM | null,
    selectedItem: SIDEBAR_ITEM | null,
    setSelectedItem: (arg0: SIDEBAR_ITEM | null) => void,
    content: any
  }) => {
  const isSelected = selectedItem === value;
  return (
    <button
      onClick={() => {
        if (isSelected) setSelectedItem(null) // Toggles sidebar if selected item is clicked again
        else setSelectedItem(value)
      }}
      data-active={isSelected ? 'active' : "inactive"}
    >
      {content}
    </button>
  )
}

export default SidebarButton
