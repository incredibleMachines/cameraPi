/* NODE JS INCLUDES */
var http = require('http')
var dgram = require('dgram')
var express = require('express');


var MULTICAST_IP = "230.185.192.108";
var BROWSER_IP = 'http://192.168.0.4' //'http://10.0.1.28'//

var DEVICES = []

/* UDP Server Functionality */
var server = dgram.createSocket('udp4')

/* UDP SERVER ERROR */
server.on('error',function(err){
  console.log('Server Error: \n'+err.stack)
  console.log('Warning Server has been closed and must be restarted')
  server.close()
})

//** UDP MESSAGE RECEIVED **/
server.on('message', function (msg, rinfo) {
  console.log('server got: ' + msg + ' from ' + rinfo.address + ":" + rinfo.port);
});

/* START LISTENING ON THE SERVER*/
server.on("listening", function () {
  server.setBroadcast(true)
  server.setMulticastTTL(128);
  //server.addMembership('230.185.192.108');
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(41234);

/* FOR TESTING SET BROADCAST INTERVAL */
/*setInterval(broadcastNew, 3000);

function broadcastNew() {
    var message = new Buffer('go');
    server.send(message, 0, message.length, 41234, MULTITASK);
    console.log("Sent " + message + " to the wire...");
    //server.close();
}*/

/* EXPRESS SERVER FOR HUMAN INPUT AND TESTING */

var app = express();


/* EXPRESS ROUTES */

app.get('/broadcast', function(req, res){
  //wss.broadcast('go')
  /* TO DO: */
  /* SEND COMMAND OVER BROADCAST/MULTICASTING */
  var message = new Buffer('go');
  server.send(message,0,message.length,41234,MULTICAST_IP)
  res.send('sending image trigger');
})

app.get('/sendsteps',function(req,res){
  /* TO DO: */
  /* IMPLIMENT SEND STEPS FUNCTIONALITY */
  res.jsonp({devices:DEVICES})

});
app.get('/arm',function(req,res){

    armCameras(function(_deviceList){
      DEVICES = _deviceList
      res.jsonp(DEVICES)
    })

})

app.get('/closeall',function(req,res){
  //wss.broadcast('close')
  //must be switched to multicast/broadcast packet for closing all pi's
  res.send('sending rpi close')
})

//--JUST FOR TESTING LASER READ
app.get('/toggleleader',function(req,res){
  //client.socket.send('readlaser');
  wss.broadcast('toggleleader');
  res.jsonp({set:'toggle laser leadership'}); //turn laser reading on and off
})

app.listen(3000);


function armCameras(cb){
  var info = ''
  http.get(BROWSER_IP+':3000/arm',function(res){
    res.on('data', function (chunk) {
        info+=chunk
    })
    res.on('close',complete)
    res.on('end',complete)
  }).on('error',function(e){
    console.error(e)
  })

  function complete(){
    cb(JSON.parse(info))
    //res.jsonp(deviceList)
  }

}
