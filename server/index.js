require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const createExpressApp = require('./create-express-app');

const port = process.env.PORT || 8080;
const url = process.env.DB_CONN;
const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
};

MongoClient.connect(url, connectionParams, (err, client) => {
  console.log('connected to mongodb....');
  if (err) {
    return err;
  }

  const dbo = client.db("e2e-app");
  const server = createExpressApp(dbo)
    .listen(port, () => {
      console.log('listening on port 3000');
    });

  server.timeout = 1000;
});

