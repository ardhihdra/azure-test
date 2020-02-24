var express = require('express');
var router = express.Router();
const app = require('../app/main'); 

/* GET home page. */
router.get('/', (req, res) => { app.mainPage(req, res) });

router.post('/book/new', (req, res) => { app.newBook(req, res) });

router.post('/book/search', (req, res) => { app.searchBook(req, res) });

router.get('/books', (req, res) => { app.getBooks(req, res) });

/** Public API HEHE */
router.get('/catalogue', (req, res) => { app.getCatalogue(req, res)});

router.post('/catalogue', (req, res) => { app.addCatalogue(req, res)});

module.exports = router;
