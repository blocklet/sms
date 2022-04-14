const { WsServer } = require('@arcblock/ws');

const logger = require('./libs/logger');

logger.debug = () => null;

function createWebsocketServer() {
  const wsServer = new WsServer({
    logger,
    pathname: '/websocket',
    authenticate: (req, cb) => {
      if (req.headers['x-user-did']) {
        cb(null, { did: req.headers['x-user-did'] });
      } else {
        cb(new Error('Cannot find user'), null);
      }
    },
  });

  return wsServer;
}

module.exports = createWebsocketServer();
