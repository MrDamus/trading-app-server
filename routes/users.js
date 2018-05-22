var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient

const url = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ds129770.mlab.com:29770/stock-trading`

/* GET users listing. */
router.get('/', function(req, res, next) {
  MongoClient.connect(url, (err, client) => {
    db = client.db('stock-trading')
    db.collection('users')
      .find()
      .toArray(function(err, results) {
        console.log(results);
        res.send(results);
      })
    console.log('err', err);
  })
});

router.post('/:email', function(req, res, next) {
  MongoClient.connect(url, (err, client) => {
    console.log(req.params.email)
    db = client.db('stock-trading')
    db.collection('users')
      .find({ Email: req.params.email, Password: req.body.password })
      .toArray(function(err, results) {
        console.log(results);
        res.send(results);
      })
    console.log('err', err);
  })
});

/* GET users listing. */
router.put('/', (req, res) => {
  // Handle put request
  })

// router.post('/', (req, res) => {
//   MongoClient.connect(url, (err, client) => {
//     db = client.db('stock-trading')
//     const newUser = {...req.body, wallet: [], money: 1000}
//    db.collection('users').save(newUser, (err, result) => {
//     if (err) return console.log(err)

//     console.log('saved to database')
//     res.redirect('/')
//   })
//   })
// })
 
module.exports = router;