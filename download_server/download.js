var express = require('express')
var http = require('http')
var path = require('path')
var fs = require('fs')
var http = require('http')

var download=require( __dirname +'/routes/download');

var app = express()



app.set('port', process.env.PORT || 3001)
app.set('title', 'Image Downloader')
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.set("jsonp callback", true)
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser({limit:'1000mb', uploadDir: 'tmp', keepExtensions: true})) //temporary folder to store images on upload
app.use(express.methodOverride())
app.use(express.cookieParser('30_PP_ControllerApp'))
app.use(express.session({secret: '!@#$%^&*()1234567890qwerty'}))
app.use(express.static(path.join(__dirname, 'public')))
app.use(app.router)

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

var imageCounter = 0;


app.post('/',download.saveImage())
app.get('/get-cameras',download.getCameraInfo())
app.get('/init',download.initDownload())


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port '+ app.get('port').toString())
});
