import React from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col } from "atomize";
import { colors } from "../constants/colors";
import { Logo } from "../components";

const BaseTemplate = ({ children }: { children: JSX.Element }): JSX.Element => {
  const history = useHistory();
  return (
    <Div>
      <Div bg={colors.bg}>
        <Row>
          <Col
            size="2"
            d="flex"
            flexDir="row"
            cursor="pointer"
            align="center"
            onClick={() => history.push("/")}
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
