import React from 'react'
import { SIDEBAR_ITEM } from '../../'

const SidebarButton = (
  {
    value, // identifier for this button
    selectedItem, // currently active item on sidebar
    setSelectedItem,
    children
  }: {
    value: SIDEBAR_ITEM | null,
    selectedItem: SIDEBAR_ITEM | null,
    setSelectedItem: (arg0: SIDEBAR_ITEM | null) => void,
    children: JSX.Element
  }) => {
  const isSelected = selectedItem === value;
  return (
    <button
      onClick={() => {
        if (isSelected) setSelectedItem(null) // Closes sidebar if selected item is clicked again
        else setSelectedItem(value)
      }}
      data-active={isSelected ? 'active' : "inactive"}
    >
      {children}
    </button>
  )
}

export default SidebarButton
