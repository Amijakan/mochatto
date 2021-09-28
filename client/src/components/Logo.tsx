import React from "react";
// Icon from https://icons8.com/icons/set/m
import { Div } from "atomize";
const Logo = ({ height = "20" }: { width?: string; height?: string }): JSX.Element => {
  return (
    <Div d="flex" p="0.7rem" align="center">
      <img
        style={{
          filter: "brightness(100)",
        }}
        height={height}
        src="https://github.com/Amijakan/mochatto/blob/main/logo/logo_light.png?raw=true"
      />
    </Div>
  );
};

export default Logo;
