import React, { useEffect } from "react";
import AvatarDOM from "./AvatarDOM";
import { UserInfo, defaultUserInfo } from "@/contexts/UserInfoContext";

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
  let offset;

  // on mouse down, add listeners for moving and mouse up
  const _onPointerDown = (event) => {
    offset = [event.clientX - selfUserInfo.position[0], event.clientY - selfUserInfo.position[1]];
    document.addEventListener("pointermove", _onPointerMove, true);
    document.addEventListener("pointerup", _onPointerUp, true);
    event.preventDefault();
  };

  // remove listeners on mouse up
  const _onPointerUp = () => {
    document.removeEventListener("pointermove", _onPointerMove, true);
    document.removeEventListener("pointerup", _onPointerUp, true);
  };

  // update mouse position on move
  const _onPointerMove = (event) => {
    // world coordinate
    const mousePos = [event.clientX, event.clientY];
    const position = [mousePos[0] - offset[0], mousePos[1] - offset[1]];
    setSelfUserInfo({ position });
  };

  // returns a randomly generated pastel color
  const getColor = (random: number, lighteness: number, transparency: number) => {
    return "hsla(" + 360 * random + "," + (30 + 70 * random) + "%," + 70 * lighteness + "%, " + transparency + ")";
  };

  useEffect(() => {
    const random = Math.random();
    const background = getColor(random, 1, 1);
    const border = getColor(random, 1.2, 0.6);
    setSelfUserInfo({ avatarColor: { background, border } });
  }, []);

  return (
    <>
      <AvatarDOM
        key={0}
        multiplier={selfUserInfo.multiplier}
        onPointerDown={_onPointerDown}
        _backgroundColor={selfUserInfo.avatarColor.background}
        _borderColor={selfUserInfo.avatarColor.border}
        pos={selfUserInfo.position}
        isSelf={true}
        initial={selfUserInfo.name[0]}
        active={selfUserInfo.active}
        mute={selfUserInfo.mute}
        id={selfUserInfo.id}
      />
      {userInfos.map((info, index) => {
        if (!info) {
          info = defaultUserInfo;
        }
        return (
          <AvatarDOM
            key={index + 1}
            multiplier={info.multiplier}
            onPointerDown={() => {
              console.debug("not your avatar!");
            }}
            _backgroundColor={info.avatarColor.background}
            _borderColor={info.avatarColor.border}
            pos={info.position}
            isSelf={false}
            initial={info.name[0]}
            active={info.active}
            mute={info.mute}
            id={info.id}
          />
        );
      })}
    </>
  );
}

export default AvatarCanvas;
