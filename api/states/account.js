const Mcrypto = require('@ocap/mcrypto');
const hdkey = require('@wangshijun/hdkey');
const { fromSecretKey } = require('@ocap/wallet');
const Database = require('@blocklet/sdk/lib/database');
const AuthService = require('@blocklet/sdk/service/auth');
const { env } = require('@blocklet/sdk');

const logger = require('../libs/logger');
const { ACCOUNT_STATUS } = require('../utils/constant');

const getWallet = (account, appSk) => {
  const { index } = account;

  if (!index) {
    throw new Error('index does not exist');
  }

  const SK = appSk || process.env.BLOCKLET_APP_SK;

  const master = hdkey.fromMasterSeed(Buffer.from(SK, 'hex'));
  const derivePath = `m/44'/260'/0'/0'/${index}`;
  const child = master.derive(derivePath);
  const keyPair = Mcrypto.Signer.Ed25519.genKeyPair(child.privateKey);
  const wallet = fromSecretKey(keyPair.secretKey);

  if (account.did && wallet.address !== account.did) {
    throw new Error('get wallet failed: account did and wallet address are not the same');
  }

  return wallet;
};

class AccountState extends Database {
  constructor() {
    super('account');
    this.ensureIndex({ fieldName: 'did', unique: true }, (error) => {
      if (error) {
        logger.error('ensure index failed', { error });
      }
    });

    setTimeout(() => {
      this.ensureFirstAccount();
    }, 1000);
  }

  async createOrUpdate(data) {
    const { index, fullName } = data;

    const wallet = getWallet(data);

    const exist = await this.findOne({ index });

    if (exist) {
      return this.update(
        { index },
        {
          $set: {
            fullName,
          },
        }
      );
    }

    return this.insert({
      did: wallet.address,
      pk: wallet.publicKey,
      index,
      fullName,
      status: ACCOUNT_STATUS.OPEN,
    });
  }

  async getAccount({ did, wallet = false }) {
    const account = await this.findOne({ did });
    if (wallet) {
      account.wallet = getWallet(account);
    }
    return account;
  }

  async ensureFirstAccount() {
    try {
      const count = await this.count({});
      if (!count) {
        let name = env.appId.slice(-6);
        try {
          const client = new AuthService();
          const { users } = await client.getUsers();
          if (users[0]?.fullName) {
            name = users[0].fullName;
          }
        } catch (error) {
          console.error(error);
          // do nothing
        }

        await this.createOrUpdate({ fullName: name, index: 1 });
      }
    } catch (err) {
      logger.error(err.message);
    }
  }
}

module.exports = new AccountState();
