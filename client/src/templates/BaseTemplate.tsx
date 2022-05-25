import React from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col } from "atomize";
import { Logo } from "@/components";

const BaseTemplate = ({ children }: { children: JSX.Element }): JSX.Element => {
  const history = useHistory();
  return (
    <Div>
      <Div shadow="2">
        <Row>
          <Col
            size="2"
            d="flex"
            flexDir="row"
            cursor="pointer"
            align="center"
            onClick={() => {
              history.push("/");
              history.go(0);
            }}
          >
            <Logo />
          </Col>
        </Row>
      </Div>
      {children}
    </Div>
  );
};

export default BaseTemplate;
