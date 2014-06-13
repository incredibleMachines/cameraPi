var fs = require('fs')
var http=require('http')
var dgram=require('dgram')


var BROWSER_IP = 'http://192.168.0.4'
var DOWNLOAD_IP = '127.0.0.1'

var deviceList = []
var currentDirectory
var currentCamera

var imagecount = 0
var imagetotal = 20

var timedPhoto

var method="armed"

var live=0
var recording=false


/* UDP Server Functionality */
var server = dgram.createSocket('udp4')
server.bind(41234);


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


getCameras(function(_deviceList){
    deviceList = _deviceList
})

exports.getCameraInfo = function (){
return function(req,res){
    getCameras(function(_deviceList){
      deviceList = _deviceList
      res.jsonp(_deviceList)
    })
}
}

exports.startProcessing=function(){
    return function(req,res){
      http.get('http://'+DOWNLOAD_IP+':3002/?take=1402557537181',function(res){
          console.log("inited procesing")
      })
      res.jsonp({"status":"processing"})
    }
}

exports.initDownload= function(){
  return function(req,res){
    getCameras(function(){
      console.log("armed")
        method="armed"
        var time=new Date().getTime()
        fs.mkdir('images/'+time,function(){
          currentDirectory='images/'+time
          imagecount=0
          console.log("current: "+currentDirectory)
          res.jsonp({"status":"download set"})

          })

    })

}
}

exports.saveImage = function(){
  return function (req,res) {


  if(method=="armed"){
    console.log("hit")

  res.jsonp({post:"armed"})
  //console.log(req)
  var post = req.body;
  //console.log(post)
  var files = req.files;
  //console.log(files)
  var image = files.image
  // console.log(image)
  var file = image.originalFilename.substr(0,image.originalFilename.indexOf('.'))
  //need to create unique image paths here
console.log(req.connection.remoteAddress)

  var camera_id
  deviceList.forEach(function(camera,i){
      if(camera['address']==req.connection.remoteAddress){
        console.log('Camera: '+camera['camera_id'])
        camera_id=camera['camera_id']
        console.log(currentDirectory)
        fs.rename(__dirname+'/../'+image.path,__dirname+'/../'+currentDirectory+'/'+camera_id+'.jpg', function(err){
          imagecount++;
          if(err) console.error(err)
          console.log('Image Saved.')
        })
      }
  })


}

else{
  res.jsonp({post:"calibration"})
  //console.log(req)
  var post = req.body;
  //console.log(post)
  var files = req.files;
  //console.log(files)
  var image = files.image
  //console.log(image)
  var file = image.originalFilename.substr(0,image.originalFilename.indexOf('.'))
  //need to create unique image paths here

  var camera_id
  deviceList.forEach(function(camera,i){
      if(camera['address']==req.connection.remoteAddress){
        console.log('Camera'+camera['camera_id'])
        camera_id=camera['camera_id']
      }
  })
  fs.rename(image.path,'/public/'+camera_id+'/+camera_id.jpg', function(err){
    imagecount++;
    if(err) console.error(err)
    console.log('Image Saved.')
  })
}

}
}

exports.setMethod=function(){
  return function(req,res){
    method=req.param('method')
  }
}

exports.captureCalibrationImage = function(){
  return function(req,res){
  var message = new Buffer('go')
  var address
  console.log(live)
  deviceList.forEach(function(camera,i){
      if(camera['camera_id']==currentCamera){
        address=camera['address']
      }
  })


if(live==0&&recording==true){
  clearInterval(timedPhoto)
  recording=false
}
else if(live==0){
  triggerCamera(message,address)
}
else if (recording==false){
  timedPhoto=setInterval(function() { triggerCamera(message,address) },500)
  recording=true
}
  res.send('sending image trigger');
}
}

exports.serveCalibrationImage = function(){
  return function (req,res){
    currentCamera=req.param('camera')
    console.log(req.param('live'))
    console.log(currentCamera)
    live=req.param('live')
    method="calibration"

    var imageURL='/calibration/'+currentCamera+'.jpg'
    res.redirect('/capture-calibration?camera='+currentCamera)
  }
}

function getCameras(cb){
  var info = ''
  http.get(BROWSER_IP+':3000/getinfo',function(res){
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

function triggerCamera(message,address){
  console.log("photo")
  server.send(message,0,message.length,41234,address)
}
