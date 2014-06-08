var gpio = require('pi-gpio');
var WebSocket = require('ws')
var os = require('os')

var fs = require('fs')

var ws = new WebSocket('ws://169.254.225.128:1234');
//var exec = require('child_process').exec
var spawn = require('child_process').spawn

var gpioOpen = false

var PIN1 = 7
var PIN2 = 11

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


process.on('SIGINT', function() {

  console.log(' Got SIGINT closing gpio')

  gpio.close(PIN1);
  gpio.close(PIN2);

  console.log(' Goodbye ')
  process.exit(0)

})
