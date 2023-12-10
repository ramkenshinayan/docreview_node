var express = require('express');
var router = express.Router();
var session = require('express-session');
var mysql = require('mysql');
var loginResult;

// Start session
router.use(session({
  secret: 'somesecretkey',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
  },
}));

// Connect database
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'docreview'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

global.conn = connection;

// GET homepage
router.get('/', (req, res, next) => {
  res.render('index');
});

// GET reviewer-home page
router.get('/reviewer-home', (req, res, next) => {
  res.render('reviewer-home');
});

// POST login
router.post('/login', (req, res) => {
  // Receive login details
  var email = req.body.email;
  var password = req.body.password;
  // Verify login details
  global.conn.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (error, result) => {
    // prompt on error
    if (error) {
      console.error(error);
    }
    // if result exists, else, prompt invalid email or password
    if (result.length > 0) {
      // if user status is not Online, else, prompt user is already logged in
      if (result[0].status != 'Online') {
        // Login Successful
        // Set session variables
        req.session.user = {
          email: result[0].email,
          firstName: result[0].firstName,
          lastName: result[0].lastName,
          role: result[0].role
        };
        // Make user Online
        global.conn.query('UPDATE users SET status="Online" WHERE email= ?', [email], (error, result) => {
          // prompt on error
          if (error) {
            console.error(error);
          }
        });
        console.log('Log in successful.');
        res.redirect('/reviewer-home');
        loginResult = 'success';
      } else {
        console.log('User is already logged in.');
        loginResult = 'logged';
      }
    } else {
      console.log('Invalid email or password.');
      loginResult = 'invalid';
    }
  });
});

// GET login result
router.get('/loginresult', (req, res) => {
  res.send(loginResult);
});

module.exports = router;