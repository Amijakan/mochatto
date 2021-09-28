import React from "react";
import { useHistory } from "react-router-dom";
import { Div, Row, Col, Modal, Button } from "atomize";
import { Logo } from "../components";

const RoomTemplate = ({
  children,
  sideDrawerComponent,
  showModal,
  setShowModal,
}: {
  children: JSX.Element;
  sideDrawerComponent: JSX.Element;
  showModal: boolean;
  setShowModal: (boolean) => void;
}): JSX.Element => {
  const history = useHistory();
  return (
    <Div
      bgImg={process.env.PUBLIC_URL + "/background.jpg"}
      bgSize="cover"
      position="fixed"
      d="flex"
      flexDir="column"
      h="100vh"
      scroll="no"
      overflow="hidden"
      p={{ b: "1rem" }}
    >
      <Div d="inline">
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} h="auto" align="center" rounded="md">
        {sideDrawerComponent}
        <Div d="flex" justify="center" m={{ t: "2rem" }}>
          <Button bg="gray200" textColor="medium" onClick={() => setShowModal(false)}>Close</Button>
        </Div>
      </Modal>
    </Div>
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
          <Col p="1rem" offset="9" size="1"></Col>
        </Row>
      </Div>
      {children}
    </Div>
  );
};

export default RoomTemplate;
