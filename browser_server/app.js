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
var controls=require( __dirname +'/routes/controls');
var images=require( __dirname +'/routes/images');

app.set('port', process.env.PORT || 3000);
app.set('title', 'Camera Controller');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set("jsonp callback", true);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.bodyParser());
app.use(express.cookieParser('CameraControlApp'));
app.use( less( {src: __dirname+ '/public', force: true } ) );
app.use(express.session({secret: '!@#$%^&*()1234567890qwerty'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/cameras/settings', settings.load(Database))
app.post('/camera', settings.addCamera(MasterSettings.settings,Database))
app.get('/camera', settings.addCamera(MasterSettings.settings,Database))
app.get('/cameras/list', settings.displayCameras(Database))
app.post('/cameras/save', settings.saveCamera(Database))
app.post('/set', settings.saveSetting(Database))
app.get('/cameras/select', settings.selectCamera())
app.get('/arm', settings.armCameras(Database))
app.post('/cameras/delete',settings.deleteCamera(Database))
app.get('/getinfo',settings.getInfo(Database))
app.get('/setupDB', settings.setupDB(MasterSettings.settings,Database))
app.get('/controller',controls.renderPage())
app.get('/trigger',controls.triggerCameras())
app.get('/cameras/ping',controls.pingCameras())
app.get('/images',images.renderPage(Database))
app.post('/save-image',images.saveImage(Database))
app.get('/set-camera',images.setCamera())
app.get('/gitpull',controls.gitPull(Database))
app.get('/shutdown',controls.shutdown(Database))
app.post('/cameras/init',settings.initCamera())

http.createServer(app).listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port').toString());
});
