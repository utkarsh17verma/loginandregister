var express = require('express');
var router = express.Router();
var mysql = require('mysql');
const sendSMS = require('../modules/send_sms.js');
const cryptoRandomString = require('crypto-random-string');
global.secureRoute = cryptoRandomString({ length: 16, type: 'url-safe' })


//Create Connection
var db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});

//Connect to database
db.connect( function(err) {
  if(err) throw err;
  console.log('Connected..');
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Submit registration form details
router.post('/submit', function(req, res, next) { 
  var datetime = new Date();
  let post = {
    id: 'Null',
    name: '' + req.body.name + '',
    mobile: '' + req.body.mobile + '',
    email: '' + req.body.email + '',
    username: '' + req.body.username + '',
    password: '' + req.body.password + '',
    registeredat: datetime
  };
  let sql = 'INSERT INTO user SET ?';
  db.query(sql, post, (err, result) => {
      if (err) throw err;
      if(result){
        res.send("true");
      }else{
        res.send("false");
      }
    });
});

//get user page
router.post('/login', function(req, res) {
  db.query('SELECT password from user WHERE email = ?', req.body.email, (err, result) => {
    if(err) throw err;
    if(req.body.password == result[0].password){
      res.send("You are successfully logged in!");
    }else{
      res.send("Wrong password! Please login again.")
    }
  });
});

//reset password page
router.get('/forgot-password', function (req, res) {
  res.render('forgotpassword');
});

//get data from forgot password email and send otp 
router.post('/forgot-password', function (req, res) {
  let mobile= req.body.mobile;
  db.query('select otp from user where mobile = ?', mobile, (err, result) => {
    if (err) throw err;
    else {  
      let otp = Math.floor(100000 + Math.random() * 900000);
      db.query('UPDATE user SET otp = ? where mobile = ?', [otp, mobile], (err, result) => {
        if (err) throw err;
      });
      global.userData = {
        'otp': otp,
        'mobile':mobile
      };
      var body = "Use "+ otp +" as one time password(OTP) to reset your password";
      var to = "+91"+mobile;
      sendSMS.send(body,to);
      return res.redirect('/verify-otp');
    };
  });
});

//OTP Verification
router.get('/verify-otp', (req, res) => {
res.render('verifyotp');
});

router.post('/verify-otp', (req, res) => {
if (req.body.otp == userData.otp) {
  return res.redirect('/forgot-password/' + secureRoute);
}
else {
  return res.redirect('/forgot-password');
}
});

// reset-password
router.get('/forgot-password/' + secureRoute, function (req, res) {
  res.render('resetpassword', { secrete: secureRoute }) 
});

router.post('/forgot-password/' + secureRoute, (req, res) => {
  const pass = req.body.password;
  db.query('UPDATE user SET password = ? where mobile = ?',[pass, userData.mobile], (err, result) => {
    if (err) throw err;
    res.redirect('/');
  });
});

module.exports = router;
