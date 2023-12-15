var express = require('express');
var router = express.Router();

// GET reviewer-home page
router.get('/reviewer-home', (req, res, next) => {
    if (req.session.user) {
        res.render('reviewer-home');
    } else {
        res.render('index');
    }
});

// GET reviewer-view page
router.get('/reviewer-view', (req, res, next) => {
    if (req.session.user) {
        res.render('reviewer-view');
    } else {
        res.render('index');
    }
});

// GET reviewer-add page
router.get('/reviewer-review', (req, res, next) => {
    if (req.session.user) {
        res.render('reviewer-review');
    } else {
        res.render('index');
    }
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
    global.conn.query(`SELECT DISTINCT documentId FROM document WHERE email = '${req.session.user.email}'`, (error, result) => {
        res.send(String(result[0].documentId));
    });
});

router.get('/toreview', (req, res) => {
    global.conn.query(`SELECT DISTINCT d.documentId FROM document AS d JOIN reviewtransaction AS rt ON d.documentId = rt.documentId WHERE rt.status = 'Pending' AND d.email = '${req.session.user.email}'`, (error, result) => {
        res.send(String(result[0].documentId));
    });
});

router.get('/overdue', (req, res) => {
    global.conn.query(`SELECT DISTINCT documentId FROM document WHERE uploadDate < NOW() - INTERVAL 1 WEEK AND email = '${req.session.user.email}'`, (error, result) => {
        res.send(String(result[0].total));
    });
});

module.exports = router;