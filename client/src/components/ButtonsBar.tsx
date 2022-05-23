import React, { FunctionComponent } from "react";
import { Button, Div, Icon } from "atomize";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";

type ButtonsBarProps = {
  settingsCallback: () => void,
  statusCallback: () => void,
  muteCallback: () => void,
  leaveCallback: () => void,
  userInfoRef: any
}

export const ButtonsBar: FunctionComponent<ButtonsBarProps> = (props) => {
  const defaultButtonStyle = {
    p: "1rem",
    m: "0.3rem",
    bg: "none",
    h: "2.5rem",
    w: "2.5rem",
    hoverBg: "#ffffff29",
    rounded: "circle",
  };
  
  function SettingsButton() {
    const { settingsCallback } = props;
    
    return (
      <Button title="Settings (,)" {...defaultButtonStyle} onClick={settingsCallback}>
        <Icon name="SettingsSolid" color="white" size="24px" />
      </Button>
    );
  };
    
  function StatusButton() {
    const { statusCallback, userInfoRef } = props;
    
    return (
      <Button
        title="Status (s)"
        {...defaultButtonStyle}
        textColor={userInfoRef.current.active ? "success700" : "danger700"}
        onClick={statusCallback}
      >
        {userInfoRef.current.active ? (
          <Icon name="Status" color="success700" size="22px" />
        ) : (
          <Icon name="RemoveSolid" color="danger700" size="26px" />
        )}
      </Button>
    );
  };
          
  function MuteButton() {
    const { muteCallback, userInfoRef } = props;
    
    return (
      <Button title="Toggle mute (m)" {...defaultButtonStyle} onClick={muteCallback}>
        {userInfoRef.current.mute ? <MicOffIcon /> : <MicIcon />}
      </Button>
    );
  }
    
  function LeaveButton() {
    const { leaveCallback } = props;
    
    return (
      <Button
        title="Leave room (L)"
        {...defaultButtonStyle}
        w="4rem"
        onClick={leaveCallback}
        textColor="red"
      >
        Leave
      </Button>
    );
  };
  
  return (
    <Div d="flex" h="100%" flexDir="column">
      <Div d="flex" justify="center" m={{ t: "auto" }}>
        <Div d="inline-block">
          <Div rounded="circle" bg="#000000ba" d="flex" p={{ x: "1rem", y: "0.3rem" }}>
            {SettingsButton()}
            {StatusButton()}
            {MuteButton()}
            {LeaveButton()}
          </Div>
        </Div>
      </Div>
    </Div>
  );
 };
              
export default ButtonsBar;