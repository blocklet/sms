import React, { useEffect, useState, useRef } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import classnames from 'classnames';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Button from '@arcblock/ux/lib/Button';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';
import Dialog from '@arcblock/ux/lib/Dialog';
import useBrowser from '@arcblock/react-hooks/lib/useBrowser';

import Layout from '../components/layout';
import AccountSelector from '../components/account-selector';
import api from '../libs/api';
import { useSubscription } from '../libs/ws';

export default function Chat() {
  const [contact, setContact] = useState();
  const [accounts, setAccounts] = useState([]);
  const [senderDid, setSenderDid] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const { contactDid } = useParams();
  const scrollBottom = useRef();
  const [dialog, setDialog] = useState();
  const browser = useBrowser();

  const markRead = () => api.post(`/api/contact/${contactDid}/read`);

  const autoScroll = () => {
    if (scrollBottom.current?.scrollIntoView) {
      setTimeout(() => scrollBottom.current.scrollIntoView({ behavior: 'auto' }), 100);
    }
  };

  useSubscription('message', ({ message: data, sender } = {}) => {
    if (sender?.did === contactDid) {
      setMessages((list) => [...list, data]);
      autoScroll();
      markRead();
    }
  });

  const accountMap = accounts.reduce((o, x) => {
    o[x.did] = x;
    return o;
  }, {});

  const sendMessage = async () => {
    const { data } = await api.post(`/api/contact/${contactDid}/message`, {
      message,
      senderDid,
      origin: `${window.location.origin}`,
    });
    setMessage('');
    setMessages((list) => [...list, data]);
    autoScroll();
  };

  const getAccounts = async () => {
    const { data } = await api.get('/api/accounts');
    setAccounts(data);
    if (data[0]) {
      setSenderDid((x) => x || data[0].did);
    }
    return data;
  };

  const getContact = async () => {
    const accountList = await getAccounts();

    if (!contactDid) {
      return;
    }
    const { data } = await api.get(`/api/contact/${contactDid}`);
    const { messages: _messages, ...c } = data;
    setContact(c);
    setMessages(_messages);

    const lastMessage = _messages[_messages.length - 1];
    if (lastMessage) {
      const defaultAccount = accountList.find(
        (x) => x.did !== contactDid && [lastMessage.senderDid, lastMessage.receiverDid].includes(x.did)
      );
      if (defaultAccount) {
        setSenderDid(defaultAccount.did);
      }
    }

    autoScroll();

    await markRead();
  };

  useEffect(() => {
    getContact();
  }, [contactDid]);

  const addContact = async () => {
    const { did, fullName } = dialog;
    await api.post('/api/contact', {
      did,
      fullName,
      favorite: true,
    });
    setContact((x) => ({ ...x, fullName, favorite: true }));
    setDialog(null);
  };

  return (
    <StyledLayout
      title={contact?.fullName}
      headerAddons={
        contact?.favorite === false ? (
          <Button onClick={() => setDialog({ did: contact.did, fullName: contact.fullName })}>Add to Contacts</Button>
        ) : null
      }>
      <Box className={classnames('container', { 'in-mobile': !!browser.mobile.any })}>
        <Box className="body">
          {messages.map((x) => {
            const direction = x.senderDid === contact?.did ? 'receive' : 'send';
            const account = direction === 'receive' ? contact : accountMap[x.senderDid];
            return (
              <Box className={classnames('message', direction)} key={x.did}>
                <Box className="avatar">
                  <DidAvatar shape="square" did={account.did} size={32} />
                </Box>
                <Box>
                  <Box className="name">{account?.fullName}</Box>
                  <Box className="text">{x.data}</Box>
                </Box>
              </Box>
            );
          })}
          <div className="dummy" ref={scrollBottom} />
        </Box>

        <Box className={classnames('footer')}>
          <AccountSelector
            className="sender-select"
            accounts={accounts}
            value={senderDid}
            onChange={(x) => setSenderDid(x)}
          />
          <TextField
            className="input"
            fullWidth
            variant="outlined"
            value={message}
            size="small"
            onKeyUp={(e) => {
              if (e.code === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            className="btn-send"
            color="primary"
            variant="contained"
            onClick={() => sendMessage()}
            disabled={!message}>
            Send
          </Button>
        </Box>
      </Box>

      {!!dialog && (
        <Dialog
          title="Add to Contact"
          open={!!dialog}
          fullWidth
          onClose={() => setDialog(null)}
          actions={
            <>
              <Button
                style={{ marginLeft: 12 }}
                variant="contained"
                onClick={() => addContact()}
                disabled={!dialog.fullName}>
                Add
              </Button>
            </>
          }>
          <TextField
            style={{ marginTop: 24 }}
            variant="outlined"
            label="Name"
            fullWidth
            value={dialog.fullName}
            size="small"
            onChange={(e) => setDialog((x) => ({ ...x, fullName: e.target.value }))}
          />
        </Dialog>
      )}
    </StyledLayout>
  );
}

const StyledLayout = styled(Layout)`
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    &.in-mobile {
      flex-direction: column-reverse;
    }
    .body {
      background: #f8f8f8;
      flex-grow: 1;
      overflow: scroll;
      .message {
        display: flex;
        margin: 8px 0;
        &.receive {
          flex-direction: row;
        }
        &.send {
          flex-direction: row-reverse;
          .name {
            text-align: right;
          }
        }
      }
      .avatar {
        margin: 0 8px;
      }
      .name {
        font-size: 12px;
        color: ${(props) => props.theme.palette.text.hint};
      }
      .text {
        margin-top: 4px;
        background: #fff;
        padding: 8px;
        border-radius: 4px;
      }
    }
    .footer {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
      height: 60px;
      border-top: 1px solid ${(props) => props.theme.palette.divider};
      .MuiInputBase-root {
        height: 100%;
      }
      .MuiOutlinedInput-root {
        border-radius: 0;
      }
      .sender-select {
        height: 100%;
      }
      .input {
        height: 100%;
        flex-grow: 1;
      }
      .btn-send {
        height: 100%;
        border-radius: 0;
      }
    }
  }
`;
