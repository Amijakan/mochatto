import React from 'react'
import { SIDEBAR_ITEM } from '../../'

const SidebarButton = ({ value, current, setValue, content }: { value: SIDEBAR_ITEM, current: SIDEBAR_ITEM, setValue: (arg0: SIDEBAR_ITEM) => void, content: any }) => {
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
