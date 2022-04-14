/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';

import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';

import Layout from '../components/layout';
import api from '../libs/api';
import { useSubscription } from '../libs/ws';

export default function Messages() {
  const [contacts, setContacts] = useState([]);
  const navigate = useNavigate();

  const getContacts = async () => {
    const { data } = await api.get('/api/contacts');
    setContacts(data);
  };

  useEffect(() => {
    getContacts();
  }, []);

  useSubscription('message', ({ message, sender } = {}) => {
    setContacts((list) =>
      list.map((x) => {
        if (sender?.did !== x.did) {
          return x;
        }

        return {
          ...x,
          lastMessage: message.data,
          createdAt: message.createdAt,
          unRead: true,
        };
      })
    );
  });

  return (
    <StyledLayout title="Message" tab="messages" showFooter>
      {contacts
        .filter((x) => x.lastMessage)
        .map((x) => (
          <div
            className="contact"
            key={x.did}
            onClick={() => {
              navigate(`/chat/${x.did}`);
            }}>
            <Badge className="avatar" color="error" variant="dot" invisible={!x.unRead}>
              <DidAvatar shape="square" did={x.did} size={40} />
            </Badge>
            <Box className="right">
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>{x.fullName}</Box>
                <Box className="date">{x.createdAt}</Box>
              </Box>
              <Box className="text">{x.lastMessage}</Box>
            </Box>
          </div>
        ))}
    </StyledLayout>
  );
}

const StyledLayout = styled(Layout)`
  .contact {
    display: flex;
    align-items: center;
    height: 60px;
    box-sizing: border-box;
    padding: 8px 16px;
    border-bottom: 1px solid ${(props) => props.theme.palette.divider};
    cursor: pointer;

    .avatar {
      flex-shrink: 0;
      margin-right: 8px;
    }
    .right {
      flex-grow: 1;
      .date {
        font-size: 14px;
        color: ${(props) => props.theme.palette.text.hint};
      }
      .text {
        font-size: 14px;
        margin-top: 4px;
        color: ${(props) => props.theme.palette.text.hint};
      }
    }
  }
`;
