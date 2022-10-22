import React from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col } from "atomize";
import { Logo } from "@/components";
import "./style.scss";
import githubLogo from "../../assets/imgs/GitHub-Mark/PNG/GitHub-Mark-120px-plus.png";


const BaseTemplate = ({ children }: { children: JSX.Element }): JSX.Element => {
  const history = useHistory();
  return (
    <div>
      <div className="header">
          <div
            className="logo"
              onClick={() => {
                history.push("/");
                history.go(0);
              }}
            >
            <Logo className="logo-img" />
          </div>
          <div
            className="github-logo"
              onClick={() => {
                window.open("https://github.com/Amijakan/mochatto", "_blank");
              }}
            >
            <img src={githubLogo} className="github-logo-img"/>
          </div>
      </div>
      {children}
    </div>
  );
};

export default BaseTemplate;
