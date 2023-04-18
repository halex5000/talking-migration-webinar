import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import Image from "mui-image";
import { isMobile } from "react-device-detect";
import darkModeLogo from "../assets/dark-mode-logo.png";
import lightModeLogo from "../assets/light-mode-logo.png";
import { useAppStore } from "../store/app";
import MigrationVisualizer from "../components/migration-visualizer";
import DataVisualizer from "../components/data-viewer";

export default function Home() {
  const theme = useTheme();

  const user = useAppStore((state) => state.user);

  return (
    <Grid
      container
      sx={{ textAlign: "center", mx: "auto", mt: 3, width: "100vw" }}
    >
      <Grid item xs={12}>
        <Image
          height={isMobile ? 75 : 100}
          fit="contain"
          src={theme.palette.mode === "dark" ? darkModeLogo : lightModeLogo}
        />

        <Typography variant="h4">Welcome to</Typography>

        <Typography variant="h2" className="heroText">
          Talking Migration with LaunchDarkly
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Container
          sx={{
            height: 450,
            width: "100%",
          }}
        >
          <MigrationVisualizer />
        </Container>
      </Grid>
      <Grid item xs={6}>
        <DataVisualizer />
      </Grid>
    </Grid>
  );
}
