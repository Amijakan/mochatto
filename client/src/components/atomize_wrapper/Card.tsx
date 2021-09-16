import React from "react";
import { Container } from "atomize";

const Card = (
  props: any // eslint-disable-line
): JSX.Element => (
  <Container
    shadow="4"
    p={{ t: "40px", b: "40px" }}
    border="1px solid"
    borderColor="lightgray"
    rounded="xl"
    d="flex"
    justify="center"
    {...props}
  />
);
export default Card;
