var express = require('express');

var http = require('http');
var path = require('path');
var fs = require('fs')


var app = express();

app.set('port', process.env.PORT || 3001);
app.set('title', 'Image Downloader');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({limit:'1000mb', uploadDir: 'tmp', keepExtensions: true})); //temporary folder to store images on upload
app.use(express.methodOverride());
app.use(express.cookieParser('30_PP_ControllerApp'));
app.use(express.session({secret: '!@#$%^&*()1234567890qwerty'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var imageCounter = 0;
app.post('/',function(req,res){
  res.jsonp({post:true})
  //console.log(req)
  var post = req.body;
  //console.log(post)
  var files = req.files;
  //console.log(files)
  var image = files.image
  //console.log(image)
  var file = image.originalFilename.substr(0,image.originalFilename.indexOf('.'))
  //need to create unique image paths here
  fs.rename(image.path,'images/'+file+'-'+imageCounter+'.jpg', function(err){
    imageCounter++;
    if(err) console.error(err)
    console.log('Image Saved.')
  })
})



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port '+ app.get('port').toString());
});
