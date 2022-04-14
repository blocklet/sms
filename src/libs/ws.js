import { useEffect } from 'react';
import Cookie from 'js-cookie';
import { WsClient } from '@arcblock/ws';

let client;

export function create() {
  const pathPrefix = window.blocklet?.prefix || '/';

  const url = `//${window.location.host}${pathPrefix.replace(/\/$/, '')}`;
  return new WsClient(url, {
    heartbeatIntervalMs: 10 * 1000,
    params: () => ({
      token: Cookie.get('login_token'),
    }),
  });
}

export default function getWsClient() {
  if (!client) {
    client = create();
  }

  return client;
}

export const useSubscription = (event, cb = () => {}, deps = []) => {
  if (!client) {
    client = getWsClient();
  }
  useEffect(() => {
    client.on(event, cb);

    return () => {
      client.off(event, cb);
    };
  }, deps); // eslint-disable-line
};
