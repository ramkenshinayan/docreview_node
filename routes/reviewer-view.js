var express = require('express');
var router = express.Router();
var mysql = require('mysql');

router.use((req, res, next) => {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

router.use(express.urlencoded({ extended: true }));

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

// Database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'finaldb'
});

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
router.post('/userDetails', (req, res) => {
    res.send(req.session.user);
});

// GET list of transactions
router.get('/history', (req, res) => {
    try {
        pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error getting database connection:', err);
                res.status(500).json({ error: 'Internal Server Error' });
                return;
            }
            const query = `SELECT d.documentId AS docId, d.fileName AS DocumentName, d.email AS ReqEmail, d.uploadDate AS UploadDate, rt.email AS RevEmail, rt.Status AS status
        FROM reviewtransaction AS rt JOIN document AS d ON rt.DocumentID = d.documentID WHERE rt.email = '${req.session.user.email}'
        GROUP BY d.documentId`;

            connection.query(query, (queryError, results) => {
                connection.release();

                if (queryError) {
                    console.error('Error in query:', queryError);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    console.log(query);
                    console.log(results);
                    res.json(results);
                }
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET filter and sort
router.get('/and', (req, res) => {
    try {
        pool.getConnection((err, connection) => {
            let query = `SELECT d.documentId AS docId, d.fileName AS DocumentName, d.email AS ReqEmail, d.uploadDate AS UploadDate, rt.email AS RevEmail, rt.Status AS status, rt.approvedDate AS ReviewDate
            FROM reviewtransaction AS rt JOIN document AS d ON rt.DocumentID = d.documentID WHERE rt.email = '${req.session.user.email}'
            GROUP BY d.documentId`;

            const conditions = [];

            //filter
            const filterValues = req.query.filter;
            if (filterValues) {
                const filterArray = Array.isArray(filterValues) ? filterValues : [filterValues];
                const filterConditions = filterArray.map(value => `rt.status = '${value}'`);
                conditions.push(`(${filterConditions.join(" OR ")})`);
            }
            if (conditions.length > 0) {
                query += " AND " + conditions.join(" AND ");
            }

            // sort
            const sortValue = req.query.sort;
            if (sortValue) {
                switch (sortValue) {
                    case 'Name (A-Z)':
                        query += " ORDER BY d.fileName ASC";
                        break;
                    case 'Name (Z-A)':
                        query += " ORDER BY d.fileName DESC";
                        break;
                    case 'Date (ASC)':
                        query += " ORDER BY d.UploadDate ASC";
                        break;
                    case 'Date (DESC)':
                        query += " ORDER BY d.UploadDate DESC";
                        break;
                }
            }

            //search
            const searchTerm = req.query.search;
            if (searchTerm) {
                conditions.push(`d.fileName LIKE '%${searchTerm}%'`);
            }

            connection.query(query, (queryError, results) => {
                connection.release();

                if (queryError) {
                    console.error('Error in query:', queryError);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.json(results);
                }
            });
        });
    } catch (error) {
        console.error('Error in /data endpoint:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

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