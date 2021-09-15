import React from "react";
import { colors } from "../../constants/colors";
import { Button } from "atomize";

const _Button = (props: any) => <Button p="1rem" rounded="xl" bg={colors["fg"]} {...props} />; // eslint-disable-line

export default _Button;
