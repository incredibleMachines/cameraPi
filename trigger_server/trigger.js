var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port:1234})
var _ = require('underscore')
var BROWSER_IP = 'http://192.168.0.4' //'http://10.0.1.28'//
var http = require('http')

var deviceList = []

var TriggerActive =false;



console.log("Arming Cameras For Trigger.")
armCameras(function(_deviceList){
    deviceList = _deviceList
})

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
  socket.on("pong",function(message){
    var time = new Date().now
    console.log("Recieved Pong:")
    console.log(message)
    console.log("RoundTrip: "+ (time -message) )
    socket.ping( new Date().now )
  })
  socket.on("close",function(message){
    console.log('Socket Disconnect '+connection.address)
    for(var i in connectedDevices){
      if(connection.address==connectedDevices.address){
        connectedDevices.splice(i,1)
        break
      }
    }
  })
  socket.on("error",function(error){
    console.log("Received Socket Error: "+error)
  })
})

wss.pingAll = function(bActive){
  //if(bActive == true)
    for(var i in this.clients)
      this.clients[i].ping( new Date().now )
}

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
})

app.get('/sendsteps',function(req,res){
  //var counter = 0


  for(var i in connectedDevices){
    setTimeout( function(client ){
      client.socket.send( 'go' )
    }(connectedDevices[i]), i*100)
  }
  res.jsonp({devices:connectedDevices})


})
app.get('/ping',function(req,res){
    wss.pingAll(true)
    res.jsonp({yo:'fool'})
})

app.get('/arm',function(req,res){

    armCameras(function(_deviceList){
      deviceList = _deviceList
      res.jsonp(_deviceList)
    })

})

app.get('/closeall',function(req,res){
  wss.broadcast('close')
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
