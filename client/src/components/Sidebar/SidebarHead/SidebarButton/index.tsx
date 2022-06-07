import React from 'react'
import { SIDEBAR_ITEM } from '../../'

const SidebarButton = ({ value, current, setValue, content }: { value: SIDEBAR_ITEM | null, current: SIDEBAR_ITEM | null, setValue: (arg0: SIDEBAR_ITEM | null) => void, content: any }) => {
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
