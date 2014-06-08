//WEBSOCKET URL

var websocket =''
var browserapp = ''

var gpio = require('pi-gpio');
var WebSocket = require('ws')
var os = require('os')
var http = require('http')

var fs = require('fs')

var ws = new WebSocket('ws://169.254.225.128:1234');
//var exec = require('child_process').exec
var spawn = require('child_process').spawn

var gpioOpen = false

var PIN1 = 7
var PIN2 = 11

var networkInterfaces = os.networkInterfaces()
console.log(networkInterfaces)

var serialNumber = ''
var ipAddress = '';
if(networkInterfaces.hasOwnProperty('eth0')){
  ipAddress = networkInterfaces.eth0[0].address
}else{
  ipAddress = 'undefined'
}

http.get("http://localhost:8080/get?eosserialnumber", function(res) {
  res.on('data', function (chunk) {
    serialnumber = JSON.parse(chunk.toString())['eosserialnumber']
    console.log('Camera Serial: '+serialnumber)
    //console.log('BODY: ' + chunk);
  });
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});

ws.on('open', function() {
  var obj = {'address':ipAddress, 'serial':serialnumber}
  console.log(obj)
  var objstring = JSON.stringify(obj)
  ws.send(objstring);
  newCameraPost(objstring)

});

gpio.open(PIN1, "output",function(err){
  console.log('GPIO pin '+PIN1+' open')
  writeLow(PIN1)
  gpioOpen = true
});
gpio.open(PIN2, "output",function(err){
  console.log('GPIO pin '+PIN2+' open')
  writeLow(PIN2)
  gpioOpen = true
});

console.log("Running GPIO")

var state = true


ws.on('message', function(data, flags) {
  if(data == 'go'){
    console.log(data)
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked

    // var child = exec('gphoto2 --capture-image-and-download',function(error,stdout,stderr){
    //   console.log('stdout: '+stdout)
    //   console.log('stderr: '+stderr)
    // })
    if(gpioOpen == true){
      writeHigh(PIN1)
      setTimeout(function(){
         state=false
         writeLow(PIN1)
       },300)
    }
  }else if(data == 'close'){
    var child = exec('echo raspberry | sudo shutdown -h now',function(error,stdout,stderr){
      console.log('stdout: '+stdout)
      console.log('stderr: '+stderr)
    })
  }
});

ws.on('close',function(){
  //handle disconnect/attempt reconnect
  console.log('disconnected')
})

function writeHigh(pin) {
    gpio.write(pin, 1, function() {
        console.log(pin+' pin high');
    });
    // gpio.write(PIN2,0,function(){
    //     console.log(PIN2+' pin low')
    // })
}
function writeLow(pin) {
    gpio.write(pin, 0, function() {
        console.log(pin+' pin low');
    });
    // gpio.write(PIN2, 1, function() {
    //     console.log(PIN2+' pin high');
    // });
}

function newCameraPost(objstring){
  var options = {
    host:browserapp,
    port:80,
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

  gpio.close(PIN1);
  gpio.close(PIN2);

  console.log(' Goodbye ')
  process.exit(0)

})
