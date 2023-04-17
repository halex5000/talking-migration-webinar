import { Container } from "@mui/material";
import PropTypes from "prop-types";
import { ReactElement } from "react";

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <Container sx={{ textAlign: "center", mx: "auto" }}>{children}</Container>
  );
}
