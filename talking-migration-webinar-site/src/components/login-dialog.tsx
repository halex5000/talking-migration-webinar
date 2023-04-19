import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  TextField,
  DialogTitle,
  DialogContent,
  Divider,
  Button,
} from "@mui/material";
import { useAppStore } from "../store/app";
import { useLDClient } from "launchdarkly-react-client-sdk";

export default function LoginDialog({
  isOpen,
  handleClose,
}: {
  isOpen: boolean;
  handleClose: Function;
}) {
  //using the hook to get a handle to the LaunchDarkly client
  const client = useLDClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useAppStore((state) => state.login);

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        handleClose();
      }}
    >
      <DialogTitle variant="h3">Who Goes There?</DialogTitle>
      <Divider />
      <DialogContent>
        <TextField
          fullWidth
          label="Username"
          aria-label="username"
          onChange={(event) => {
            setUsername(event.target.value);
          }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          onChange={(event) => {
            setPassword(event.target.value);
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={() => {
            login({ username });
            ////

            // add to the context of the LaunchDarkly client and update rules when the user logs in
            client?.identify({
              ...client.getContext(),
              name: username,
            });

            ////
            handleClose();
            setUsername("");
            setPassword("");
          }}
        >
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
}

LoginDialog.propTypes = {
  isOpen: PropTypes.bool,
  handleClose: PropTypes.func,
};
