import React, { useState, useEffect } from "react";
import { Icon } from "atomize";
import MicOffIcon from "@material-ui/icons/MicOff";
import cx from "classnames";

import "./style.scss";

function AvatarDOM({
  isSelf,
  multiplier = 1,
  _backgroundColor,
  _borderColor,
  initial,
  active,
  mute,
  id,
}: {
  isSelf: boolean;
  multiplier?: number;
  _backgroundColor: string;
  _borderColor: string;
  initial: string;
  active: boolean;
  mute: boolean;
  id: string;
}): JSX.Element {
  const [isRendered, setIsRendered] = useState(false);
  function calculateSpecificStyles() {
    return {
      boxShadow: "0 0 0 " + multiplier.toString() + "rem " + _borderColor,
      background: _backgroundColor,
    };
  }

  useEffect(() => {
    setIsRendered(true);
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
      className={cx("avatar", "avatar-outer", { "no-show": !isRendered })}
      data-self={isSelf && "self"}
      style={calculateSpecificStyles()}
    >
      <div className="avatar-initial">{initial}</div>
      <div className="avatar-active">{renderStatusIcon()}</div>
      <div className="video-container" id={"avatar-video-" + id}></div>
    </div>
  );
}

const areEqual = (prev, next) => {
  return (
    prev.active === next.active &&
    prev._backgroundColor === next._backgroundColor &&
    prev._borderColor === next._borderColor &&
    prev.initial === next.initial &&
    prev.active === next.active &&
    prev.mute === next.mute &&
    prev.multiplier === next.multiplier
  );
};

export default React.memo(AvatarDOM, areEqual);
