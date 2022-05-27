import React, { useEffect } from "react";
import { Icon } from "atomize";
import MicOffIcon from "@material-ui/icons/MicOff";
import cx from "classnames";

import "./AvatarDOM.scss";

function AvatarDOM({
  onPointerDown,
  pos,
  isSelf,
  multiplier = 1,
  _backgroundColor,
  _borderColor,
  initial,
  active,
  mute,
  id,
}: {
  onPointerDown: (PointerEvent) => void;
  pos: [number, number];
  isSelf: boolean;
  multiplier?: number;
  _backgroundColor: string;
  _borderColor: string;
  initial: string;
  active: boolean;
  mute: boolean;
  id: string;
}): JSX.Element {
  function calculateSpecificStyles() {
    return {
      boxShadow: "0 0 0 " + (1 + multiplier * 10).toString() + "px " + _borderColor,
      background: _backgroundColor,
      left: pos[0],
      top: pos[1],
    };
  }

  useEffect(() => {
    const avatardom = document.querySelector(".avatar");
    if (avatardom) {
      if (isSelf) {
        (avatardom as HTMLElement).style.zIndex = "1";
      }
    }
  }, []);

  function renderStatusIcon() {
    if (!active) {
      return <Icon className="active-icon" name="RemoveSolid" color="danger700" size="1.5rem" />;
    } else if (mute) {
      return <MicOffIcon />;
    }

    return null;
  }

  return (
    <div
      id={"avatar-" + id}
      className={cx("avatar", "avatar-outer")}
      onPointerDown={onPointerDown}
      style={calculateSpecificStyles()}
    >
      <div className="avatar-initial">{initial}</div>
      <div className="avatar-active">{renderStatusIcon()}</div>
      <div id={"avatar-video-" + id} style={{ overflow: "hidden" }}></div>
    </div>
  );
}

export default AvatarDOM;
