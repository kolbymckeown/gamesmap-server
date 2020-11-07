/**
 * Basic example demonstrating passport-steam usage within Express framework
 * This example uses Express's router to separate the steam authentication routes
 */
const bodyParser = require('body-parser')
// https://radiant-lowlands-45367.herokuapp.com/
var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , session = require('express-session')
  , SteamStrategy = require('../../').Strategy
  , authRoutes = require('./routes/auth')
  , cors = require('cors');
  require('dotenv').config()
  console.log(process.env.PORT, process.env.NODE_ENV)
  // const { PORT } = require('./keys.js')
// console.log(PORT)
  const API_KEY = process.env.STEAM_API_KEY
  const CLIENT_DEV_URL = process.env.CLIENT_DEV_URL
  const SERVER_DEV_URL = process.env.SERVER_DEV_URL
  const fetch = require('node-fetch');
  const { putNotes } = require('../../handlers');
  // console.log(process.env.STEAM_API_KEY)


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
    returnURL: `${SERVER_DEV_URL}/auth/steam/return`,
    realm: `${SERVER_DEV_URL}/`,
    apiKey: `${API_KEY}`
  },
  function(identifier, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's Steam profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Steam account with a user record in your database,
      // and return that user instead.

      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

var app = express();

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.json())

app.use(session({
    secret: 'your secret', // TODO: Use with Databases
    name: 'loginToken',
    resave: true,
    saveUninitialized: true}));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
// app.use(express.static(__dirname + '/../../public'));
app.use(
  cors({
    origin: `${CLIENT_DEV_URL}`,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/test', function(req, res) {
  res.send('hello')
})

app.get('/account', ensureAuthenticated, function(req, res){
  // res.render('account', { user: req.user });
  console.log(req.user);
  // res.status(200).json({user: req.user})
  fetch( // gets the list of games owned with info by the User
    `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${API_KEY}&steamid=${req.user._json.steamid}&format=json&include_appinfo=1`
    , {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Access-Control-Allow-Credentials": true,
      },
      })
    .then((steamRes) => steamRes.json())
    .then((body) => res.status(200).json({ body: body.response, user: req.user }));
});


app.get('/game/:name/:id', function(req, res) {
  
  const { name, id } = req.params
  console.log(name, id)
  fetch(`https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${id}&format=json`
  , {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
    },
    })
    .then((res) => res.json())
    // .then(json => console.log(json.appnews.newsitems))
    .then((json) => res.status(200).json({ body: json.appnews.newsitems }))
}) 

app.get('/game/:name/:id/stats/:userId', function(req, res) {
  try {
  const { name, id, userId} = req.params
  
  fetch(`https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?key=${API_KEY}&steamid=${userId}&appid=${id}`
  , {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Credentials": true,
    },
    })
    .then((res) => res.json())
    .then((json) => res.status(200).json({ body: json.playerstats }))
  } catch(e) {
		res.status(500).json({ status: 500, message: err.message })
    console.error(e)
  }
})

app.put('/games/notes', putNotes)


app.get('/logout', function(req, res){
  req.logout();
  res.redirect(`${CLIENT_DEV_URL}/`);
});

// See views/auth.js for authentication routes
app.use('/auth', authRoutes);

// app.listen(process.env.PORT || 5000); <- Heroku
app.listen(8000)
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}
