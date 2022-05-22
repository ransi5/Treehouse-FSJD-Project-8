var express = require('express');
var router = express.Router();
var models = require('../models/index');
const querystring = require('querystring');
const { Op } = require('sequelize'); //to get `sequelize.Op` model for `findAndCount` function

/* GET home page to redirect to `/books`. */

router.get('/', async (req, res) => {
  res.redirect("./books")
});

/* GET route to render all books */

router.get('/books', async (req, res, next) => {
  try {
    let text = req.query.search ? req.query.search : '';
    let perpage = req.query.perpage ? parseInt(req.query.perpage) : 6;
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let offset = (page * perpage) - perpage;
    let books = await findAndCount(req, text, offset, perpage);

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

/* GET route to render search and render search results and pages */

router.get('/books/query?:query', async (req, res, next) => {
  try {
    let text = req.query.search ? req.query.search : '';
    let perpage = req.query.perpage ? parseInt(req.query.perpage) : 6;
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let offset = (page * perpage) - perpage;
    let books = await findAndCount(req, text, offset, perpage);

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

/* GET route to render form to add new book to db */

router.get('/books/new', (req, res) => {
  res.render('new-book', { title: 'New Book', updated: 0 });
});

/* POST route to add new book to db and render success and error messages */

router.post('/books/new', async (req, res) => {
  try {
    let updated = await models.Book.create({
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      year: req.body.year
    });

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

/* GET route to render the selected book and update form */

router.get('/book/:id', async (req, res, next) => {
  try {
    let query = req.params.id;
    let book = await models.Book.findByPk(query);
    if (book) {
      res.render('update-book', { book: book });
    } else {
      const err = new Error("Sorry! We couldn't find the page you were looking for.");
      err.status = 404;
      err.name = "404 - Page not found"
      next(err);
    }
  } catch (e) {
    next(e)
  }
});

/* POST route to update Database and success and error messages */

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

/* POST route to delete selected book and display error and success messages */

router.post('/book/:id/delete', async (req, res) => {
  let query = req.params.id;
  try {
    let deleted = await models.Book.destroy({ where: { id: query }});
    let text = req.query.search ? req.query.search : '';
    let perpage = req.query.perpage ? parseInt(req.query.perpage) : 6;
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let offset = (page * perpage) - perpage;
    console.log(page, offset)
    let books = await findAndCount(req, text, offset, perpage);

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

/* `findAndCount` function to search all columns in Book model with `findAndCountAll` method */

function findAndCount(req, text, offset, perpage) {

  let books = models.Book.findAndCountAll({
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
    return books;
}

module.exports = router;
