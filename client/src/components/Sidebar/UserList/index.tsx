import React, { useContext } from 'react'
import { UserInfoContext } from "@/contexts";
import { UserInfo } from "@/contexts/UserInfoContext";
import AvatarDOM from "@/components/AvatarCanvas/AvatarDOM"

const UserList = () => {
  // TODO: Need to have selfUserInfo here as well
  const { userInfos } = useContext(UserInfoContext);
  // FIXME: Styling of user list
  return (
    <>
      {(Object.values(userInfos) as UserInfo[]).map((userInfo: UserInfo, index: number) => (
      userInfo.name &&
      <div className="sidebar__userlist-item" key={index}>
        <AvatarDOM
          id={userInfo.id}
          size="small"
          multiplier={0}
          _backgroundColor={userInfo.avatarColor.background}
          _borderColor={userInfo.avatarColor.border}
          isSelf={false}
          initial={userInfo.name[0]}
          active={userInfo.active}
          mute={userInfo.mute}
        />
        <span>{userInfo.name}</span>
      </div>
      ))}
    </>
  )
}

export default UserList
