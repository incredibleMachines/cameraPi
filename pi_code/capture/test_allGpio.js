
/*captureAll.JS

  Test to do ALL GPIO FUNCTIONALITY

  - both shutter and AF camera OUTPUT pins
  - all RGB LED OUTPUT pins
  - small LED OUTPUT pin
  - Laser INPUT pin


  //** WEBSOCKET CONNECTIONS DISABLED //************

*/

//*******************

var ENABLE_WS = true; //ENABLE_WEBSOCKETS ?

//* TRUE HOST_IP: "192.168.0.3"
var HOST_IP = "192.168.0.42"
var PORT    = "1234"

//*******************


var Gpio = require('onoff').Gpio;
var os = require('os')
var fs = require('fs')
var http = require('http')
var exec = require('child_process').exec

if(ENABLE_WS){
  var WebSocket = require('ws') //************
  var ws = new WebSocket('ws://'+HOST_IP+':'+PORT);//***********
}
//all should be configured to OUT except for pin 23.
var PIN = [23, 4, 17, 24, 27, 25];

for(var i=0; i<PIN.length; i++){
  var strExec; //string to execute
  if(i<1) strExec = 'gpio export '+PIN[i]+ ' in';
  else strExec = 'gpio export '+PIN[i]+ ' out';

  var child = exec(strExec,function(error,stdout,stderr){
    if(error) console.log("GPIO ERROR: "+error);
  })
}



//*** VARS
var groupLeader = true;
var triggerState = 0; //prevent false triggers
var triggerBufferTime = 1500; //how long to wait before next trigger


//*** PINS
var PIN_LASER     = new Gpio(PIN[0], 'in', 'rising');//'both');
var PIN_SHUTTER   = new Gpio(PIN[1], 'out');
var PIN_AF        = new Gpio(PIN[2], 'out');
var PIN_LED_RED   = new Gpio(PIN[3], 'out');
var PIN_LED_GRN   = new Gpio(PIN[4], 'out');
var PIN_LED_BLUE  = new Gpio(PIN[5], 'out');


var standbyLed    = PIN_LED_BLUE;
setTimeout(function(){
   configLaser(groupLeader); //config as default
 },1000); //wait a second for Gpio(pin) to config first


if(ENABLE_WS){
  var networkInterfaces = os.networkInterfaces() //*************
  console.log(networkInterfaces)

  var ipAddress = '';
  if(networkInterfaces.hasOwnProperty('eth0')){
    ipAddress = networkInterfaces.eth0[0].address
  }else{
    ipAddress = 'undefined'
  }


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


  //** WEBSOCKET MESSAGE HANDLING **
  ws.on('message', function(data, flags) {
    if(data == 'go'){
      console.log(data)
      // flags.binary will be set if a binary data is received
      // flags.masked will be set if the data was masked
      hitShutter();
    }

    else if(data == 'close'){
      var child = exec('echo raspberry | sudo shutdown -h now',function(error,stdout,stderr){
        console.log('stdout: '+stdout)
        console.log('stderr: '+stderr)
      })
    }

    else if(data == 'toggleleader'){
      configLaser(!groupLeader);
    }
  });
} //END IF (ENABLE_WS)


//**** setup or disable laser pin
function configLaser(job){
  groupLeader = job;
  digitalWrite(standbyLed, 0);

  if(groupLeader){ //enable sensor!
    //** set watch with callback on laserpin RISING
    PIN_LASER.watch(function(err, value) {
        //console.log("LASER TRIP RISING DETECTED");
        laserTriggered();
    });

    console.log(">> Running Laser.js, configured as GROUP LEADER <<");
    standbyLed = PIN_LED_GRN;
  }

  else{ //disable sensor
    PIN_LASER.unwatch(function(err){
      if (err) throw err;
    })
    console.log(">> Laser.js configured as GROUP MEMBER <<")
    standbyLed = PIN_LED_BLUE;
  }
  digitalWrite(standbyLed, 1); //standby LED on
}


//** what to do when a laser trip is detected **
function laserTriggered(){
  if(!triggerState){ //make sure we don't trigger a bunch of times in a row
    console.log("trip detected, triggering NOW");
    triggerState = true;
    digitalWrite(PIN_LED_RED, 1);
    digitalWrite(standbyLed, 0);

    //if(groupLeader) hitShutter(); //--- for now, toggle shutter pin. DEBUG only

    //SEND TRIGGER TO SERVER HERE

    setTimeout(function(){
       triggerState = false; //reset trigger
       digitalWrite(PIN_LED_RED, 0);
       digitalWrite(standbyLed, 1);
     },triggerBufferTime); //how long to wait between tiggers
   } else {
     console.log("trip detected during wait time");
   }
}


//** TAKE A PICTURE !! **
function hitShutter(){
  digitalWrite(PIN_SHUTTER, 1);
  setTimeout(function(){
     digitalWrite(PIN_SHUTTER, 0);
   },300); //shutter speed
}


//** digitalWrite function
function digitalWrite(pin, state){
  pin.write(state, function(err) { // Asynchronous write.
    //pin.write(value === 0 ? 1 : 0, function(err) {
      if (err) throw err;
  });
}


//** close on quit
process.on('SIGINT', function() {
  console.log(' Got SIGINT closing gpio');
  digitalWrite(PIN_LED_GRN, 0);
  digitalWrite(PIN_LED_RED, 0);
  digitalWrite(PIN_LED_BLUE, 0);
  // PIN_SHUTTER.unexport();
  // PIN_AF.unexport();
  // PIN_LASER.unexport();
  // PIN_LED_GRN.unexport();
  // PIN_LED_RED.unexport();
  // PIN_LED_BLUE.unexport();
  console.log(' Goodbye ');
  process.exit(0)
})
