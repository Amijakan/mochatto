import React, { useContext } from 'react'
import { UserInfoContext, SocketContext } from "@/contexts";
import { UserInfo } from "@/contexts/UserInfoContext";
import AvatarDOM from "@/components/AvatarCanvas/AvatarDOM"
import { SIOChannel } from "@/shared/socketIO";

const UserList = () => {
  // TODO: Need to have selfUserInfo here as well
  const { userInfos } = useContext(UserInfoContext);
  const { socket } = useContext(SocketContext);
  
  const editName = () => {
    const newName = prompt('Enter new name');
    if (newName) {
      socket.emit(SIOChannel.EDIT_USER_NAME, newName);
    }
  };

  // FIXME: Styling of user list
  return (
    <>
      {(Object.values(userInfos) as UserInfo[]).map((userInfo: UserInfo, index: number) => (
      userInfo.name &&
      <div className="sidebar__userlist-item" key={index}>
        <AvatarDOM
          id={userInfo.id}
          size="small"
          isAudible={false}
          _backgroundColor={userInfo.avatarColor.background}
          _borderColor={userInfo.avatarColor.border}
          isSelf={false}
          initial={userInfo.name[0]}
          active={userInfo.active}
          mute={userInfo.mute}
        />
        <span>{userInfo.name}</span>
        {userInfo.id === socket.id && <button className="edit-btn" onClick={() => editName()}>Edit</button>}
      </div>
      ))}
    </>
  )
}

export default UserList
