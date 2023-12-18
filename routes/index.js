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
  database: 'finaldb'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
});

global.conn = connection;

// GET homepage
router.get('/', (req, res, next) => {
  // Check session
  if (req.session.user) {
    res.render('reviewer-home');
  } else {
    res.render('index');
  }
});

// GET reviewer-home page
router.get('/reviewer-home', (req, res, next) => {
  if (req.session.user) {
    res.render('reviewer-home');
  } else {
    res.render('index');
  }
});

// POST login
router.post('/login', (req, res) => {
  // Receive login details
  const email = req.body.email;
  const password = req.body.password;
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
        loginResult = 'success';
        res.status(202).redirect('reviewer-home');
      } else {
        console.log('User is already logged in.');
        loginResult = 'logged';
        res.status(404).redirect('/');
      }
    } else {
      console.log('Invalid email or password.');
      loginResult = 'invalid';
      res.status(404).redirect('/');
    }
  });
});

router.get('/loginresult', (req, res) => {
  res.send(loginResult);
});

module.exports = router;