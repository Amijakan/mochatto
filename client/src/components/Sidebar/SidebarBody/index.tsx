import React from 'react'
import { SIDEBAR_ITEM } from '../'
import UserList from '../UserList'
import ChatHistory from '../ChatHistory'

const SidebarBody = ({ selectedItem }: { selectedItem: SIDEBAR_ITEM }) => {
  return (
    <div className="sidebar__body">
      {selectedItem === SIDEBAR_ITEM.USERS && <UserList />}
      {selectedItem === SIDEBAR_ITEM.CHAT && <ChatHistory />}
    </div>
  )
}

export default SidebarBody
