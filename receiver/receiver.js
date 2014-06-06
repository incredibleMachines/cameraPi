var WebSocket = require('ws')

var ws = new WebSocket('ws://169.254.225.128:1234');
var exec = require('child_process').exec

var os = require('os')

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

ws.on('message', function(data, flags) {

  console.log(data)
    // flags.binary will be set if a binary data is received
    // flags.masked will be set if the data was masked
    if(data == 'go'){
      var child = exec('gphoto2 --capture-image-and-download',function(error,stdout,stderr){
        console.log('stdout: '+stdout)
        console.log('stderr: '+stderr)
      })
    }else if(data == 'close'){
      var child = exec('echo raspberry | sudo shutdown -h now',function(error,stdout,stderr){
        console.log('stdout: '+stdout)
        console.log('stderr: '+stderr)
      })
    }

});
