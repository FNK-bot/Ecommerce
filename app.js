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

//configuring .env
dotenv.config();


//Routs 
const adminRouter = require('./routes/admin');
const usersRouter = require('./routes/users');

const app = express();//express instance
dbConnect()//calling database connection function

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 72 * 60 * 60 * 1000, // Session expires in 72 hours
    httpOnly: true,
  },
})
);

//Passport for Oauth (google login)
app.use(passport.initialize())
app.use(passport.session())

//Setting no cache 
app.use(nocache())


// routs middleware
app.use('/admin', adminRouter);
app.use('/', usersRouter);


// catch 404 and forward to error handler(for non existing url path)
app.use((req, res, next) => {
  next(createError(404));
});


// Custom Error Handler Middleware
app.use((err, req, res, next) => {
  // Set error details in locals, available for the view
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Check for specific error status codes
  if (err.status === 404) {
    // Render a custom 404 page
    res.status(404).render('error-responses/404', {
      title: 'Page Not Found',
      message: 'Sorry, the page you are looking for does not exist.'
    });
  } else if (err.status === 400) {
    // Handle 400 Bad Request
    res.status(400).render('error-responses/400', {
      title: 'Bad Request',
      message: 'The request could not be understood by the server due to malformed syntax.'
    });
  } else {
    // For other errors, including 500 Internal Server Error
    res.status(err.status || 500).render('error-responses/500', {
      title: 'Something Went Wrong',
      message: 'Please try again later. We are working on fixing it.'
    });
  }
});


module.exports = app;
