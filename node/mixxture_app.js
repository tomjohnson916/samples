'use strict';

var express = require('express'),
  cons = require('consolidate'),
  swig = require('swig'),
  http = require('http'),
  path = require('path'),
  url = require('url'),
  io = require('socket.io'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  config = require('./src/config'),
  MongoStore = require('connect-mongo')(express),
  router = require('./routes/router'),
  mixxture = express();

swig.init({
  allowErrors: true,
  autoescape: true,
  cache: false,
  encoding: 'utf8',
  filters: {},
  root: __dirname + '/views',
  tags: {},
  extensions: {},
  tzOffset: 0
});

// Application Setup
mixxture.configure('development', function() {
  mixxture.use(express.logger('dev'));
  mixxture.use(express.bodyParser());
  mixxture.use(express.methodOverride());
  mixxture.use(express.cookieParser(config.csrf_secret));
  mixxture.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
  mixxture.use(express.static(path.join(__dirname, 'public')));

  mixxture.use(express.session({ store: new MongoStore({ db: 'db_session', url: config.database.uri }),
    secret: config.csrf_secret,
    key: '__mixx.sid',
    cookie: { maxAge: 14*24*60*60*1000 }
  }));

  mixxture.use(passport.initialize());
  mixxture.use(passport.session());

  router(mixxture);

});

mixxture.configure('production', function() {
  mixxture.engine('.html', cons.swig);
  mixxture.disable('x-powered-by');
  mixxture.set('port', config.port);
  mixxture.set('views', __dirname + '/views');
  mixxture.set('view engine', 'html');
  mixxture.use(express.logger('dev'));
  mixxture.use(express.bodyParser());
  mixxture.use(express.methodOverride());
  mixxture.use(express.cookieParser(config.csrf_secret));
  mixxture.use(express.favicon(path.join(__dirname, 'public/favicon.ico')));
  mixxture.use(express.static(path.join(__dirname, 'public')));

  mixxture.use(express.session({ store: new MongoStore({ db: 'db_session', url: config.database.uri }),
    secret: config.csrf_secret,
    key: '__mixx.sid',
    cookie: { maxAge: 14*24*60*60*1000 }
  }));

  mixxture.use(passport.initialize());
  mixxture.use(passport.session());

  router(mixxture);

});

// Start Server
var server = http.createServer(mixxture).listen(mixxture.get('port'), function() {
  console.log("Mixxture Web Server, port:", mixxture.get('port'), 'env:', process.env.NODE_ENV);
});

module.exports.app = mixxture;
module.exports.router = router;