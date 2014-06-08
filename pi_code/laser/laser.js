
/*LASER.JS

  socket commands -

  -

*/
var gpio = require('pi-gpio');
var WebSocket = require('ws')
var os = require('os')
var fs = require('fs')
var spawn = require('child_process').spawn

var ws = new WebSocket('ws://169.254.174.240:1234');

//vars
var groupLeader = true; //** if true, will read laser pin continuously **
var pinsInited = false
var gpioOpen = false
var laserState = 0; // 0 = low/off . 1 = high/tripped
var triggerState = 0; //prevent false triggers
var triggerBufferTime = 1500; //how long to wait before next trigger
var readLaserRef = readLaser; //self-referencing function

//PINS
var PIN_SHUTTER = 7;
var PIN_AF = 11;
var PIN_LED_RED = 18;
var PIN_LED_GRN = 22;
var PIN_LED_BLUE = 13;
var PIN_LASER = 16;

var networkInterfaces = os.networkInterfaces()
console.log(networkInterfaces)

var ipAddress = '';
if(networkInterfaces.hasOwnProperty('eth0')){
  ipAddress = networkInterfaces.eth0[0].address
}else{
  ipAddress = 'undefined'
}

ws.on('open', function() {
  var obj = {'address':ipAddress}
  console.log(obj)
  ws.send(JSON.stringify(obj));
});

//** configure OUTPUT pins **
openGpioOutputPin(PIN_SHUTTER); //take out
openGpioOutputPin(PIN_AF);      //take out
openGpioOutputPin(PIN_LED_RED);
openGpioOutputPin(PIN_LED_GRN);
openGpioOutputPin(PIN_LED_BLUE);
function openGpioOutputPin(pin){
  gpio.open(pin, "output",function(err){
    console.log('GPIO pin '+pin+' open')
    digitalWrite(pin, 0); //write LOW
    gpioOpen = true
  });
}

//** configure input pin **
gpio.open(PIN_LASER, "input", function(err){
  console.log('GPIO pin '+PIN_LASER+' open')
  gpioOpen = true;
  pinsInited = true;
  configLaser(groupLeader);
});


ws.on('message', function(data, flags) {
  if(data == 'go'){
    console.log(data)
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked
    if(gpioOpen == true){
      hitTrigger();
    }
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
  if(groupLeader){
    console.log(">> Running Laser.js, configured as GROUP LEADER <<");
    readLaser();
  }
  else console.log(">> Laser.js configured as GROUP MEMBER <<")
  // if(groupLeader && pinsInited){
  //     console.log("group leader AND pinsInited");
  //    readLaser();
  //  }
}


//** function to read laser
function readLaser(){
    if(groupLeader){
      gpio.read(PIN_LASER, function(err, value) {
        if(err) throw err;
        //console.log("reading laser. current value: " + value);
        if(value && !laserState){ //so that we only hit trigger if it's a CHANGE in read value
          hitTrigger();
        }
      });
      setTimeout(function(){
         readLaserRef();
       },10); //how fast we want to be reading this laser
   }
}

//** what to do when a laser trip is detected **
function hitTrigger(){
  if(!triggerState){ //make sure we don't trigger a bunch of times in a row
    console.log("trip detected, triggering NOW");
    triggerState = true;
    digitalWrite(PIN_LED_BLUE, 1);

    hitShutter(); //--- for now, toggle shutter pin. DEBUG only

    setTimeout(function(){
       triggerState = false; //reset trigger
       digitalWrite(PIN_LED_BLUE, 0);
     },triggerBufferTime); //how long to wait between tiggers
   }
}

//** purely debug purposes
//** TODO: remove me
function hitShutter(){
  digitalWrite(PIN_SHUTTER, 1);
  setTimeout(function(){
     digitalWrite(PIN_SHUTTER, 0);
   },300); //shutter speed
}


//** digitalWrite function
function digitalWrite(pin, state){
  gpio.write(pin, state, function() {
      console.log("pin "+pin+' set to '+state);
  });
}


//** close on quit
process.on('SIGINT', function() {
  console.log(' Got SIGINT closing gpio');
  gpio.close(PIN_SHUTTER);
  gpio.close(PIN_AF);
  gpio.close(PIN_LASER);
  console.log(' Goodbye ');
  process.exit(0)
})
