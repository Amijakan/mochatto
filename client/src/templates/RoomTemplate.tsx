import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col, Text, Icon, SideDrawer, Button } from "atomize";
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

const RoomTemplate = ({
  children,
  sideDrawerComponent,
}: {
  children: JSX.Element;
  sideDrawerComponent: JSX.Element;
}) => {
  const history = useHistory();
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  return (
    <Div>
      <SideDrawer isOpen={showSideDrawer} onClose={() => setShowSideDrawer(false)}>
        {sideDrawerComponent}
        <Div d="flex" justify="flex-end">
          <Button onClick={() => setShowSideDrawer(false)}>Close</Button>
        </Div>
      </SideDrawer>
      <Div>
        <Row>
          <Col
            size="2"
            d="flex"
            flexDir="row"
            cursor="pointer"
            align="center"
            onClick={() => history.push("/")}
          >
            <Div bg={colors.bg + "AA"} m="0.5rem" rounded="xl" zIndex="20">
              <Logo />
            </Div>
          </Col>
          <Col p="1rem" offset="9" size="1">
            <Div
              bg="black"
              d="flex"
              align="center"
              justify="center"
              m={{ r: "0.5rem", l: "0.5rem", t: "1rem", b: "1rem" }}
              p="0.5rem"
              rounded="xl"
              cursor="pointer"
              zIndex="20"
              onClick={() => setShowSideDrawer(true)}
            >
              <Icon name="SettingsSolid" color="white" />
            </Div>
          </Col>
        </Row>
      </Div>
      {children}
    </Div>
  );
};

export default RoomTemplate;
