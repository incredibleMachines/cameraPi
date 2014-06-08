var express = require('express');
var fs = require('fs');
var less = require('less-middleware');
var path = require('path');
var http = require('http');

var app = express();

app.set('port', process.env.PORT || 3002);
app.set('title', 'Camera Controller');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.cookieParser('CamerControlApp'));
app.use( less( {src: __dirname+ '/public', force: true } ) );
app.use(express.session({secret: '!@#$%^&*()1234567890qwerty'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.get('/', function(req,res){
		res.render('test-page', {})
})

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port '.grey + app.get('port').toString().cyan);
});




