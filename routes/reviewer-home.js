var express = require('express');
var router = express.Router();

// GET reviewer-home page
router.get('/reviewer-home', (req, res, next) => {
    res.redirect('reviewer-home');
});

// GET reviewer-view page
router.get('/reviewer-view', (req, res, next) => {
    res.redirect('reviewer-view');
});

// GET reviewer-add page
router.get('/reviewer-add', (req, res, next) => {
    res.redirect('reviewer-add');
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

module.exports = router;