import React, { useEffect } from "react";
import AvatarDOM from "./AvatarDOM";
import { UserInfo } from "./contexts/UserInfoContext";

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
  const _onMouseDown = (event) => {
    offset = [event.clientX - selfPosition[0], event.clientY - selfPosition[1]];
    document.addEventListener("mousemove", _onMouseMove, true);
    document.addEventListener("mouseup", _onMouseUp, true);
    event.preventDefault();
  };

  // remove listeners on mouse up
  const _onMouseUp = () => {
    document.removeEventListener("mousemove", _onMouseMove, true);
    document.removeEventListener("mouseup", _onMouseUp, true);
  };

  // update mouse position on move
  const _onMouseMove = (event) => {
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
        onMouseDown={_onMouseDown}
        _backgroundColor={selfUserInfo.avatarColor.background}
        _borderColor={selfUserInfo.avatarColor.border}
        pos={selfPosition}
        isSelf={true}
        initial={selfUserInfo.name[0]}
      />
      {positions.map((position, index) => {
        let info = userInfos[index];
        if (!info) {
          info = { name: "default", avatarColor: { background: "black", border: "gray" } };
        }
        return (
          <AvatarDOM
            key={index + 1}
            onMouseDown={() => {
              console.log("not your avatar!");
            }}
            _backgroundColor={info.avatarColor.background}
            _borderColor={info.avatarColor.border}
            pos={position}
            isSelf={false}
            initial={info.name[0]}
          />
        );
      })}
    </>
  );
}

export default AvatarCanvas;
