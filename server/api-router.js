const express = require('express');
const jwtoken = require("jsonwebtoken");
const path = require('path');
const bcrypt = require('bcrypt');
const { expressjwt: checkJwt } = require('express-jwt');

const {ObjectId} = require('mongodb');

function apiRouter(database) {
  const router = express.Router();
  // router.use(checkJwt({secret: process.env.JWT_SECRET, algorithms: ["HS256"]}));

  /* router.use(
    checkJwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })
    // .unless({ path: ['/authenticate'] })
    // .unless({ path: '/authenticate'})
  ); */

  router.use((err, req, res, next) => {
    // console.log(req.originalUrl);
    if (req.originalUrl !== '/api/authenticate' && err.name === 'UnauthorizedError') {
      res.status(401).send({ error: err.message });
    }
  });

  router.get('/contacts', (req, res) => {
    const contactsCollection = database.collection("contacts");

    contactsCollection.find({}).toArray((err, docs) => {
      return res.json(docs);
    });
  })

  router.post('/contacts', (req, res) => {
    const user = req.body;

    const contactsCollection = database.collection('contacts');
    contactsCollection.insertOne(user, (err, resp) => {
      if (err) {
        return res.status(500).json({ error: 'Error inserting new record.' });
      }
      return res.status(201).json(user);
    })
  });

  router.delete('/contacts/:id', (req, res) => {
    var id = req.params.id;
    var query = { _id: ObjectId(id) };
    const contactsCollection = database.collection('contacts');
    contactsCollection.deleteOne(query, (err, resp) => {
      if (err) {
        return res.status(500).json({ error: 'Error inserting new record.' });
      }
      return res.status(201).json({ success: id });
    })
  });

  router.put('/contacts/:id', (req, res) => {
    var user = req.body;
    var id = req.params.id;
    var query = { _id: ObjectId(id) };
    const contactsCollection = database.collection('contacts');
    contactsCollection.update(query, user, (err, resp) => {
      if (err) {
        return res.status(500).json({ error: 'Error inserting new record.' });
      }
      return res.status(201).json(user);
    })
  });

  router.post('/authenticate', (req, res) => {
    const user = req.body;
    // console.log(user);
    const usersCollection = database.collection('users');

    usersCollection
      .findOne({ username: user.username }, (err, result) => {
        if (!result) {
          return res.status(404).json({ error: 'user not found' });
        }

        if (!bcrypt.compareSync(user.password, result.password)) {
          return res.status(401).json({ error: 'incorrect password' });
        }

        const payload = {
          username: result.username,
          admin: result.admin
        };

        const token = jwtoken.sign(
          payload, "OhhxOGGCH25o7Pq9L4izSu9OsDiSDTBu8fvcRfwxINOaQUrDmkytmfqvH00c5nM",
          { expiresIn: '4h' });
        return res.json({
          message: 'successfully authenticated',
          token: token
        });

      });
  });

  return router;
}

module.exports = apiRouter;
