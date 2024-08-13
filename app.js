const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const dbConnect = require('./config/db')
const passport = require('./config/passport');
const nocache = require('nocache');
const dotenv = require('dotenv');


dotenv.config();
// const methodOverRide =require('method-override')
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

const app = express();
dbConnect()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// //method overide
// app.use(methodOverRide('_method'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 72 * 60 * 60 * 1000, // Session expires in 72 hours
    httpOnly: true,
  },
})
);

app.use(passport.initialize())
app.use(passport.session())
app.use(nocache())


// routs
app.use('/admin', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
