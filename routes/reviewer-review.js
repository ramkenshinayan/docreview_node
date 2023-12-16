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

// POST documents
router.post('/forapproval', (req, res) => {
    const { reviewer } = req.params;
    global.conn.query(`SELECT d.fileName, d.documentId, rt.email
    FROM document AS d JOIN reviewtransaction AS rt ON d.documentId = rt.documentId
    WHERE rt.email = '${req.session.user.email}' AND rt.sequenceOrder = 1 
    UNION SELECT d.fileName, d.documentId, rt.email FROM document AS d JOIN reviewtransaction AS rt ON d.documentId = rt.documentId
    JOIN reviewtransaction AS rt_prev ON rt.documentId = rt_prev.documentId AND rt.sequenceOrder = rt_prev.sequenceOrder + 1
    WHERE rt.email = '${req.session.user.email}' AND rt_prev.status != 'Pending'; `, (err, result) => {
        res.json(result);
    });
});

router.post('/approve/:docId', (req, res) => {
    const { docId } = req.params;
    const userEmail = req.session.user.email;
    global.conn.query('UPDATE reviewtransaction SET status = "Approved" WHERE documentId = ? AND email = ?', [docId, userEmail]);
});

router.post('/disapprove/:docId', (req, res) => {
    const { docId } = req.params;
    const userEmail = req.session.user.email;
    // const content = req.body.anno;
    global.conn.query('UPDATE reviewtransaction SET status = "Disapproved" WHERE documentId = ? AND email = ?', [docId, userEmail]);
});

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

// POST document type
router.post('/typedoc/:docId', (req, res) => {
    const { docId } = req.params;
    global.conn.query('SELECT * FROM document WHERE documentId = ?', [docId], (err, result) => {
        if (err) {
            res.status(500).json({ error: 'Document ID not found in the server' });
        }
        const docType = result[0].fileType;
        res.send(docType);
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