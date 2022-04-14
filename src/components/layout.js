/* eslint-disable no-console */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classnames from 'classnames';

import SettingsIcon from '@material-ui/icons/Settings';
import ContactsIcon from '@material-ui/icons/Contacts';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';

export default function Layout({ children, showFooter, tab: curTab, title, headerAddons, ...props }) {
  const tabs = [
    {
      name: 'messages',
      label: 'Messages',
      icon: ChatBubbleIcon,
      link: '/messages',
    },
    {
      name: 'contacts',
      label: 'Contacts',
      icon: ContactsIcon,
      link: '/contacts',
    },
    {
      name: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      link: '/settings',
    },
  ];

  return (
    <Div {...props}>
      <div className="layout-header">
        <div className="title">{title}</div>
        <div className="right">{headerAddons}</div>
      </div>
      <div className="layout-body">{children}</div>
      {showFooter && (
        <div className="layout-footer">
          {tabs.map((tab) => (
            <Link className={classnames('layout-footer-tab', { active: curTab === tab.name })} to={tab.link}>
              <tab.icon className={classnames('icon')} />
              <div className="text">{tab.label}</div>
            </Link>
          ))}
        </div>
      )}
    </Div>
  );
}

Layout.propTypes = {
  children: PropTypes.any,
  headerAddons: PropTypes.any,
  showFooter: PropTypes.bool,
  tab: PropTypes.string,
  title: PropTypes.string,
};

Layout.defaultProps = {
  children: null,
  headerAddons: null,
  showFooter: false,
  tab: '',
  title: '',
};

const Div = styled.div`
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;

  ${(props) => props.theme.breakpoints.up('sm')} {
    border-left: 1px solid ${(props) => props.theme.palette.divider};
    border-right: 1px solid ${(props) => props.theme.palette.divider};
  }

  .layout-header {
    position: relative;
    height: 60px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    background-color: #f8f8f8;
    .title {
      flex-grow: 1;
      text-align: center;
      font-size: 20px;
      font-weight: bold;
    }
    .right {
      position: absolute;
      top: 0;
      height: 100%;
      right: 16px;
      display: flex;
      align-items: center;
    }
  }

  .layout-body {
    flex-grow: 1;
    overflow: scroll;
  }

  .layout-footer {
    height: 60px;
    flex-shrink: 0;
    border-top: 1px solid ${(props) => props.theme.palette.divider};
    background-color: #f8f8f8;
    display: flex;
  }

  .layout-footer-tab {
    flex-grow: 1;
    flex-basis: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #4f6af5;
    margin-right: 32px;
    color: #555;
    &.active {
      color: ${(props) => props.theme.palette.primary.main};
    }
    text-decoration: none;
    .icon {
      font-size: 24px;
    }
    .text {
      margin-top: 2px;
      font-size: 12px;
    }
  }

  .app {
    text-align: center;
  }

  .app-logo {
    pointer-events: none;
  }

  pre {
    font-size: 0.75em;
  }

  .input-wrapper {
    margin: 32px 0;
    width: 100%;
  }

  .input {
    width: 480px;
    height: 240px;
  }
`;
