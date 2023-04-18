import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import Image from "mui-image";
import { isMobile } from "react-device-detect";
import darkModeLogo from "../assets/dark-mode-logo.png";
import lightModeLogo from "../assets/light-mode-logo.png";
import { useAppStore } from "../store/app";
import MigrationVisualizer from "../components/migration-visualizer";

export default function Home() {
  const theme = useTheme();

  const user = useAppStore((state) => state.user);

  return (
    <Container sx={{ textAlign: "center", mx: "auto", mt: 5 }}>
      <Image
        height={isMobile ? 75 : 100}
        fit="contain"
        src={theme.palette.mode === "dark" ? darkModeLogo : lightModeLogo}
      />
      <br />

      <Typography variant="h4">Welcome to</Typography>

      <Typography variant="h2" className="heroText">
        Talking Migration with LaunchDarkly
      </Typography>

      <Box sx={{ py: 2 }} />

      <Typography variant="h4" sx={{ mb: "n1" }}>
        {user?.username}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Container
            sx={{
              height: 600,
              width: "100%",
            }}
          >
            <MigrationVisualizer />
          </Container>
        </Grid>
      </Grid>
    </Container>
  );
}
