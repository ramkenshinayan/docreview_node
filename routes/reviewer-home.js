var express = require('express');
var router = express.Router();

// GET reviewer-home page
router.get('/reviewer-home', (req, res, next) => {
    res.render('reviewer-home');
});

// GET reviewer-view page
router.get('/reviewer-view', (req, res, next) => {
    res.render('reviewer-view');
});

// GET reviewer-add page
router.get('/reviewer-review', (req, res, next) => {
    res.render('reviewer-review');
});

// GET user details
router.get('/userDetails', (req, res) => {
    res.send(req.session.user);
});

// GET logout
router.get('/logout', (req, res) => {
    const email = req.session.user.email;
    global.conn.query('UPDATE users SET status="Offline" WHERE email= ?', [email], (error, result) => {
        // prompt on error
        if (error) {
            console.error(error);
        }
    });

    req.session.destroy();
    res.redirect('/');
});

// GET count documents
router.get('/total', (req, res) => {
    global.conn.query('SELECT * FROM reviewtransaction', (error, result) => {
        res.send(String(result.length));
    });
});

router.get('/toreview', (req, res) => {
    global.conn.query('SELECT * FROM reviewtransaction WHERE status="pending"', (error, result) => {
        res.send(String(result.length));
    });
});

router.get('/overdue', (req, res) => {
    // TODO approriate query
    // global.conn.query('SELECT * FROM reviewtransaction WHERE ', (error, result) => {
    //     res.send(String(result.length));
    // });
});

module.exports = router;