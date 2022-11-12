import React, { FunctionComponent } from "react";
import { Button } from "@/components";
import { Div, Icon } from "atomize";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import ScreenShareIcon from "@material-ui/icons/ScreenShare";
import StopScreenShareIcon from "@material-ui/icons/StopScreenShare";
import "./style.scss";

import PropTypes from "prop-types";

type ButtonsBarProps = {
  onSettingsClicked: () => void;
  onStatusClicked: () => void;
  onMuteClicked: () => void;
  onScreenShareClicked: () => void;
  onLeaveClicked: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userInfoRef: any;
};

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const ButtonsBar: FunctionComponent<ButtonsBarProps> = (props) => {
  const SettingsButton = () => {
    const { onSettingsClicked } = props;

    return (
      <Button title="Settings (,)" onClick={onSettingsClicked}>
        <Icon name="SettingsSolid" color="white" size="24px" />
      </Button>
    );
  };

  const StatusButton = () => {
    const { onStatusClicked, userInfoRef } = props;

    return (
      <Button title="Status (s)" onClick={onStatusClicked}>
        {userInfoRef.current.active ? (
          <Icon name="Status" color="success700" size="24px" />
        ) : (
          <Icon name="RemoveSolid" color="danger700" size="24px" />
        )}
      </Button>
    );
  };

  const MuteButton = () => {
    const { onMuteClicked, userInfoRef } = props;

    return (
      <Button title="Toggle mute (m)" onClick={onMuteClicked}>
        {userInfoRef.current.mute ? <MicOffIcon /> : <MicIcon />}
      </Button>
    );
  };

  const ScreenShareButton = () => {
    const { onScreenShareClicked, userInfoRef } = props;
    return (
      <Button title="Screen sharing" onClick={onScreenShareClicked}>
        {userInfoRef.current.isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
      </Button>
    );
  };

  const LeaveButton = () => {
    const { onLeaveClicked } = props;

    return (
      <Button className="leave-button" title="Leave room (L)" onClick={onLeaveClicked}>
        Leave
      </Button>
    );
  };

  return (
    <div className="buttons-bar-wrapper">
      <div className="buttons-bar">
        {SettingsButton()}
        {StatusButton()}
        {MuteButton()}
        {!isMobile && ScreenShareButton()}
        {LeaveButton()}
      </div>
    </div>
  );
};

ButtonsBar.propTypes = {
  onSettingsClicked: PropTypes.func.isRequired,
  onStatusClicked: PropTypes.func.isRequired,
  onMuteClicked: PropTypes.func.isRequired,
  onScreenShareClicked: PropTypes.func.isRequired,
  onLeaveClicked: PropTypes.func.isRequired,
  userInfoRef: PropTypes.any,
};

const areEqual = (prev, next): boolean => {
  return (
    prev.userInfoRef.current === next.userInfoRef.current &&
    prev.onSettingsClicked === next.onSettingsClicked &&
    prev.onStatusClicked === next.onStatusClicked &&
    prev.onMuteClicked === next.onMuteClicked &&
    prev.onScreenShareClicked === next.onScreenShareClicked &&
    prev.onLeaveClicked === next.onLeaveClicked
  );
};

export default React.memo(ButtonsBar, areEqual);
