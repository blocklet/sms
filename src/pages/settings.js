/* eslint-disable no-console */
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Box from '@material-ui/core/Box';

import Layout from '../components/layout';

export default function Settings() {
  return (
    <StyledLayout title="Setting" tab="settings" showFooter>
      <Box className="item" component={Link} to="/accounts">
        Accounts
      </Box>
      <Box className="item" component={Link} to="/contacts">
        Contacts
      </Box>
    </StyledLayout>
  );
}

const StyledLayout = styled(Layout)`
  .item {
    display: flex;
    align-items: center;
    height: 60px;
    box-sizing: border-box;
    padding: 8px 16px;
    border-bottom: 1px solid ${(props) => props.theme.palette.divider};
    &:first-child {
      margin-top: 40px;
      border-top: 1px solid ${(props) => props.theme.palette.divider};
    }
    color: ${(props) => props.theme.palette.text.secondary};
    text-decoration: none;
  }
`;
