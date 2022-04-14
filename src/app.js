import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { MuiThemeProvider } from '@material-ui/core/styles';
import { create } from '@arcblock/ux/lib/Theme';

import './app.css';
import Messages from './pages/messages';
import Settings from './pages/settings';
import Accounts from './pages/accounts';
import Contacts from './pages/contacts';
import Chat from './pages/chat';
import getWsClient from './libs/ws';

function App() {
  const theme = create({
    typography: {
      fontSize: 14,
    },
    palette: {
      divider: '#eee',
    },
    overrides: {},
  });

  useEffect(() => {
    const wsClient = getWsClient();
    wsClient.connect();
    return () => {
      if (wsClient.isConnected()) {
        wsClient.disconnect();
      }
    };
  }, []);

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route exact path="/messages" element={<Messages />} />
          <Route exact path="/settings" element={<Settings />} />
          <Route exact path="/accounts" element={<Accounts />} />
          <Route exact path="/contacts" element={<Contacts />} />
          <Route exact path="/chat/:contactDid" element={<Chat />} />
          <Route path="*" element={<Navigate to="/messages" />} />
        </Routes>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

const WrappedApp = App;

export default () => {
  // While the blocklet is deploy to a sub path, this will be work properly.
  const basename = window?.blocklet?.prefix || '/';

  return (
    <Router basename={basename}>
      <WrappedApp />
    </Router>
  );
};
