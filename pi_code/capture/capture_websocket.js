/* CAPTURE.JS

  - receives 'go' from trigger server
  - toggles SHUTTER and AF gpio pins
  - sends cameraPost to server after photo is taken
*/

//**********************************//

var BROWSER_IP = "192.168.0.4" //TRUE IP
var TRIGGER_IP = "192.168.0.3" //TRUE IP
// var BROWSER_IP = "192.168.0.42"
// var TRIGGER_IP = "192.168.0.42"
var TRIGGER_PORT    = "1234"

//**********************************//

var Gpio = require('onoff').Gpio;
var WebSocket = require('ws')
var os = require('os')
var http = require('http')
var fs = require('fs')
var exec = require('child_process').exec
var ws;


//** VAR DECLARATIONS
var serialNumber = ''
var ipAddress = '';
var websocket =''
var browserapp = ''

var hasIPAddress = false;
var socketCounter = 0;

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

getIPAddress(function(_ipAddress){
  console.log('IP ADDRESS: '+_ipAddress)
  if(!_ipAddress){ getIPAddress(arguments.callee)
  }else if(_ipAddress.toString().indexOf('192.168.0')===-1){
      getIPAddress(arguments.callee())
  }else{
    ipAddress = _ipAddress
    getSerialNumber(ipAddress,function(objectstring){
      connectSocket(objectstring)
    })
  }
})
//*** SETUP NETWORK CONNECTION
function getIPAddress(cb){
  //console.log('getIP')
  var networkInterfaces = os.networkInterfaces();
  console.log(networkInterfaces)
  if(networkInterfaces.hasOwnProperty('eth0')){
    if(networkInterfaces.eth0[0].hasOwnProperty('address')){
      cb(networkInterfaces.eth0[0].address)
    }else cb(null)
  }else cb(null)
  //ipAddress = networkInterfaces.eth0[0].address;
}

function getSerialNumber(ipAddress,cb){
  var _this = this
  console.log('Getting Serial Number')
  http.get("http://localhost:8080/get?eosserialnumber", function(res) {
    res.on('data', function (chunk) {
      serialnumber = JSON.parse(chunk.toString())['eosserialnumber']
      console.log('Camera Serial: '+serialnumber)
      //console.log('BODY: ' + chunk);
      var obj = {'address':ipAddress, 'serial':serialnumber}
      console.log(obj)
      var objstring = JSON.stringify(obj)
      newCameraPost(objstring)
      cb(objstring)
    })
  }).on('error', function(e) {
    console.log("Got error: " + e.message);
    getSerialNumber(ipAddress,cb)
    //might need to be this
    //_this(ipAddress,cb)
  });
}

//*** OPEN WEBSOCKET
function connectSocket(objectstring){
  console.log('connecting sockets')
  console.log(objectstring)
  console.log('socketCounter '+socketCounter)
  if(socketCounter < 1){
    socketCounter++
    ws = new WebSocket('ws://'+TRIGGER_IP+':'+TRIGGER_PORT);
    ws.on('open', function() {
      console.log("socket open")
      ws.send(objectstring)
    })


    ws.on('close',function(){
      /** TO DO **/
      //handle disconnect/attempt reconnect
      socketCounter--
      console.log('disconnected')
    })


    //*** HANDLE WEBSOCKET MESSAGES
    ws.on('message', function(data, flags) {
      if(data == 'go'){
        // flags.binary will be set if a binary data is received
        // flags.masked will be set if the data was masked
        hitShutter(); //*** TAKE PICTURE !!

        console.log("trigger shutter, count "+ (picCt++));
      }
      else if(data == 'close'){
        var child = exec('echo raspberry | sudo shutdown -h now',function(error,stdout,stderr){
          console.log('stdout: '+stdout)
          console.log('stderr: '+stderr)
        })
      }
    })

    ws.on('error',function(err){
      console.log('Socket Connection Error')
      console.log('Still must be handled')
    })

    ws.on('ping',function(data,flags){
      console.log('received server ping')
      ws.pong(data)
    })

    ws.on('pong',function(data,flags){
      console.log('received server pong')
    })
  }
}




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
