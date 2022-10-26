import React from "react";
// Icon from https://icons8.com/icons/set/m
import "./style.scss";

const Logo = ({ className = "" }: { className?: string }): JSX.Element => {
  return (
    <img
    className={className}
      src="https://github.com/Amijakan/mochatto/blob/main/logo/logo_light.png?raw=true"
    />
  );
};

export default Logo;
