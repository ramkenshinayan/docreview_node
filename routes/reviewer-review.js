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

// POST user details
router.post('/userDetails', (req, res) => {
    res.send(req.session.user);
});

// TODO make it so that the documents are only for the current reviewer
// POST documents
// TODO query, should be the specified reviewer
router.post('/forapproval', (req, res) => {
    const { reviewer } = req.params;
    global.conn.query(`SELECT d.fileName, d.documentId, rt.email FROM document AS d JOIN reviewtransaction AS rt 
    ON d.documentId = rt.documentId WHERE rt.email = '${req.session.user.email}' `, (err, result) => {
        res.json(result);
    });
});

router.get('/approve', (req, res) => {
    const encodedData = req.body.encodedData;
    const documentName = decodeURIComponent(encodedData);

    global.conn.query(`SELECT d.documentId FROM document AS d JOIN reviewtransation AS rt 
    ON d.documentId = rt.documentId WHERE rt.email = '${req.session.user.email}' AND d.fileName = '${documentName}'`, (err, result) => {
        const documentId = result[0].documentId;
        const sequence = result[0].sequenceOrder;
        global.conn.query(`UPDATE reviewtransaction SET status = 'Approved' WHERE documentid = '${documentId}'AND email = '${req.session.user.email}'`);
    });
})

// POST document blob
router.post('/blobdoc/:docId', (req, res) => {
    const { docId } = req.params;
    global.conn.query('SELECT * FROM document WHERE documentId = ?', [docId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Document ID not found in the server' });
        }
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