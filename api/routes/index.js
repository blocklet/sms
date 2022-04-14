const axios = require('axios');
const joinUrl = require('url-join');
const uuid = require('uuid');
const router = require('express').Router();
const pick = require('lodash/pick');

const { fromPublicKey } = require('@ocap/wallet');
const middleware = require('@blocklet/sdk/lib/middlewares');
const AuthService = require('@blocklet/sdk/service/auth');
const Notification = require('@blocklet/sdk/service/notification');

const Account = require('../states/account');
const Contact = require('../states/contact');
const { ACCOUNT_STATUS, CONTACT_STATUS } = require('../utils/constant');
const logger = require('../libs/logger');
const wsServer = require('../ws');

router.use('/user', middleware.user(), (req, res) => res.json(req.user || {}));

// account

router.get('/accounts', async (req, res) => {
  const list = await Account.find({});
  res.json(list);
});

router.post('/account', async (req, res) => {
  const { fullName, index } = req.body;
  if (!fullName) {
    throw new Error('fullName does not exist');
  }

  if (!index) {
    throw new Error('index does not exist');
  }

  const account = await Account.createOrUpdate({ index, fullName });

  res.json(account);
});

// public

router.get('/public/account/:did/info', async (req, res) => {
  const { did } = req.params;
  const account = await Account.findOne({ did });
  res.json(account);
});

router.post('/public/account/:did/message', async (req, res) => {
  const { did: receiverDid } = req.params;
  const { sender, createdAt, data, signature, id } = req.body;
  const wallet = fromPublicKey(sender.pk);
  if (wallet.address !== sender.did) {
    throw new Error('PublicKey and did does not match');
  }

  if (!wallet.verify(data, signature)) {
    throw new Error('Signature is invalid');
  }

  const receiver = Account.getAccount({ did: receiverDid });
  if (!receiver) {
    throw new Error('The receiver does not exist');
  }

  if (receiver.status === ACCOUNT_STATUS.CLOSED) {
    throw new Error('The receiver has been closed');
  }

  const existSender = await Contact.findOne({ did: sender.did });
  const senderName = existSender?.fullName || sender.fullName;

  if (existSender?.status === CONTACT_STATUS.BLOCKED) {
    throw new Error('The sender is blocked');
  }

  if (existSender) {
    // update contact
  } else {
    const { did, pk, endpoint } = sender;
    await Contact.createOrUpdate({ did, pk, fullName: did.slice(-6), endpoint, favorite: false });
  }

  const message = {
    id,
    data,
    senderDid: sender.did,
    receiverDid,
    createdAt,
  };

  await Contact.createMessage({ did: sender.did, message, unRead: true });

  res.json(req.body);

  try {
    const client = new AuthService();
    const { users } = await client.getUsers();
    await Notification.sendToUser(
      users.map((user) => user.did),
      {
        title: senderName,
        body: data,
      }
    );
  } catch (err) {
    logger.error(err);
  }

  wsServer.broadcast('message', { message, sender });
});

// contact
router.get('/contacts', async (req, res) => {
  const { favorite } = req.query;
  const list = await Contact.find(favorite ? { favorite: true } : {});
  res.json(list);
});

router.get('/contact/:did', async (req, res) => {
  const { did } = req.params;
  const contact = await Contact.findOne({ did });
  res.json(contact);
});

router.post('/contact', async (req, res) => {
  const { endpoint, favorite, fullName, did } = req.body;

  let contact;

  try {
    if (!did) {
      const { data } = await axios.get(joinUrl(endpoint, '/info'));
      contact = await Contact.createOrUpdate({ did: data.did, pk: data.pk, fullName, endpoint, favorite: !!favorite });
    } else {
      contact = await Contact.createOrUpdate(pick(req.body, ['did', 'fullName', 'favorite']));
    }

    res.json(contact);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/contact/:did/message', async (req, res) => {
  const { did: receiverDid } = req.params;
  const { message, senderDid, origin } = req.body;
  const receiver = await Contact.findOne({ did: receiverDid });
  const sender = await Account.getAccount({ did: senderDid, wallet: true });

  const address = joinUrl(receiver.endpoint, '/message');
  const doc = {
    id: uuid.v4(),
    data: message,
    createdAt: new Date(),
    senderDid: sender.did,
    receiverDid,
  };

  await axios.post(address, {
    ...doc,
    signature: sender.wallet.sign(doc.data),
    sender: {
      did: sender.did,
      pk: sender.pk,
      fullName: sender.fullName,
      endpoint: `${origin}/api/public/account/${senderDid}`,
    },
  });

  await Contact.createMessage({ did: receiverDid, message: doc });

  res.json(doc);
});

router.post('/contact/:did/read', async (req, res) => {
  const { did } = req.params;
  await Contact.update({ did }, { $set: { unRead: false } });
  res.end();
});

module.exports = router;
