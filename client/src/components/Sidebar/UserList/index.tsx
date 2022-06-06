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

export default UserList
