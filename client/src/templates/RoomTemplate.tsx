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
}): JSX.Element => {
  const history = useHistory();
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  return (
    <Div
      bgImg="https://img.rawpixel.com/s3fs-private/rawpixel_images/website_content/v996-010-kroiqxy3.jpg?w=1000&dpr=1&fit=default&crop=default&q=65&vib=3&con=3&usm=15&bg=F4F4F3&ixlib=js-2.2.1&s=4b9ae16977c89089d08b6061c9456e2c"
      bgSize="cover"
      position="fixed"
      h="98vh"
    >
      <SideDrawer isOpen={showSideDrawer} onClose={() => setShowSideDrawer(false)} h="100%">
        {sideDrawerComponent}
        <Div d="flex" justify="flex-end" align="flex-end" m={{ t: "2rem" }}>
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
          <Col p="1rem" offset="8" size="1">
            <Div
              bg="black"
              d="flex"
              align="center"
              justify="center"
              m={{ r: 0, l: "0.5rem", t: "1rem", b: "1rem" }}
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
