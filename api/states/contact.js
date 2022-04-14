const Database = require('@blocklet/sdk/lib/database');

const logger = require('../libs/logger');
const { CONTACT_STATUS } = require('../utils/constant');

class ContactState extends Database {
  constructor() {
    super('contact');
    this.ensureIndex({ fieldName: 'did', unique: true }, (error) => {
      if (error) {
        logger.error('ensure index failed', { error });
      }
    });
  }

  async createOrUpdate(data) {
    let contact = await this.findOne({ did: data.did });

    if (contact) {
      contact = {
        ...contact,
        ...data,
      };

      await this.update({ did: data.did }, contact);
    } else {
      const { did, pk, fullName, endpoint, favorite } = data;

      contact = await this.insert({
        did,
        pk,
        fullName,
        endpoint,
        favorite: !!favorite,
        messages: [],
        lastMessage: '',
        unRead: false,
        status: CONTACT_STATUS.OPEN,
      });
    }

    return contact;
  }

  async createMessage({ did, message, unRead }) {
    const doc = await this.findOne({ did });
    if (!doc) {
      throw new Error('Contact does not exist');
    }

    const maxNumber = 1000;
    let messages = doc.messages || [];
    messages.push(message);
    if (messages.length > maxNumber) {
      messages = messages.slice(-maxNumber);
    }

    await this.update(
      {
        did,
      },
      {
        $set: {
          messages,
          lastMessage: message.data,
          unRead: !!unRead,
        },
      }
    );
  }
}

module.exports = new ContactState();
