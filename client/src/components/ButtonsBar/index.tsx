import React, { FunctionComponent } from "react";
import { Button } from "@/components"
import { Div, Icon } from "atomize";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";

import PropTypes from "prop-types";

type ButtonsBarProps = {
  onSettingsClicked: () => void;
  onStatusClicked: () => void;
  onMuteClicked: () => void;
  onLeaveClicked: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  userInfoRef: any;
};

const ButtonsBar: FunctionComponent<ButtonsBarProps> = (props) => {
  const SettingsButton = () => {
    const { onSettingsClicked } = props;

    return (
      <Button
        className="circle"
        title="Settings (,)" onClick={onSettingsClicked}>
        <Icon name="SettingsSolid" color="white" size="24px" />
      </Button>
    );
  };

  const StatusButton = () => {
    const { onStatusClicked, userInfoRef } = props;

    return (
      <Button
        className="circle"
        title="Status (s)"
        onClick={onStatusClicked}
      >
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
      <Button className="circle" title="Toggle mute (m)" onClick={onMuteClicked}>
        {userInfoRef.current.mute ? <MicOffIcon /> : <MicIcon />}
      </Button>
    );
  };

  const LeaveButton = () => {
    const { onLeaveClicked } = props;

    return (
      <Button
        className="cirle color-red"
        title="Leave room (L)"
        onClick={onLeaveClicked}
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

const areEqual = (prev, next): boolean => {
  return (prev.userInfoRef.current === next.userInfoRef.current &&
    prev.onSettingsClicked === next.onSettingsClicked &&
    prev.onStatusClicked === next.onStatusClicked &&
    prev.onMuteClicked === next.onMuteClicked &&
    prev.onLeaveClicked === next.onLeaveClicked)
}

export default React.memo(ButtonsBar, areEqual);
