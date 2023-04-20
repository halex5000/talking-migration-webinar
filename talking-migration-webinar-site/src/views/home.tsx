import {
  AppBar,
  Box,
  Button,
  ButtonGroup,
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
import { useEffect, useState } from "react";
import LoginDialog from "../components/login-dialog";
import { useAppStore } from "../store/app";

export default function Home() {
  const theme = useTheme();

  // using the React hooks to get feature flags
  const { login, dataDebugPanel } = useFlags();

  // getting a handle to the LaunchDarkly client so we can add to the context
  const client = useLDClient();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);

  const handleLoginClose = () => {
    setIsLoginOpen(false);
  };

  // here we're observing changes to the feature flag to remove user
  // name from context when the feature is disabled
  useEffect(() => {
    if (!login) {
      client?.identify({
        ...client.getContext(),
        name: undefined,
      });
    }
  }, [login]);

  return (
    <Grid
      container
      sx={{ textAlign: "center", mx: "auto", mt: 3, width: "100vw" }}
    >
      {login || dataDebugPanel ? (
        <>
          <AppBar variant="elevation" elevation={0}>
            <Toolbar>
              <Grid container>
                <Grid item xs={1}>
                  {user ? `Hello ${user.username}` : null}
                </Grid>
                <Grid item xs={dataDebugPanel ? 9 : 10}></Grid>
                <Grid item xs={dataDebugPanel ? 2 : 1}>
                  {dataDebugPanel ? (
                    <Button
                      onClick={() => {
                        setIsDebugOpen(!isDebugOpen);
                      }}
                      sx={{ m: 1 }}
                      variant="contained"
                      color="warning"
                    >
                      Debug
                    </Button>
                  ) : null}
                  {login ? (
                    <>
                      {user ? (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => {
                            /***********/

                            // clearing the username from the context on logout
                            client?.identify({
                              ...client.getContext(),
                              name: undefined,
                            });

                            /***********/
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
                    </>
                  ) : null}
                </Grid>
              </Grid>
            </Toolbar>
          </AppBar>
          <LoginDialog isOpen={isLoginOpen} handleClose={handleLoginClose} />
        </>
      ) : (
        <></>
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
      ``
      {/* 
          an example of a gated react component
          dataDebugPanel is a LaunchDarkly feature flag and controls the visibility of this component
      */}
      {isDebugOpen && dataDebugPanel ? (
        <Grid item xs={12}>
          <Container
            sx={{
              height: 500,
              width: "100%",
            }}
          >
            <MigrationVisualizer />
          </Container>
        </Grid>
      ) : (
        <Grid item xs={12}>
          <Container
            sx={{
              height: 500,
              width: "100%",
            }}
          >
            <MigrationVisualizer />
          </Container>
        </Grid>
      )}
      {dataDebugPanel && isDebugOpen ? (
        <Grid container>
          <Grid item xs={3}></Grid>
          <Grid item xs={6}>
            <DataVisualizer />
          </Grid>
          <Grid item xs={3}></Grid>
        </Grid>
      ) : (
        <></>
      )}
    </Grid>
  );
}
