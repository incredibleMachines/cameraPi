var express = require('express');
var fs = require('fs');
var less = require('less-middleware');
var path = require('path');
var http = require('http');
var _ = require('underscore');
var socketIO = require('socket.io')


/**  TRIGGER UDP CONNECT ***/
var dgram = require('dgram');

var TRIGGER_IP = '192.168.0.199'
var TRIGGER_PORT = '7998'


var socket, io, server

var MasterSettings = require(__dirname +'/modules/loadSettings.js');
var Database = require(__dirname+'/modules/dbConnection.js');

Database.MongoConnect();

var app = express();

var settings=require( __dirname +'/routes/settings');
var controls=require( __dirname +'/routes/controls');
var images=require( __dirname +'/routes/images');
var cameras = require( __dirname+'/routes/cameras')


app.locals._ = _

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




server = http.createServer(app)
io = socketIO.listen(server)

//server.listen(9000)

server.listen(app.get('port'), function(){
	  console.log('Express server listening on port ' + app.get('port').toString());
});


io.sockets.on('connection', function(socket){
  console.log('new socket connection')
  //socket.emit('data',{hello:'world'})

  socket.on('go',function(data){
    console.log('got go message')
    var udpclient = dgram.createSocket("udp4");
    var goMessage = new Buffer('go')
    udpclient.send(goMessage,0,goMessage.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
      if(err) console.error(err)
      udpclient.close()
    })

  })

  socket.on('kick',function(data){
    console.log('got kick message')
    var udpclient = dgram.createSocket("udp4");
    var kickMessage = new Buffer('kick')
    udpclient.send(kickMessage,0,kickMessage.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
      if(err) console.error(err)
      udpclient.close()
    })
  })

  socket.on('goal',function(data){
    console.log('got goal message')
    var udpclient = dgram.createSocket("udp4");
    var goalMessage = new Buffer('goal')
    udpclient.send(goalMessage,0,goalMessage.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
      if(err) console.error(err)
      udpclient.close()
    })
  })

  socket.on('miss',function(data){
    console.log('got miss message')
    var udpclient = dgram.createSocket("udp4");
    var missMessage = new Buffer('miss')
    udpclient.send(missMessage,0,missMessage.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
      if(err) console.error(err)
      udpclient.close()
    })
  })

  socket.on('wiff',function(data){
    console.log('got wiff message')
    var udpclient = dgram.createSocket("udp4");
    var wiffMessage = new Buffer('wiff')
    udpclient.send(wiffMessage,0,wiffMessage.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
      if(err) console.error(err)
      udpclient.close()
    })
  })

  socket.on('reset',function(data){
    console.log('got reset message')
    var udpclient = dgram.createSocket("udp4");
    var resetMessage = new Buffer('reset')
    udpclient.send(resetMessage,0,resetMessage.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
      if(err) console.error(err)
      udpclient.close()
			controls.reset(Database)
    })
  })
})

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

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
app.get('/controller',controls.renderPage(Database))
app.get('/trigger',controls.triggerCameras())
app.get('/cameras/ping',controls.pingCameras())
app.get('/images',images.renderPage(Database))
app.post('/save-image',images.saveImage(Database))
app.get('/set-camera',images.setCamera())
app.get('/gitpull',controls.gitPull(Database))
app.get('/shutdown',controls.shutdown(Database))
app.post('/cameras/init',settings.initCamera())

app.get('/send-armed',controls.sendArmed(Database))
app.post('/cameras/images/center',images.saveCentered(Database))

app.get('/cameras/all',cameras.index(Database))

app.get('/processed',controls.processed(Database,io))

app.post('/scan',controls.scan(Database))
app.post('/scanned',controls.scanned(Database,io))

app.get('/go',function(req,res){
	res.jsonp({sent:'go'})
	var udpclient = dgram.createSocket("udp4");
	var goMessage = new Buffer('go')
	udpclient.send(goMessage,0,goMessage.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
		if(err) console.error(err)
		udpclient.close()
	})

})
