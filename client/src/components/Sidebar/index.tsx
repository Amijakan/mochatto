import React, { useState, useContext } from 'react'
import "./style.scss"
import { UserInfoContext } from "../../contexts";
import { UserInfo } from "../../contexts/UserInfoContext";
import { Person, ChatBubble } from "@material-ui/icons";
import AvatarDOM from "@/components/AvatarCanvas/AvatarDOM"

enum Utils {
  USERS = "USERS",
  CHAT = "CHAT",
}

const UtilButton = ({ value, current, setValue, content }) => {
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


const UtilButtons = ({ currentUtil, setCurrentUtil }) => {
  return (
    <div className="sidebar--buttons">
      <UtilButton value={Utils.USERS} current={currentUtil} setValue={setCurrentUtil} content={<Person />} />
      <UtilButton value={Utils.CHAT} current={currentUtil} setValue={setCurrentUtil} content={<ChatBubble />} />
    </div>
  )
}

const UtilBody = ({ currentUtil }) => {
  return (
    <div className="sidebar--body">
      {currentUtil === Utils.USERS && <UserList />}
      {currentUtil === Utils.CHAT && <ChatHistory />}
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
  const [currentUtil, setCurrentUtil] = useState<Utils | null>(null)

  return (
    <div
      className="sidebar"
      onClick={() => setIsOpen(!isOpen)}
      data-open={currentUtil ? "open" : "close"}
      data-duration="1s"
    >
      <UtilButtons currentUtil={currentUtil} setCurrentUtil={setCurrentUtil} />
      {currentUtil ? <UtilBody currentUtil={currentUtil} /> : <></>}
    </div>
  )

}

export default React.memo(SideBar)
