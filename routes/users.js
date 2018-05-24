var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator/check');
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
  res.header("Access-Control-Allow-Origin", "*");
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

router.post('/', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    db = client.db('stock-trading')
    const newUser = {...req.body, wallet: [], money: 1000}
   db.collection('users').save(newUser, (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/')
  })
  })
})

// Clearing database

router.delete('/', (req, res) => {
  MongoClient.connect(url, (err, client) => {
    db = client.db('stock-trading')
    try {
      db.collection('users').drop( { "id" : !null } );
    } catch (e) {
      console.log(e);
      }
    })
  })

// https://stackoverflow.com/questions/42381683/how-to-check-if-user-with-email-already-exists?rq=1

// router.post('/register', [
//   check('email')
//   .not()
//   .isEmpty()
//   .withMessage('Email is required')
//   .isEmail()
//   .withMessage('Invalid Email')
//   .custom((value, {req}) => {
//     return new Promise((resolve, reject) => {
//       db = client.db('stock-trading')
//       db.collection('users').findOne({email:req.body.email}, function(err, user){
//         if(err) {
//           reject(new Error('Server Error'))
//         }
//         if(Boolean(user)) {
//           reject(new Error('E-mail already in use'))
//         }
//         resolve(true)
//       });
//     });
//   }),
//   // Check Password
//   check('password')
//   .not()
//   .isEmpty()
//   .withMessage('Password is required'),
//   // Check Password Confirmation
//   check('confirmedPassword', 'Passwords do not match')
//   .exists()
//   .custom((value, { req }) => value === req.body.password)
// ], function(req, res) {
//   var name = req.body.name;
//   var email = req.body.email;
//   var password = req.body.password;
//   var confirmedPassword = req.body.confirmedPassword;

//   // Check for Errors
//   const validationErrors = validationResult(req);
//   let errors = [];
//   if(!validationErrors.isEmpty()) {
//     Object.keys(validationErrors.mapped()).forEach(field => {
//       errors.push(validationErrors.mapped()[field]['msg']);
//     });
//   }

//   if(errors.length){
//     res.render('register',{
//       errors:errors
//     });
//   }  else {
//     var newUser = new User({
//       name: name,
//       email: email,
//       password: password,
//       admin: false,
//       active: false
//     });

//     User.createUser(newUser, function (err, user) {
//       if (err) {
//         throw err;
//       }
//     });

//     req.flash('success_msg', 'You are registerd and can now login');
//     res.redirect('/users/login');
//   }})

  // MongoClient.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("stock-trading");
  //   // var myquery = { address: /^O/ };
  //   dbo.collection("users").drop({}, function(err, obj) {
  //     if (err) throw err;
  //     console.log(obj.result.n + " document(s) deleted");
  //     db.close();
  //   });
  // });

module.exports = router;
