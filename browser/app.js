var express = require('express');
var fs = require('fs');
var less = require('less-middleware');
var path = require('path');
var http = require('http');

var MasterSettings = require(__dirname +'/modules/loadSettings.js');
var Database = require(__dirname+'/modules/dbConnection.js');

Database.MongoConnect();

var app = express();

var settings=require( __dirname +'/routes/settings');

app.set('port', process.env.PORT || 3000);
app.set('title', 'Camera Controller');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser('CamerControlApp'));
app.use( less( {src: __dirname+ '/public', force: true } ) );
app.use(express.session({secret: '!@#$%^&*()1234567890qwerty'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/cameras/settings', settings.load(MasterSettings.settings))
app.post('/cameras/add', settings.addCamera(Database))
app.get('/cameras/add', settings.addCamera(Database))
app.get('/cameras/list', settings.displayCameras(Database))
app.post('/cameras/save', settings.saveCamera(Database))

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port').toString());
});




