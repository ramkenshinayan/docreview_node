var express = require('express');
var router = express.Router();
var mysql = require('mysql');

router.use(express.urlencoded({ extended: true }));

// Database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'docreview'
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
            const query = `SELECT rt.*, d.fileName AS DocumentName, d.uploadDate AS UploadDate, rs.email AS email, rt.Status AS status
            FROM reviewtransaction AS rt JOIN document AS d ON rt.DocumentID = d.documentID
            LEFT JOIN reviewsequence AS rs ON rt.reviewId = rs.reviewId
            WHERE rt.documentId = d.documentId AND rs.email =  '${req.session.email}'`;
            
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
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET filter and sort
router.get('/and', (req, res) => {
    try {
        pool.getConnection((err, connection) => {
            let query = `SELECT rt.*, d.fileName AS DocumentName, d.uploadDate AS UploadDate, rs.email AS email, rt.Status AS status
            FROM reviewtransaction AS rt JOIN document AS d ON rt.DocumentID = d.documentID
            LEFT JOIN reviewsequence AS rs ON rt.reviewId = rs.reviewId
            WHERE rt.documentId = d.documentId AND rs.email = '${req.session.user.email}' `;

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