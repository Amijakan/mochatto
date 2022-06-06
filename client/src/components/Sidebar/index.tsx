import React, { useState, useContext } from 'react'
import { Person, ChatBubble } from "@material-ui/icons";

import { UserInfoContext } from "@/contexts";
import { UserInfo } from "@/contexts/UserInfoContext";
import AvatarDOM from "@/components/AvatarCanvas/AvatarDOM"

import "./style.scss"

enum SIDEBAR_ITEM {
  USERS = "USERS",
  CHAT = "CHAT",
}

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

const SidebarHead = ({ currentItem, setCurrentItem }) => {
  return (
    <div className="sidebar--head">
      <SidebarButton value={SIDEBAR_ITEM.USERS} current={currentItem} setValue={setCurrentItem} content={<Person />} />
      <SidebarButton value={SIDEBAR_ITEM.CHAT} current={currentItem} setValue={setCurrentItem} content={<ChatBubble />} />
    </div>
  )
}

const SidebarBody = ({ currentItem }) => {
  return (
    <div className="sidebar--body">
      {currentItem === SIDEBAR_ITEM.USERS && <UserList />}
      {currentItem === SIDEBAR_ITEM.CHAT && <ChatHistory />}
    </div>
  )
}

const UserList = () => {
  // TODO: Need to have selfUserInfo here as well
  const { userInfos } = useContext(UserInfoContext);
  // FIXME: Styling of user list
  return (
    <>
      {/*@ts-ignore */}
      {Object.values(userInfos).map((value: UserInfo, index: number) => (
        <div className="sidebar--userlist-item" key={index}>
          <AvatarDOM
            size="small"
            multiplier={0}
            _backgroundColor={value.avatarColor.background}
            _borderColor={value.avatarColor.border}
            isSelf={false}
            initial={value.name[0]}
            active={value.active}
            mute={value.mute}
          />
          <span>{value.name}</span>
        </div>
      ))
      }
    </>
  )
}

const ChatHistory = () => (<div>Chat History</div>)

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
