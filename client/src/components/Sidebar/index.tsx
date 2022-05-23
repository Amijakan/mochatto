import React, { useState, useContext } from 'react'
import "./style.scss"
import { UserInfoContext } from "../../contexts";
import { Person, ChatBubble, Close } from "@material-ui/icons";

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
    <div className="sidebar--buttons"
      data-open={currentUtil ? "open" : "close"}
    >
      <UtilButton value={Utils.USERS} current={currentUtil} setValue={setCurrentUtil} content={<Person />} />
      <UtilButton value={Utils.CHAT} current={currentUtil} setValue={setCurrentUtil} content={<ChatBubble />} />
    </div>
  )
}

const UtilBody = ({ currentUtil }) => {
  const { userInfos } = useContext(UserInfoContext);
  return (
    <div className="sidebar--body" data-util={currentUtil}>
      {Object.values(userInfos).map(item => (
        <div>{item.name}</div>
      )
      )}
    </div>
  )

}

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

export default SideBar
