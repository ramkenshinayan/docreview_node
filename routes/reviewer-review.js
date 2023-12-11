var express = require('express');
var router = express.Router();
var { PDFNet } = require('@pdftron/pdfnet-node');

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

router.use('/view', (req, res) => {
    // const main = async() => {
    //     const doc = await PDFNet.PDFDoc.create();
    //     const page = await doc.pageCreate();
    //     doc.pagePushBack(page);
    //     doc.save('blank.pdf', PDFNet.SDFDoc.SaveOptions.e_linearized);
    //   };


    //   PDFNet.runWithCleanup(main, 'demo:1702297684561:7cb553e9030000000051939215593a83d430f7d0d7d5738e9fc5a8e26b').catch(function(error) {
    //     console.log('Error: ' + JSON.stringify(error));
    //   }).then(function(){ return PDFNet.shutdown(); });
    const fileId = req.params.id;

    // Query to fetch the PDF blob from the database based on ID
    const query = 'SELECT content FROM document WHERE documentid = 0';

    global.conn.query(query, (err, results) => {
        const pdfBlob = results[0].content;
        // Send the PDF blob as response
        res.send(pdfBlob);
    });
});

module.exports = router;