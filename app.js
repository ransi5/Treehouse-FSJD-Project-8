var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var {sequelize} = require('./models/index');

sequelize.authenticate()
  .then((result) => {
    console.log("Connection to db established.");
  })
  .then(() => {
    sequelize.sync()
      .then((res) => {
        console.log("Sync to db complete")
      })
      .catch((err) => {
        console.log("Sync to db failed: ", err)
      })
  })
  .catch((error) => {
    console.log("Unable to connect to db: ", error);
  });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error("Sorry! We couldn't find the page you were looking for.");
  err.status = 404;
  err.name = "404 - Page not found"
  next(err);
  // next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message ? err.message : "Sorry! There was an unexpected error on the server.";
  res.locals.name = err.name ? err.name : "Server Error";
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', { title: err.name ? err.name : "Server Error" });
});

module.exports = app;
