import React, { useRef, useCallback, useEffect, useContext } from "react";
import { SocketContext } from "@/contexts";
import AvatarDOM from "./AvatarDOM";
import { UserInfo, defaultUserInfo } from "@/contexts/UserInfoContext";
import { Draggable } from "@/components";

// for dragging and rendering avatars
function AvatarCanvas({
  userInfos,
  selfUserInfo,
  setSelfUserInfo,
}: {
  userInfos: UserInfo[];
  selfUserInfo: UserInfo;
  setSelfUserInfo: (any) => void;
}): JSX.Element {
  const { socket } = useContext(SocketContext);
  const selfPositionRef = useRef({ x: 100, y: 100 })

  // on mouse down, add listeners for moving and mouse up

  const updatePosition = useCallback((position: { x: number, y: number }) => {
    selfPositionRef.current = position
    setSelfUserInfo({ ...selfUserInfo, position: [position.x, position.y] })
  }, [selfUserInfo])


  // returns a randomly generated pastel color
  const getColor = (random: number, lighteness: number, transparency: number) => {
    return "hsla(" + 360 * random + "," + (30 + 70 * random) + "%," + 70 * lighteness + "%, " + transparency + ")";
  };

  useEffect(() => {
    const random = Math.random();
    const background = getColor(random, 1, 1);
    const border = getColor(random, 1.2, 0.6);
    setSelfUserInfo({ ...selfUserInfo, avatarColor: { background, border } });
  }, []);

  return (
    <>
      <Draggable position={selfPositionRef.current} updatePosition={updatePosition} isDraggable={true}>
        <AvatarDOM
          key={0}
          multiplier={selfUserInfo.multiplier}
          _backgroundColor={selfUserInfo.avatarColor.background}
          _borderColor={selfUserInfo.avatarColor.border}
          isSelf={true}
          initial={selfUserInfo.name[0]}
          active={selfUserInfo.active}
          mute={selfUserInfo.mute}
        />
      </Draggable>
      {
        userInfos.filter(info => info.id !== socket.id).map((info, index) => {
          console.log(info.id, info.position)
          if (!info) {
            info = defaultUserInfo;
          }
          return (
            <Draggable position={{ x: info.position[0], y: info.position[1] }} updatePosition={null} isDraggable={false}>
              <AvatarDOM
                key={index + 1}
                multiplier={info.multiplier}
                _backgroundColor={info.avatarColor.background}
                _borderColor={info.avatarColor.border}
                isSelf={false}
                initial={info.name[0]}
                active={info.active}
                mute={info.mute}
              />
            </Draggable>
          );
        })
      }
    </>
  );
}

export default AvatarCanvas;
