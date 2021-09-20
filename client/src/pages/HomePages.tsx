import React from "react";
import { BaseTemplate } from "../templates";
import { Div } from "atomize";
import { Button, Card, Text } from "../components/atomize_wrapper";

const HomePage = (): JSX.Element => {
  return (
    <BaseTemplate>
      <Div justify="space-around" p="5rem" align="center">
        <Text textColor="#212121" textAlign="center" textSize="5rem" textWeight="700">
          <Div>Your open-source</Div>
          <Div>virtual meeting space</Div>
        </Text>
        <Div p="3.5rem">
          <Text textColor="#404040" textAlign="center" textSize="2rem" textWeight="400">
            A peer-to-peer voice chat app focused on simplicity.
          </Text>
        </Div>
        <Button
          align="center"
          w="45%"
          onClick={() => {
            console.log("hi");
          }}
        >
          Join
        </Button>
      </Div>
    </BaseTemplate>
  );
};

export default HomePage;
