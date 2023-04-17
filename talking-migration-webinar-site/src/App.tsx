import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { Route, Routes } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Layout from "./components/layout";
import Home from "./views/home";
import { createTheme } from "@mui/material/styles";
import Audimat3000 from "./assets/fonts/Audimat3000-Regulier.woff2";
import SohneBuch from "./assets/fonts/Sohne-Buch.woff2";
import SohneKraftig from "./assets/fonts/Sohne-Kraftig.woff2";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#405BFF",
    },
    secondary: {
      main: "#EBFF38",
    },
  },
  typography: {
    h2: {
      fontFamily: "Audimat",
    },
    h5: {
      fontFamily: "Kraftig",
    },
    h6: {
      fontFamily: "Kraftig",
      fontWeight: "bold",
      fontSize: "24px",
    },
    body1: {
      fontFamily: "Buch",
      color: "#e6e6e6",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
  			@font-face {
  				font-family: "Audimat";
  				src: url(${Audimat3000}) format('woff2');
  				font-weight: bold;
  			}

  			@font-face {
  				font-family: 'Kraftig';
  				src: url(${SohneKraftig}) format('woff2');
  			}

  			@font-face {
  				font-family: 'Buch';
  				src: local('Buch'), url(${SohneBuch}) format('woff2');
  				font-weight: normal;
  			}
  		`,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
