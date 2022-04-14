import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import Button from '@arcblock/ux/lib/Button';
import Dialog from '@arcblock/ux/lib/Dialog';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';

import Layout from '../components/layout';
import api from '../libs/api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [contact, setContact] = useState(null);
  const navigate = useNavigate();

  const addContact = async () => {
    const { did, fullName, endpoint } = contact;
    await api.post('/api/contact', {
      did,
      endpoint,
      fullName,
      favorite: true,
    });
    setContact(null);
    getContacts();
  };

  const getContacts = async () => {
    const { data } = await api.get('/api/contacts?favorite=true');
    setContacts(data);
  };

  useEffect(() => {
    getContacts();
  }, []);

  return (
    <StyledLayout title="Contact" tab="contacts" showFooter>
      <div className="contact" key="add" onClick={() => setContact({ endpoint: '', fullName: '' })}>
        <AddBoxOutlinedIcon className="avatar" />
        <Box className="right">
          <Box>Add Contact</Box>
        </Box>
      </div>

      {contacts.map((x) => (
        <div
          className="contact"
          key={x.did}
          onClick={() => {
            setContact({ did: x.did, endpoint: x.endpoint, fullName: x.fullName });
          }}>
          <DidAvatar className="avatar" shape="square" did={x.did} size={40} />
          <Box className="right">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>{x.fullName}</Box>
              <Box onClick={(e) => e.stopPropagation()}>
                <Button
                  onClick={() => {
                    navigate(`/chat/${x.did}`);
                  }}>
                  Chat
                </Button>
              </Box>
            </Box>
          </Box>
        </div>
      ))}

      {!!contact && (
        <Dialog
          title={`${contact.did ? 'Update' : 'Add'} Contact`}
          open={!!contact}
          fullWidth
          onClose={() => setContact(null)}
          actions={
            <>
              <Button
                style={{ marginLeft: 12 }}
                variant="contained"
                onClick={() => addContact()}
                disabled={!contact.endpoint || !contact.fullName}>
                {contact.did ? 'Update' : 'Add'}
              </Button>
            </>
          }>
          <TextField
            variant="outlined"
            label="Contact Address"
            fullWidth
            value={contact.endpoint}
            size="small"
            disabled={!!contact.did}
            onChange={(e) => setContact((x) => ({ ...x, endpoint: e.target.value }))}
          />

          <TextField
            style={{ marginTop: 24 }}
            variant="outlined"
            label="Name"
            fullWidth
            value={contact.fullName}
            size="small"
            onChange={(e) => setContact((x) => ({ ...x, fullName: e.target.value }))}
          />
        </Dialog>
      )}
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
      width: 40px;
      height: 40px;
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
