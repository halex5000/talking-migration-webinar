import { Box, Container, Grid, Typography, useTheme } from "@mui/material";
import React from "react";
import Image from "mui-image";
import { isMobile } from "react-device-detect";
import darkModeLogo from "../assets/dark-mode-logo.png";
import lightModeLogo from "../assets/light-mode-logo.png";
import { useAppStore } from "../store/app";

export default function Home() {
  const theme = useTheme();

  const user = useAppStore((state) => state.user);

  return (
    <Container sx={{ textAlign: "center", mx: "auto", mt: 5 }}>
      <Image
        height={isMobile ? 100 : 150}
        fit="contain"
        src={theme.palette.mode === "dark" ? darkModeLogo : lightModeLogo}
      />
      <br />

      <Typography variant="h4" sx={{ mt: 5 }}>
        Welcome to
      </Typography>

      <Typography variant="h2" className="heroText">
        Talking Migration with LaunchDarkly
      </Typography>

      <Box sx={{ py: 2 }} />

      <Typography variant="h4" sx={{ mb: "n1" }}>
        {user?.username}
      </Typography>

      <Box sx={{ py: 4 }} />

      <Grid container spacing={2}>
        <Grid item xs={2} />
        <Grid item xs={8}></Grid>
      </Grid>
    </Container>
  );
}
