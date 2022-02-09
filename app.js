const path = require('path');
const fs = require('fs');

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const errorController = require('./controllers/error');

const MONGODB_URI =
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@online-shop.jnlat.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`

const urlRoutes = require('./routes/urls');
const authRoutes = require('./routes/auth');


const app = express();

const csrfProtection = csrf();

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'), {
  flags: 'a'
})

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();

})

app.use(authRoutes);
app.use('/url', urlRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error)
  res.status(500).render('500', {
    pageTitle: 'Error!',
    isAuthenticated: req.session.isLoggedIn
  });
});


mongoose.connect(MONGODB_URI)
  .then(result => {
    console.log('Database Connected');
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  })



