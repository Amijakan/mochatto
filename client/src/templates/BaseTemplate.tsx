import React from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col, Text, Icon } from "atomize";
import { colors } from "../constants/colors";

const Logo = () => {
  return (
    <Div p="1rem" d="flex" align="center">
      <Icon size="30px" name="Location" h="1rem" m={{ r: "1rem" }} color={colors.fg} />
      <Text textSize="15px" textWeight="700" textColor={colors.fg}>
        mochatto
      </Text>
    </Div>
  );
};

const BaseTemplate = ({ children }: { children: JSX.Element }) => {
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
