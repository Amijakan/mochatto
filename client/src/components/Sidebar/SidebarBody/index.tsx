import { SIDEBAR_ITEM } from '../'
import UserList from '../UserList'
import ChatHistory from '../ChatHistory'

const SidebarBody = ({ currentItem }) => {
  return (
    <div className="sidebar--body">
      {currentItem === SIDEBAR_ITEM.USERS && <UserList />}
      {currentItem === SIDEBAR_ITEM.CHAT && <ChatHistory />}
    </div>
  )
}


export default SidebarBody
