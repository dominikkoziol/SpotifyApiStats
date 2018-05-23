"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debug = require("debug");
var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var corse = require('cors');
var request = require('request');
var index_1 = require("./routes/index");
var user_1 = require("./routes/user");
var app = express();
var clientId = 'eda7cb802a37453190d0d66551507e64';
var secretKey = '54f6b6ea4cbe4c7586401bf407b37bb8';
/** * @description przekierowanie do stronny jeśli callback będzie success */
var redirectUri = 'http://localhost:1337/callback';
var stateKey = 'spotify_auth_state';
var userData;
//var cors = function (req, res, next) {
//    // Website you wish to allow to connect
//    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:1337');
//    // Request methods you wish to allow
//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//    // Request headers you wish to allow
//    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//    // Set to true if you need the website to include cookies in the requests sent
//    // to the API (e.g. in case you use sessions)
//    res.setHeader('Access-Control-Allow-Credentials', 'true');
//    // Pass to next layer of middleware
//    next();
//};
var cors = require('cors');
// use it before all route definitions
app.use(cors({ origin: 'http://localhost:1337' }));
//Http body to JSON Parse
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/login', function (req, res, next) {
    var scopes = 'user-read-private user-read-email user-top-read user-library-read user-read-recently-played';
    res.send('https://accounts.spotify.com/authorize' +
        '?response_type=code' +
        '&client_id=' + clientId +
        (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
        '&redirect_uri=' + encodeURIComponent(redirectUri));
});
app.get('/callback', function (req, res) {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + (new Buffer(clientId + ':' + secretKey).toString('base64'))
        },
        json: true
    };
    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token, refresh_token = body.refresh_token;
            var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
            };
            // use the access token to access the Spotify Web API
            request.get(options, function (error, response, body) {
                userData = body;
                res.redirect("http://localhost:1337/#/home");
            });
        }
    });
});
app.get("/userdata", function (req, res) {
    res.send(userData);
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index_1.default);
app.use('/users', user_1.default);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err['status'] = 404;
    next(err);
});
// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});
app.set('port', process.env.PORT || 1337);
var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
//# sourceMappingURL=app.js.map