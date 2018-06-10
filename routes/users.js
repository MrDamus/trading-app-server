var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
const MongoClient = require('mongodb').MongoClient
const axios = require('axios');

const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds129770.mlab.com:29770/stock-trading`

/* GET users listing. */
router.get('/', function (req, res, next) {
  MongoClient.connect(url, (err, client) => {
    const db = client.db('stock-trading')
    db.collection('users')
      .find()
      .toArray(function (err, results) {
        console.log(results);
        res.send(results);
      })
    console.log('err', err);
  })
});

/* LOGIN */
router.post('/:email', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  MongoClient.connect(url, (err, client) => {
    const db = client.db('stock-trading')
    db.collection('users')
      .findOne({ email: req.params.email, password: req.body.password })
      .then(user => {
        res.send(user)
      })
  })
}); 

/* TRANSACTION::BUY
  body: {
    "symbol": string,
    "amount": number,
    "price": number,
    "date": number
  }
*/
router.put('/buy/:email', function (req, res, next) {
  const { amount, price } = req.body;
  const cost = price * amount;
  MongoClient.connect(url, (err, client) => {
    const db = client.db('stock-trading')
    db.collection('users')
      .findOne({ email: req.params.email})
      .then(user => {
        if(user.money > cost) {
          db.collection('users')
          .findOneAndUpdate({ email: req.params.email },
          {
            $inc: {
              money: -(amount*price),
            },
            $push: {
              wallet: req.body
            }
          },{}, (err, result) => {
            console.warn(result)
            if (err) return res.send(err)
            res.send({response: "Transaction Successful"})
          })
        } else {
          res.status(500).send("Not enough money")
        }
      })
  });
})

/* TRANSACTION::SELL 
body: {
  date: number
}
*/
router.put('/sell/:email', (req, res, next) => {
  const {date} = req.body;
  MongoClient.connect(url, (err, client) => {
    const db = client.db('stock-trading')
    db.collection('users')
    .find({
      email: req.params.email,
      wallet: { $elemMatch: {date}}
    }).snapshot().forEach(
      user => {
        for (let i = 0; i < user.wallet.length; i++) {
          if(user.wallet[i].date == date) {
              axios.get(`https://api.iextrading.com/1.0/stock/${user.wallet[i].symbol}/price`)
                .then(resp => {
                  user.money += user.wallet[i].amount * resp.data
                  user.wallet[i].sold = true;
                  user.wallet[i].amount = 0;
                  db.collection('users').save(user);
                  res.send({response: "Transaction Successful"})
                })
                .catch(error => console.log(error))
            }
        }
      }
    )
  })
})

/* CREATE NEW USER */
router.post('/', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    const db = client.db('stock-trading')
    const newUser = { ...req.body, wallet: [], money: 1000 }
    wallet: [ [Object], [Object] ],
    db.collection('users')
      .find({ email: newUser.email })
      .toArray(function (err, users) {
          if (users && users.length > 0) {
            // error 
            res.statusMessage = 'User already exists'
            res.status(500).send({ error: 'User already exists' });
          } else {
            db.collection('users')
              .save(newUser, (err, result) => {
                if (err) return console.log(err)
                console.log('Your account has been created.')
                res.send(newUser)
              })
          }
      })
  })
})

// Clearing database
router.delete('/', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    const db = client.db('stock-trading')
    try {
      db.collection('users').drop({ "id": !null });
    } catch (e) {
      console.log(e);
    }
  })
})

module.exports = router;