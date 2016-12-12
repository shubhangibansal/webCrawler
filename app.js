"use strict";
var util = require('util');
var express = require('express');
var app = express();
var expressSess = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var RedisStore = require('connect-redis')(expressSess);

app.use(cookieParser()); //note should be used before session
app.use(expressSess({
	key: 'crawl',
	store: new RedisStore({
		host: 'localhost',
		port: 6379,
		ttl: 30 * 60 // in secs
	}),
	resave: false,
	saveUninitialized: false,
	secret: '1234567890987654',
	cookie: {
		domain: 'abc.com',
		maxAge: 1000000000 //in ms
	}
}));


app.use(bodyParser.json({
	limit: '10mb'
}));
app.use(bodyParser.urlencoded({
	extended: true,
	limit: '10mb',
	parameterLimit: '5000'
}));

require('./index')(app);

app.set('port', process.env.PORT || 3333);

app.on('error', function(err) {
	util.log(err);
	process.exit(1);
});
app.listen(app.get('port'), function() {
	util.log("Web Crawler listening on port " + app.get('port') + ' in ' + app.get('env'));
});