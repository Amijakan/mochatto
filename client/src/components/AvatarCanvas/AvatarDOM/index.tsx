import React, { useState, useEffect } from "react";
import { Icon } from "atomize";
import MicOffIcon from "@material-ui/icons/MicOff";
import cx from "classnames";

import "./style.scss";

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
}): JSX.Element {
  const [isRendered, setIsRendered] = useState(false);
  function calculateSpecificStyles() {
    return {
      boxShadow: "0 0 0 " + (1 + multiplier * 10).toString() + "px " + _borderColor,
      background: _backgroundColor,
      left: pos[0],
      top: pos[1],
    };
  }

  useEffect(() => {
    setIsRendered(true);
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
      className={cx("avatar", "avatar-outer", { "no-show": !isRendered })}
      onPointerDown={onPointerDown}
      style={calculateSpecificStyles()}
    >
      <div className="avatar-initial">{initial}</div>
      <div className="avatar-active">{renderStatusIcon()}</div>
    </div>
  );
}

const areEqual = (prev, next) => {
  return (
    prev.active === next.active &&
    prev._backgroundColor === next._backgroundColor &&
    prev._borderColor === next._borderColor &&
    prev.pos[0] === next.pos[0] &&
    prev.pos[1] === next.pos[1] &&
    prev.initial === next.initial &&
    prev.active === next.active &&
    prev.mute === next.mute &&
    prev.multiplier === next.multiplier
  );
};

export default React.memo(AvatarDOM, areEqual);
