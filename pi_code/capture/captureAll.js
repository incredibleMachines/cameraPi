
/*captureAll.JS

  Test to do ALL GPIO FUNCTIONALITY

  - both shutter and AF camera OUTPUT pins
  - all RGB LED OUTPUT pins
  - small LED OUTPUT pin
  - Laser INPUT pin
*/

// var Gpio = require('onoff').Gpio,
//     led = new Gpio(17, 'out'),
//     button = new Gpio(18, 'in', 'both');
//
// button.watch(function(err, value) {
//     led.writeSync(value);
// });

var Gpio = require('onoff').Gpio;
var WebSocket = require('ws')
var os = require('os')
var fs = require('fs')

var spawn = require('child_process').spawn
var ws = new WebSocket('ws://169.254.174.240:1234');

//*** VARS
var groupLeader = true;
var triggerState = 0; //prevent false triggers
var triggerBufferTime = 1500; //how long to wait before next trigger


//*** PINS
var PIN_SHUTTER   = new Gpio(7, 'out');
var PIN_AF        = new Gpio(11, 'out');
var PIN_LED_RED   = new Gpio(18, 'out');
var PIN_LED_GRN   = new Gpio(13, 'out');
var PIN_LED_BLUE  = new Gpio(22, 'out');
var PIN_LASER     = new Gpio(16, 'in', 'rising');//'both');
var standbyLed    = PIN_LED_BLUE;
configLaser(groupLeader); //start watching if leader


var networkInterfaces = os.networkInterfaces()
console.log(networkInterfaces)

var ipAddress = '';
if(networkInterfaces.hasOwnProperty('eth0')){
  ipAddress = networkInterfaces.eth0[0].address
}else{
  ipAddress = 'undefined'
}

//** OPEN WEBSOCKET **
ws.on('open', function() {
  var obj = {'address':ipAddress}
  console.log(obj)
  ws.send(JSON.stringify(obj));
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


function configLaser(job){
  groupLeader = job;
  digitalWrite(standbyLed, 0);

  if(groupLeader){ //watch sensor!

    //** set watch with callback on laserpin RISING
    PIN_LASER.watch(function(err, value) {
        console.log("LASER TRIP RISING DETECTED");
        laserTriggered();
    });

    console.log(">> Running Laser.js, configured as GROUP LEADER <<");
    standbyLed = PIN_LED_GRN;
  }

  else{
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
    digitalWrite(PIN_LED_GRN, 1);
    digitalWrite(standbyLed, 0);

    hitShutter(); //--- for now, toggle shutter pin. DEBUG only

    setTimeout(function(){
       triggerState = false; //reset trigger
       digitalWrite(PIN_LED_GRN, 0);
       digitalWrite(standbyLed, 1);
     },triggerBufferTime); //how long to wait between tiggers
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
      //else console.log("pin "+pin+' set to '+state);
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
