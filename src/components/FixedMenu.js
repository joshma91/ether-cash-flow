import React from "react";
import {
  Container,
  Menu,
  Modal,
  Button,
  Grid,
  Image,
  Header
} from "semantic-ui-react";

export const FixedMenu = () => (
  <Menu style={{ height: "90px" }} fixed="top" inverted>
    <Container>
      <Menu.Item as="h2" header>
        Ether Cash Flow Tool
      </Menu.Item>

      <Menu.Item
        as="a"
        target="_"
        href="https://github.com/joshma91"
        position="right"
      >
        By Josh Ma
      </Menu.Item>
    </Container>
  </Menu>
);


export default FixedMenu;
