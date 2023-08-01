import React, { useEffect } from 'react';
import './App.css';
import Body from './components/Body';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  }
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [darkMode, setDarkMode] = React.useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const updatedDarkMode = !darkMode;
    setDarkMode(updatedDarkMode);
    localStorage.setItem('darkMode', updatedDarkMode.toString());
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Body toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
    </ThemeProvider>
  );
}

export default App;
