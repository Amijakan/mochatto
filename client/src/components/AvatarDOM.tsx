import React, { useEffect } from "react";
import { Icon } from "atomize";
import MicOffIcon from "@material-ui/icons/MicOff";

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
  useEffect(() => {
    const avatardom = document.querySelector(".avatar");
    if (avatardom) {
      if (isSelf) {
        (avatardom as HTMLElement).style.zIndex = "1";
      }
    }
  }, []);

  return (
    <div
      className="avatar"
      onPointerDown={onPointerDown}
      style={{
        touchAction: "none",
        width: "5rem",
        height: "5rem",
        borderRadius: "100%",
        boxShadow: "0 0 0 " + (1 + multiplier * 10).toString() + "px " + _borderColor,
        background: _backgroundColor,
        position: "absolute",
        display: "table",
        left: pos[0],
        top: pos[1],
      }}
    >
      <div
        style={{
          userSelect: "none",
          color: "white",
          verticalAlign: "middle",
          textAlign: "center",
          display: "table-cell",
          fontFamily: "helvetica",
          fontSize: "2.5rem",
          cursor: "default",
        }}
      >
        {initial}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "0",
          right: "0",
          width: "1.7rem",
          height: "1.7rem",
        }}
      >
        {active ? (
          mute ? (
            <MicOffIcon />
          ) : (
            <></>
          )
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "100%",
              width: "100%",
              height: "100%",
            }}
          >
            <Icon name="RemoveSolid" color="danger700" size="1.7rem" />
          </div>
        )}
      </div>
    </div>
  );
}

export default AvatarDOM;
