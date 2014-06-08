var express = require('express');
var fs = require('fs');
var less = require('less-middleware');
var path = require('path');
var http = require('http');

var app = express();

app.set('port', process.env.PORT || 3000);
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


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port '.grey + app.get('port').toString().cyan);
});

var settings = [
  { name: 'Manual Focus', call: 'manualfocusdrive', value: 3, options: [{name:'Near 1'},{name:'Near 2'},{name:'Near 3'},{name:'None'},{name:'Far 1'},{name:'Far 2'},{name:'Far 3'}]},
  { name: 'Sync Date/Time', call: 'datetime', value: Math.round(new Date().getTime() / 1000) },
  { name: 'Quick Review', call: 'reviewtime', value: 0, options:[{name:'None'}, {name:'2 seconds'},{name: '4 seconds'},{name:'8 seconds'},{name:'Hold'}]},
  { name: 'EVF Mode', call: 'evfmode', value: 0, options:[{name:'0'},{name:'1'}]},
  { name: 'Capture Target', call: 'capturetarget', value: 0, options:[{name:'Internal RAM'},{name:'Memory card'}]},
  { name: 'Battery Level', call: 'batterylevel', value: "GET" },
  { name: 'Lens Name Label', call: 'lensname', value: "GET" },
  { name: 'EOS Serial Number', call: 'eosserialnumber', value: "GET" },
  { name: 'Available Shots', call: 'availableshots', value: "GET" },
  { name: 'Image Format', call: 'imageformat', value: 0, options:[{name:'Large Fine JPEG'},{name:'Large Normal JPEG'},{name:'Medium Fine JPEG'},{name:'Medium Normal JPEG'},{name:'Small Fine JPEG (S1 Fine)'},{name:'Small Normal JPEG (S1 Normal)'},{name: 'Smaller JPEG (S2)'},{name:'Tiny JPEG (S3)'},{name:'RAW + Large Fine JPEG'},{name:'RAW'}] },
  { name: 'ISO', call: 'iso', value: 6 , options:[{name:'Auto'},{name:'100'},{name:'200'},{name:'400'},{name:'800'},{name:'1600'},{name: '3200'},{name:'6400'}]},
  { name: 'White Balance', call: 'whitebalance', value: 5, options:[{name:'Auto'},{name:'Daylight'},{mame:'Shadow'},{name:'Cloudy'},{name:'Tungsten'},{name:'Fluorescent'},{name:'Flash'},{name:'Manual'}]},
  { name: 'White Balance Adjust A', call: 'whitebalanceadjusta', value: 9, options:[{name:'-9'},{name:'-8'},{name:'-7'},{name:'-6'},{name:'-5'},{name:'-4'},{name:'-3'},{name:'-2'},{name:'-1'},{name:'0'},{name:'1'},{name:'2'},{name:'3'},{name:'4'},{name:'5'},{name:'6'},{name:'7'},{name:'8'},{name:'9'}] },
  { name: 'White Balance Adjust B', call: 'whitebalanceadjustb', value: 9, options:[{name:'-9'},{name:'-8'},{name:'-7'},{name:'-6'},{name:'-5'},{name:'-4'},{name:'-3'},{name:'-2'},{name:'-1'},{name:'0'},{name:'1'},{name:'2'},{name:'3'},{name:'4'},{name:'5'},{name:'6'},{name:'7'},{name:'8'},{name:'9'}]  },
  { name: 'White Balance XA', call: 'whitebalancexa', value: 0 },
  { name: 'White Balance XB', call: 'whitebalancexb', value: 0 },
  { name: 'Color Space', call: 'colorspace', value: 0, options:[{name:'sRGB'},{name:'sRGB'}] },
  { name: 'Auto Exposure Mode', call: 'autoexposuremode', value: 3, options:[{name:'P'},{name:'TV'},{name:'AV'},{name:'Manual'},{name:'Bulb'},{name:'A_DEP'},{name:'DEP'},{name:'Custom'},{name:'Lock'},{name:'Green'},{name:'Night Portrait'},{name:'Sports'},{name:'Portrait'},{name:'Landscape'},{name:'Closeup'},{name:'Flash Off'}]},
  { name: 'Drive Mode', call: 'drivemode', value: 0, options:[{name:'Single'},{name:'Continuous'},{name:'Timer 10 sec'},{name:'Timer 2 sec'},{name:'Unknown value 0007'}] },
    { name: 'Picture Style', call: 'picturestyle', value: 0, options:[{name:'Standard'},{name:'Portrait'},{name:'Landscape'},{name:'Neutral'},{name:'Faithful'},{name:'Monochrome'},{name:'User defined 1'},{name:'User defined 2'},{name:'User defined 3'}] },
  { name: 'Aperture', call: 'apeture', value: 0 ,options:[{name:'3.5'},{name:'4'},{name:'4.5'},{name:'5'},{name:'5.6'},{name:'6.3'},{name:'7.1'},{name:'8'},{name:'9'},{name:'10'},{name:'11'},{name:'13'},{name:'14'},{name:'16'},{name:'18'},{name:'20'},{name:'22'}]},
    { name: 'Shutter Speed', call: 'shutterspeed', value: 37, options:[{name:'bulb'},{name:'30'},{name:'25'},{name:'20'},{name:'15'},{name:'13'},{name:'10'},{name:'8'},{name:'6'},{name:'5'},{name:'4'},{name:'3.2'},{name:'2.5'},{name:'2'},{name:'1.6'},{name:'1.3'},{name:'1'},{name:'0.8'},{name:'0.6'},{name:'0.5'},{name:'0.4'},{name:'0.3'},{name:'1/4'},{name:'1/5'},{name:'1/6'},{name:'1/8'},{name:'1/10'},{name:'1/13'},{name:'1/15'},{name:'1/20'},{name:'1/25'},{name:'1/30'},{name:'1/40'},{name:'1/50'},{name:'1/60'},{name:'1/80'},{name:'1/100'},{name:'1/125'},{name:'1/160'},{name:'1/200'},{name:'1/250'},{name:'1/320'},{name:'1/400'},{name:'1/500'},{name:'1/640'},{name:'1/800'},{name:'1/1000'},{name:'1/1250'},{name:'1/1600'},{name:'1/2000'},{name:'1/2500'},{name:'1/3200'},{name:'1/4000'}] },
  { name: 'Metering Mode', call: 'meteringmode', value: 0, options:[{name:'Evaluative'},{name:'Partial'},{name:'Center-weighted average'} ]},
  { name: 'Bracket Mode', call: 'bracketmode', value: 0 },
  { name: 'Aute Exposure Bracketing', call: 'aeb', value: 0, options:[{name:'off'},{name:'+/- 1/3'},{name:'+/- 2/3'},{name:'+/- 1'},{name:'+/- 1 1/3'},{name:'+/- 1 2/3'},{name:'+/- 2'}] }
];

app.get('/', function(req, res){
    res.render('camera-settings', {
	    settings: settings,
	    title: "Camera-Setting",
	    header: "Camera Settings!"
  });
});