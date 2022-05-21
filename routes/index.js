var express = require('express');
var router = express.Router();
var models = require('../models/index');
const querystring = require('querystring');
const { Op } = require('sequelize');

/* GET home page. */

router.get('/', async (req, res) => {
  res.redirect("./books/search/query")
});

router.get('/books/search/:query', async (req, res, next) => {
  try {
    let text = req.query.search ? req.query.search : '';
    let perpage = req.query.perpage ? parseInt(req.query.perpage) : 6;
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let offset = (page * perpage) - perpage;
    console.log(page, offset)
    let books = await models.Book.findAndCountAll({
      where: {
        [Op.or]: [
            {
              title: {
                [Op.substring]: `${text}`
              }
            },
            {
              author: {
                [Op.substring]: `${text}`
              }
            },
            {
              genre: {
                [Op.substring]: `${text}`
              }
            },
            {
              year: {
                [Op.substring]: `${text}`
              }
            }
          ]
        },
        offset: offset,
        limit: perpage
      });
      // res.json(books);
    res.render('index', {
      title: 'Books',
      books: books.rows,
      searchQ: text,
      page: page,
      perpage: perpage,
      results: books.count,
      count: Math.ceil(books.count/perpage)
    });
  } catch (e) {
    next(e);
  }

});

router.get('/books/new', (req, res) => {
  res.render('new-book', { title: 'New Book' });
});

router.post('/books/new', async (req, res) => {
  try {
    let updated = await models.Book.create({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      year: req.body.year
    });
    // res.send(updated);
    res.render('new-book', {
      title: 'New Book',
      updated: updated
    });
  } catch (error) {
    res.render('new-book', {
      title: 'New Book',
      errors: error.errors
    });
  }

});

router.get('/book/:id', async (req, res) => {
  let query = req.params.id;
  let book = await models.Book.findByPk(query);
  // res.json(book);
  res.render('update-book', {
    book: book,
  });
});

router.post('/book/:id', async (req, res) => {
  let query = req.params.id;
  try {
    let updated = await models.Book.update({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      year: req.body.year,
    },
    {
      where: { id: query }
    });
    let book = await models.Book.findByPk(query);
    res.render('update-book', { book: book, updated: updated});
  } catch (error) {
    let book = await models.Book.findByPk(query);
    res.render('update-book', {
      book: book,
      errors: error.errors
    });
  }


});

router.post('/book/:id/delete', async (req, res) => {
  let query = req.params.id;
  try {
    let deleted = await models.Book.destroy({ where: { id: query }});
    let text = req.query.search ? req.query.search : '';
    let perpage = req.query.perpage ? parseInt(req.query.perpage) : 6;
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let offset = (page * perpage) - perpage;
    console.log(page, offset)
    let books = await models.Book.findAndCountAll({
      where: {
        [Op.or]: [
            {
              title: {
                [Op.substring]: `${text}`
              }
            },
            {
              author: {
                [Op.substring]: `${text}`
              }
            },
            {
              genre: {
                [Op.substring]: `${text}`
              }
            },
            {
              year: {
                [Op.substring]: `${text}`
              }
            }
          ]
        },
        offset: offset,
        limit: perpage
      });
      // res.json(books);
    res.render('index', {
      title: 'Books',
      books: books.rows,
      searchQ: text,
      page: page,
      perpage: perpage,
      results: books.count,
      count: Math.ceil(books.count/perpage),
      deleted: deleted
    });
  } catch (e) {
    let book = await models.Book.findByPk(query);
    res.render('update-book', {
      book: book,
      updated: deleted,
      errors: error
    });
  }

});

module.exports = router;
