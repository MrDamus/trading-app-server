var express = require('express');
var router = express.Router();
const MongoClient = require('mongodb').MongoClient

const url = 'mongodb://admin:kitkat@ds129770.mlab.com:29770/stock-trading'


/* GET users listing. */
router.get('/', function(req, res, next) {
  
  MongoClient.connect(url, (err, client) => {
    db = client.db('stock-trading')
    db.collection('users')
      .find()
      .toArray(function(err, results) {
        console.log(results)
        res.send(results);
      })
    console.log('err', err);
  })
})

module.exports = router;

