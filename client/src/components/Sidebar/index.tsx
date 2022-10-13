import React, { useState } from 'react'

import SidebarHead from './SidebarHead'
import SidebarBody from './SidebarBody'

import "./style.scss"

export enum SIDEBAR_ITEM {
  USERS = "USERS",
  CHAT = "CHAT",
}

const SideBar = () => {
  const [selectedItem, setSelectedItem] = useState<SIDEBAR_ITEM | null>(null)

  return (
    <div
      className="sidebar"
      data-open={selectedItem ? "open" : "close"}
      data-duration="1s"
    >
      <SidebarHead selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      {selectedItem ? <SidebarBody selectedItem={selectedItem} /> : <></>}
    </div>
  )

}

export default React.memo(SideBar)
