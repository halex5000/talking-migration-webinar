import {
  AppBar,
  Box,
  Button,
  Container,
  Grid,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "mui-image";
import { isMobile } from "react-device-detect";
import darkModeLogo from "../assets/dark-mode-logo.png";
import lightModeLogo from "../assets/light-mode-logo.png";
import MigrationVisualizer from "../components/migration-visualizer";
import DataVisualizer from "../components/data-visualizer";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import { useState } from "react";
import LoginDialog from "../components/login-dialog";
import { useAppStore } from "../store/app";

export default function Home() {
  const theme = useTheme();
  const { login, dataDebugPanel, captureLocationData } = useFlags();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const handleLoginClose = () => {
    setIsLoginOpen(false);
  };

  const client = useLDClient();

  return (
    <Grid
      container
      sx={{ textAlign: "center", mx: "auto", mt: 3, width: "100vw" }}
    >
      {login && (
        <>
          <AppBar variant="elevation" elevation={0}>
            <Toolbar>
              <Grid container>
                <Grid item xs={11}></Grid>
                <Grid item xs={1}>
                  {user ? (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => {
                        client?.identify({
                          ...client.getContext(),
                          name: undefined,
                        });
                        logout();
                      }}
                    >
                      Logout
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => {
                        setIsLoginOpen(true);
                      }}
                    >
                      Login
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
          <LoginDialog isOpen={isLoginOpen} handleClose={handleLoginClose} />
        </>
      )}
      <Container sx={{ mt: 6 }}>
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
      </Container>
      <Grid item xs={dataDebugPanel ? 6 : 12}>
        <Container
          sx={{
            height: 450,
            width: "100%",
          }}
        >
          <MigrationVisualizer />
        </Container>
      </Grid>
      {dataDebugPanel ? (
        <Grid item xs={6}>
          <DataVisualizer />
        </Grid>
      ) : (
        <></>
      )}
    </Grid>
  );
}
