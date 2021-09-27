import React from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col, SideDrawer, Button } from "atomize";
import { Logo } from "../components";

const RoomTemplate = ({
  children,
  sideDrawerComponent,
  showSideDrawer,
  setShowSideDrawer,
}: {
  children: JSX.Element;
  sideDrawerComponent: JSX.Element;
  showSideDrawer: boolean;
  setShowSideDrawer: (boolean) => void;
}): JSX.Element => {
  const history = useHistory();
  return (
    <Div
      bgImg="https://img.rawpixel.com/s3fs-private/rawpixel_images/website_content/v996-010-kroiqxy3.jpg?w=1000&dpr=1&fit=default&crop=default&q=65&vib=3&con=3&usm=15&bg=F4F4F3&ixlib=js-2.2.1&s=4b9ae16977c89089d08b6061c9456e2c"
      bgSize="cover"
      position="fixed"
      d="flex"
      flexDir="column"
      h="100vh"
      scroll="no"
      overflow="hidden"
      p={{ b: "1rem" }}
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
            onClick={() => {
              history.push("/");
              history.go(0);
            }}
          >
            <Div bg={"#000000" + "00"} m="0.5rem" rounded="xl" zIndex="20">
              <Logo />
            </Div>
          </Col>
          <Col p="1rem" offset="9" size="1">
          </Col>
        </Row>
      </Div>
      {children}
    </Div>
  );
};

export default RoomTemplate;
