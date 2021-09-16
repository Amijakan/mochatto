import React, { useEffect } from "react";
import AvatarDOM from "./AvatarDOM";
import { UserInfo, defaultUserInfo } from "../contexts/UserInfoContext";

// for dragging and rendering avatars
function AvatarCanvas({
  selfPosition,
  setSelfPosition,
  positions,
  userInfos,
  selfUserInfo,
  setSelfUserInfo,
}: {
  selfPosition: [number, number];
  setSelfPosition: (any) => void;
  positions: [number, number][];
  userInfos: UserInfo[];
  selfUserInfo: UserInfo;
  setSelfUserInfo: (any) => void;
}): JSX.Element {
  let offset;

  // on mouse down, add listeners for moving and mouse up
  const _onPointerDown = (event) => {
    offset = [event.clientX - selfPosition[0], event.clientY - selfPosition[1]];
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
    setSelfPosition([mousePos[0] - offset[0], mousePos[1] - offset[1]]);
  };

  // returns a randomly generated pastel color
  const getColor = (random: number, lighteness: number) => {
    return "hsl(" + 360 * random + "," + (30 + 70 * random) + "%," + 70 * lighteness + "%)";
  };

  useEffect(() => {
    const random = Math.random();
    const background = getColor(random, 1);
    const border = getColor(random, 1.2);
    setSelfUserInfo({ ...selfUserInfo, avatarColor: { background, border } });
  }, []);

  return (
    <>
      <AvatarDOM
        key={0}
        multiplier={selfUserInfo.multiplier}
        onPointerDown={_onPointerDown}
        _backgroundColor={selfUserInfo.avatarColor?.background || "black"}
        _borderColor={selfUserInfo.avatarColor?.border || "gray"}
        pos={selfPosition}
        isSelf={true}
        initial={selfUserInfo.name[0]}
      />
      {positions.map((position, index) => {
        let info = userInfos[index];
        console.log("Info", info);
        if (!info) {
          info = defaultUserInfo;
        }
        return (
          <AvatarDOM
            key={index + 1}
            multiplier={info.multiplier}
            onPointerDown={() => {
              console.log("not your avatar!");
            }}
            _backgroundColor={info.avatarColor?.background || "black"}
            _borderColor={info.avatarColor?.border || "gray"}
            pos={position}
            isSelf={false}
            initial={info.name ? info.name[0] : ""}
          />
        );
      })}
    </>
  );
}

export default AvatarCanvas;
