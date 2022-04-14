/* eslint-disable operator-linebreak */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import DidAvatar from '@arcblock/did-connect/lib/Avatar';

export default function AccountSelector({ accounts, onChange, value, ...rest }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const onOpen = (e) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      // eslint-disable-next-line no-empty
    } catch {}
    setAnchorEl(e.currentTarget);
  };

  const onClose = (e) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      // eslint-disable-next-line no-empty
    } catch {}
    setAnchorEl(null);
  };

  return (
    <Div {...rest}>
      <DidAvatar onClick={onOpen} className="avatar" shape="square" did={value} size={40} />

      <Menu id="actions-menu" anchorEl={anchorEl} keepMounted open={open} onClose={onClose}>
        {accounts.map((x) => {
          return (
            <MenuItem
              dense
              key={x.name}
              onClick={() => {
                onChange(x.did);
                onClose();
              }}>
              <DidAvatar className="avatar" shape="square" did={x.did} size={40} />
              <div>{x.fullName}</div>
            </MenuItem>
          );
        })}
      </Menu>
    </Div>
  );
}

AccountSelector.propTypes = {
  accounts: PropTypes.array,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

AccountSelector.defaultProps = {
  accounts: [],
  onChange: () => {},
  value: '',
};

const Div = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
    .MuiButton-root {
      padding: 4px;
      font-size: 10px;
    }
  }
`;
