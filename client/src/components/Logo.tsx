import React from "react";
// Icon from https://icons8.com/icons/set/m
import { Div } from "atomize";
const Logo = ({ height = "50" }: { width?: string; height?: string }): JSX.Element => {
  return (
    <Div d="flex" align="center">
      <img
        height={height}
        src="https://github.com/Amijakan/mochatto/blob/main/logo/logo_both.png?raw=true"
      />
    </Div>
  );
};

export default Logo;
