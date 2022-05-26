import React, { FunctionComponent } from "react";
import { Button, Div, Icon } from "atomize";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";

import PropTypes from "prop-types";

type ButtonsBarProps = {
  onSettingsClicked: () => void,
  onStatusClicked: () => void,
  onMuteClicked: () => void,
  onLeaveClicked: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userInfoRef: any,
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
  
  const SettingsButton = () => {
    const { onSettingsClicked } = props;

    return (
      <Button title="Settings (,)" {...defaultButtonStyle} onClick={onSettingsClicked}>
        <Icon name="SettingsSolid" color="white" size="24px" />
      </Button>
    );
  };
    
  const StatusButton = () => {
    const { onStatusClicked, userInfoRef } = props;
    
    return (
      <Button
        title="Status (s)"
        {...defaultButtonStyle}
        textColor={userInfoRef.current.active ? "success700" : "danger700"}
        onClick={onStatusClicked}
      >
        {userInfoRef.current.active ? (
          <Icon name="Status" color="success700" size="22px" />
        ) : (
          <Icon name="RemoveSolid" color="danger700" size="26px" />
        )}
      </Button>
    );
  };
          
  const MuteButton = () => {
    const { onMuteClicked, userInfoRef } = props;

    return (
      <Button title="Toggle mute (m)" {...defaultButtonStyle} onClick={onMuteClicked}>
        {userInfoRef.current.mute ? <MicOffIcon /> : <MicIcon />}
      </Button>
    );
  }
    
  const LeaveButton = () => {
    const { onLeaveClicked } = props;
    
    return (
      <Button
        title="Leave room (L)"
        {...defaultButtonStyle}
        w="4rem"
        onClick={onLeaveClicked}
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

ButtonsBar.propTypes = {
  onSettingsClicked: PropTypes.func.isRequired,
  onLeaveClicked: PropTypes.func.isRequired,
  onMuteClicked: PropTypes.func.isRequired,
  onStatusClicked: PropTypes.func.isRequired,
  userInfoRef: PropTypes.any,
};
              
export default ButtonsBar;