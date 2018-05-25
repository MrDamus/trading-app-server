var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
const MongoClient = require('mongodb').MongoClient

const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds129770.mlab.com:29770/stock-trading`

/* GET users listing. */
router.get('/', function (req, res, next) {
  MongoClient.connect(url, (err, client) => {
    db = client.db('stock-trading')
    db.collection('users')
      .find()
      .toArray(function (err, results) {
        console.log(results);
        res.send(results);
      })
    console.log('err', err);
  })
});

router.post('/:email', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  MongoClient.connect(url, (err, client) => {
    console.log(req.params.email)
    db = client.db('stock-trading')
    db.collection('users')
      .findOne({ email: req.params.email, password: req.body.password })
      .then(user => {
        res.send(user)
      })
  })
});

router.put('/:email', function (req, res, next) {
  MongoClient.connect(url, (err, client) => {
    console.log(req.body.money, req.body.wallet)
    db = client.db('stock-trading')
    db.collection('users')
      .findOneAndUpdate({ email: req.params.email },
      {
        $inc: {
          money: -req.body.money,
        },
        $push: {
          wallet: req.body.wallet
        }
      },{}, (err, result) => {
        console.warn(result)
        if (err) return res.send(err)
        res.send(result)
      })
  });
})

router.post('/', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    db = client.db('stock-trading')
    const newUser = { ...req.body, wallet: [], money: 1000 }

    db.collection('users')
      .find({ email: newUser.email })
      .toArray(function (err, users) {
          if (users && users.length > 0) {
            // error 
            res.status(500).send({ error: 'User already exists' });
          } else {
            db.collection('users')
              .save(newUser, (err, result) => {
                if (err) return console.log(err)
                console.log('Your account has been created.')
                res.redirect('/')
              })
          }
      })
  })
})



// Clearing database

router.delete('/', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    db = client.db('stock-trading')
    try {
      db.collection('users').drop({ "id": !null });
    } catch (e) {
      console.log(e);
    }
  })
})

module.exports = router;