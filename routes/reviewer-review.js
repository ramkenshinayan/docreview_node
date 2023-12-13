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

// GET reviewer-review page
router.get('/reviewer-review', (req, res, next) => {
    res.render('reviewer-review');
});

// GET user details
router.get('/userDetails', (req, res) => {
    res.send(req.session.user);
});

// GET documents
// TODO query, should be the specified reviewer
router.get('/forapproval', (req, res) => {
    global.conn.query('SELECT * FROM document', (err, result) => {
        res.json(result);
    });
});

// GET blob
router.get('/blobdoc/:docId', (req, res) => {
    const { docId } = req.params;
    global.conn.query('SELECT content FROM document WHERE documentId = ?', [docId], async (err, result) => {
        const docBlob = result[0].content;
        res.send(docBlob);
    });
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