var express = require('express');
var router = express.Router();

router.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

router.use(express.raw({ type: 'application/pdf', limit: '20mb' }));

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

// POST user details
router.post('/userDetails', (req, res) => {
    res.send(req.session.user);
});

// POST ongoing review documents
router.post('/forapproval', (req, res) => {
    var query = `SELECT d.fileName, d.documentId
    FROM document AS d JOIN reviewtransaction AS rt ON d.documentId = rt.documentId WHERE rt.status = 'Ongoing' AND rt.email = '${req.session.user.email}'`;
    global.conn.query(query, (err, result) => {
        res.json(result);
    });
});

// POST approve document
router.post('/approve/:docId', (req, res) => {
    const { docId } = req.params;
    const userEmail = req.session.user.email;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    global.conn.query('UPDATE reviewtransaction SET status = "Approved" WHERE documentId = ? AND email = ?', [docId, userEmail], (err, result) => {
        if (err) {
            res.status(404);
        }
    });
    global.conn.query('UPDATE reviewtransaction SET approvedDate = ? WHERE documentId = ? AND email = ?', [formattedDate, docId, userEmail], (err, result) => {
        if (err) {
            res.status(404);
        }
    });
    global.conn.query(`UPDATE reviewtransaction AS rt_current JOIN reviewtransaction AS rt_next ON rt_current.documentId = rt_next.documentId
            AND rt_current.sequenceOrder = rt_next.sequenceOrder - 1 SET rt_next.status = 'Ongoing' WHERE rt_current.documentId = ? AND rt_current.email = ?;`, [docId, userEmail], (err, result) => {
        if (err) {
            res.status(404);
        }
    });
    res.status(202);
});

// POST disapprove document
router.post('/disapprove/:docId', (req, res) => {
    const { docId } = req.params;
    const userEmail = req.session.user.email;
    const content = req.body;
    global.conn.query(`UPDATE reviewtransaction SET status = "Disapproved" WHERE documentId = ? AND email = ?`, [docId, userEmail], (err, result) => {
        if (err) {
            res.status(404);
        }
    });
    global.conn.query('UPDATE document SET content = ? WHERE documentId = ?', [content, docId], (err, result) => {
        if (err) {
            res.status(404);
        }
    });
    res.status(202);
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