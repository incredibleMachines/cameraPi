var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port:1234})
var _ = require('underscore')

var connectedDevices = []

wss.on('connection',function(socket){
  //var address = socket.handshake.address;
  //console.log(socket)
  var connection;
  console.log("New Socket Connection: ")
  socket.on('message',function(message){
    //console.log(message)
    var data = JSON.parse(message)
    if(data.hasOwnProperty('address')){
      console.log("IP Address "+ data.address)
      connection = {address:data.address,id:data.address.replace(/\./g,'')}
      connectedDevices.push({address:connection.address, id:connection.id, socket:socket})
      connectedDevices.sort(function(a,b){ return a.id - b.id })
    }
  })
  socket.on("close",function(message){
    console.log('Socket Disconnect '+connection.address)
    for(var i in connectedDevices){
      if(connection.address==connectedDevices.address){
        connectedDevices.slice(i)
        break
      }
    }
  })
})


wss.broadcast = function(data) {
    // this.clients.forEach(function(client){
    //   setTimeout(function(){ client.send(data) },1000)
    // })
    // for(var i in this.clients){
    //
    //   setTimeout( function(client,data){
    //       send(client,data )
    //     }(this.clients[i],data),i*200)
    // }

      for(var i in this.clients)
        this.clients[i].send(data)
};


var express = require('express');
var app = express();

app.get('/broadcast', function(req, res){
  wss.broadcast('go')
  res.send('sending image trigger');
});
app.get('/sendsteps',function(req,res){
  //var counter = 0


  for(var i in connectedDevices){
    setTimeout( function(client ){
           client.socket.send( 'go' )
    }(connectedDevices[i]), i*100)
  }
  res.jsonp({devices:connectedDevices})


})
app.get('/closeall',function(req,res){
  wss.broadcast('close')
  res.send('sending rpi close')
})

app.listen(3000);
