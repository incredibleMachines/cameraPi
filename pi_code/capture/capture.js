/* CAPTURE.JS

  - receives 'go' from trigger server
  - toggles SHUTTER and AF gpio pins
  - sends cameraPost to server after photo is taken
*/

//**********************************//

var BROWSER_IP = "192.168.0.4"
var TRIGGER_IP = "192.168.0.3" //REAL:192.168.0.3 // JOE: "192.168.0.42
var TRIGGER_PORT    = "1234"

//**********************************//

var Gpio = require('onoff').Gpio;
var WebSocket = require('ws')
var os = require('os')
var http = require('http')
var fs = require('fs')
var exec = require('child_process').exec
var ws = new WebSocket('ws://'+TRIGGER_IP+':'+TRIGGER_PORT);


//** VAR DECLARATIONS
var serialNumber = ''
var ipAddress = '';
var websocket =''
var browserapp = ''

var PIN = [4, 17]; // [SHUTTER, AF]
var picCt =0; //picture count


//** EXPORT GPIO PINS
for(var i=0; i<PIN.length; i++){
  var strExec = 'gpio export '+PIN[i]+ ' out';
  var child = exec(strExec,function(error,stdout,stderr){
    if(error) console.log("GPIO ERROR: "+error);
  })
}

//*** SETUP PINS
var PIN_SHUTTER   = new Gpio(PIN[0], 'out');
var PIN_AF        = new Gpio(PIN[1], 'out');

//*** SETUP NETWORK CONNECTION
var networkInterfaces = os.networkInterfaces();
console.log(networkInterfaces);

if(networkInterfaces.hasOwnProperty('eth0')){
  ipAddress = networkInterfaces.eth0[0].address;
}else ipAddress = 'undefined';


//*** OPEN WEBSOCKET
ws.on('open', function() {
  http.get("http://localhost:8080/get?eosserialnumber", function(res) {
    res.on('data', function (chunk) {
      serialnumber = JSON.parse(chunk.toString())['eosserialnumber']
      console.log('Camera Serial: '+serialnumber)
      //console.log('BODY: ' + chunk);
      var obj = {'address':ipAddress, 'serial':serialnumber}
      console.log(obj)
      var objstring = JSON.stringify(obj)
      ws.send(objstring);
      newCameraPost(objstring)
    });
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
  });
});

ws.on('close',function(){
  //handle disconnect/attempt reconnect
  console.log('disconnected')
})


//*** HANDLE WEBSOCKET MESSAGES
ws.on('message', function(data, flags) {
  if(data == 'go'){
    console.log("trigger shutter, count "+ (picCt++));
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked
    hitShutter(); //*** TAKE PICTURE !!
  }
  else if(data == 'close'){
    var child = exec('echo raspberry | sudo shutdown -h now',function(error,stdout,stderr){
      console.log('stdout: '+stdout)
      console.log('stderr: '+stderr)
    })
  }
});

//**** TAKE A PICTURE !! ****
function hitShutter(){
  digitalWrite(PIN_SHUTTER, 1);
  setTimeout(function(){
     digitalWrite(PIN_SHUTTER, 0);
   },300); //button press duration
}

//**** half-press for Auto-Focus
function hitAutoFocus(){
  digitalWrite(PIN_AF, 1);
  setTimeout(function(){
     digitalWrite(PIN_AF, 0);
  },300); //button press duration
}

//** digitalWrite function
function digitalWrite(pin, state){
  pin.write(state, function(err) { // Asynchronous write.
    //pin.write(value === 0 ? 1 : 0, function(err) {
      if (err) throw err;
  });
}


function newCameraPost(objstring){
  var options = {
    host:BROWSER_IP,
    port:3000,
    path:'/camera',
    method:'POST',
    headers:{
    'Content-Type': 'application/json',
    'Content-Length': objstring.length
    }
  }
  // also send to browser computer
  var req = http.request(options,function(res){

  })
  req.write(objstring)
  req.end()
}



process.on('SIGINT', function() {
  console.log(' Got SIGINT closing gpio')
  console.log(' Goodbye ')
  process.exit(0)
})
