import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import ClickToCopy from '@arcblock/ux/lib/ClickToCopy';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';
import Dialog from '@arcblock/ux/lib/Dialog';
import Button from '@arcblock/ux/lib/Button';

import Layout from '../components/layout';
import api from '../libs/api';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(null);

  const addAccount = async () => {
    const { did, fullName } = account;
    const index = account.index || accounts.reduce((i, x) => (x?.index > i ? x.index : i), 0) + 1;

    const { data } = await api.post('/api/account', {
      index,
      fullName,
    });

    if (did) {
      setAccounts((list) =>
        list.map((x) => {
          if (x.did === did) {
            return { ...x, fullName };
          }
          return x;
        })
      );
    } else {
      setAccounts((list) => [data, ...list]);
    }
    setAccount(null);
  };

  const getAccounts = async () => {
    const { data } = await api.get('/api/accounts');
    setAccounts(data);
  };

  useEffect(() => {
    getAccounts();
  }, []);

  return (
    <StyledLayout title="Account">
      <div className="account" key="add" onClick={() => setAccount({ fullName: '' })}>
        <AddBoxOutlinedIcon className="avatar" />
        <Box className="right">
          <Box>Add Account</Box>
        </Box>
      </div>

      {accounts.map((x) => (
        <div
          className="account"
          key={x.did}
          onClick={() => {
            setAccount({ fullName: x.fullName, did: x.did, index: x.index });
          }}>
          <DidAvatar className="avatar" shape="square" did={x.did} size={40} />
          <Box className="right">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>{x.fullName}</Box>
              <Box onClick={(e) => e.stopPropagation()}>
                <ClickToCopy content={`${window.location.origin}/api/public/account/${x.did}`}>
                  Copy Address
                </ClickToCopy>
              </Box>
            </Box>
          </Box>
        </div>
      ))}

      {!!account && (
        <Dialog
          title={`${account.did ? 'Update' : 'Add'} Account`}
          open={!!account}
          fullWidth
          onClose={() => setAccount(null)}
          actions={
            <>
              <Button
                style={{ marginLeft: 12 }}
                variant="contained"
                onClick={() => addAccount()}
                disabled={!account.fullName}>
                {account.did ? 'Update' : 'Add'}
              </Button>
            </>
          }>
          <TextField
            variant="outlined"
            label="Name"
            fullWidth
            value={account.fullName}
            size="small"
            onChange={(e) => setAccount((x) => ({ ...x, fullName: e.target.value }))}
          />
        </Dialog>
      )}
    </StyledLayout>
  );
}

const StyledLayout = styled(Layout)`
  .account {
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
