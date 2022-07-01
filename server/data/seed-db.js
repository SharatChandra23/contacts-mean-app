require('dotenv').config();

const users = require('./users');
const contacts = require('./contacts');

const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const url = process.env.DB_CONN;
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
};

const seedCollection = (collectionName, initialRecords) => {
  MongoClient.connect(url, connectionParams, (err, client) => {
    const dbo = client.db("e2e-app");
    console.log('connected to mongodb....');
    const collection = dbo.collection(collectionName);
    // collection.remove();

    initialRecords.forEach((item) => {
      if (item.password) {
        item.password = bcrypt.hashSync(item.password, 10);
      }
    });

    collection.insertMany(initialRecords, (err, result) => {
      console.log(`${result.insertedCount} records inserted.`);
      console.log('closing connnection.....');
      client.close();
      console.log('done');
    });

  });

};

seedCollection('users', users);
seedCollection('contacts', contacts);
