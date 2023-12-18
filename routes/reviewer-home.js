var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

// GET reviewer-home page
router.get('/reviewer-home', (req, res,) => {
    if (req.session.user) {
        res.render('reviewer-home');
    } else {
        res.redirect(302, '/');
    }
});

// GET reviewer-view page
router.get('/reviewer-view', (req, res) => {
    if (req.session.user) {
        res.render('reviewer-view');
    } else {
        res.redirect(302, '/');
    }
});

// GET reviewer-review page
router.get('/reviewer-review', (req, res) => {
    if (req.session.user) {
        res.render('reviewer-review');
    } else {
        res.redirect(302, '/');
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
    req.session = null;
    res.redirect('/');
});

// GET count documents
router.get('/total', (req, res) => {
    global.conn.query(`SELECT DISTINCT d.documentId AS total FROM document AS d JOIN reviewtransaction AS rt ON d.documentId = rt.documentId WHERE rt.email = '${req.session.user.email}'`, (error, result) => {
        if (result && result.length > 0) {
            res.send(String(result[0].total));
        } else {
            res.send('0');
        }
    });
});

router.get('/toreview', (req, res) => {
    global.conn.query(`SELECT DISTINCT d.documentId AS total FROM document AS d JOIN reviewtransaction AS rt ON d.documentId = rt.documentId WHERE rt.status = 'Pending' AND rt.email = '${req.session.user.email}'`, (error, result) => {
        if (result && result.length > 0) {
            res.send(String(result[0].total));
        } else {
            res.send('0');
        }
    });
});

router.get('/overdue', (req, res) => {
    global.conn.query(`SELECT DISTINCT d.documentId AS total FROM document AS d JOIN reviewtransaction AS rt ON d.documentId = rt.documentId WHERE uploadDate < NOW() - INTERVAL 1 WEEK AND rt.email = '${req.session.user.email}'`, (error, result) => {
        if (result && result.length > 0) {
            res.send(String(result[0].total));
        } else {
            res.send('0');
        }
    });
});

module.exports = router;