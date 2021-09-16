import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col, Icon, SideDrawer, Button } from "atomize";
import { Logo } from "../components";

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
      h="100vh"
      scroll="no"
      overflow="hidden"
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
            <Div bg={"#000000" + "00"} m="0.5rem" rounded="xl" zIndex="20">
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
