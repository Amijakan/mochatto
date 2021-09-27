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
          fontSize: "30px",
          cursor: "default",
        }}
      >
        {initial}
      </div>
      {active ? (
        mute ? (
          <div
            style={{
              position: "absolute",
              bottom: "0",
              right: "0",
              width: "25px",
              height: "25px",
              color: "#0000008c",
            }}
          >
            <MicOffIcon />
          </div>
        ) : (
          <></>
        )
      ) : (
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "25px",
            height: "25px",
            background: "white",
            borderRadius: "100%",
          }}
        >
          <Icon name="RemoveSolid" color="danger700" size="25px" />
        </div>
      )}
    </div>
  );
}

export default AvatarDOM;
