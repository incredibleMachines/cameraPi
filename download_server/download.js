var express = require('express')
var http = require('http')
var path = require('path')
var fs = require('fs')
var cors = require('cors')


var download=require( __dirname +'/routes/download')


var app = express()

app.set('port', process.env.PORT || 3001)
app.set('title', 'Image Downloader')
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')
app.set("jsonp callback", true)
app.use(cors())
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

app.listen(8081)

var imageCounter = 0

app.get('/set-method',download.setMethod())
app.post('/:take_id',download.saveImageTake())
app.post('/',download.saveImage())
app.get('/init',download.initDownload())
app.get('/process',download.startProcessing())



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port '+ app.get('port').toString())
})
