import React, { useState } from 'react'

import SidebarHead from './SidebarHead'
import SidebarBody from './SidebarBody'

import "./style.scss"

export enum SIDEBAR_ITEM {
  USERS = "USERS",
  CHAT = "CHAT",
}

const SideBar = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [currentItem, setCurrentItem] = useState<SIDEBAR_ITEM | null>(null)

  return (
    <div
      className="sidebar"
      onClick={() => setIsOpen(!isOpen)}
      data-open={currentItem ? "open" : "close"}
      data-duration="1s"
    >
      <SidebarHead currentItem={currentItem} setCurrentItem={setCurrentItem} />
      {currentItem ? <SidebarBody currentItem={currentItem} /> : <></>}
    </div>
  )

}

export default React.memo(SideBar)
