import React from 'react'
import { Person, ChatBubble } from "@material-ui/icons";
import SidebarButton from './SidebarButton'
import { SIDEBAR_ITEM } from '../'

const SidebarHead = ({ selectedItem, setSelectedItem }: { selectedItem: SIDEBAR_ITEM | null, setSelectedItem: (arg0: SIDEBAR_ITEM | null) => void }) => {
  return (
    <div className="sidebar__head">
      <SidebarButton value={SIDEBAR_ITEM.USERS} selectedItem={selectedItem} setSelectedItem={setSelectedItem} content={<Person />} />
      <SidebarButton value={SIDEBAR_ITEM.CHAT} selectedItem={selectedItem} setSelectedItem={setSelectedItem} content={<ChatBubble />} />
    </div>
  )
}

export default React.memo(SidebarHead)
