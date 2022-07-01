const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const apiRouter = require('./api-router');

function createExpressApp(database) {
  const app = express();
  app.use(bodyParser.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Authorization');
    next();
  });

  const distDir = "../dist/e2e-app";

  app.use("/api", apiRouter(database));
  app.use(
    express.static(path.join(__dirname, distDir), {
      maxAge: '1y',
    })
  );
  app.use('/profiles', express.static(path.join(__dirname, 'profiles')));

  app.use("*", (req, res) => {
    return res.sendFile(path.join(__dirname, `${distDir}/index.html`));
  });

  return app;
}

module.exports = createExpressApp;
