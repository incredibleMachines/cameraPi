var fs = require('fs')
var http=require('http')

var BROWSER_IP = 'http://192.168.0.4'

var deviceList = []
var currentDirectory


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

exports.initDownload= function(){
  return function(req,res){
  var time=new Date().getTime()
  fs.mkdir('images/'+time,function(){
    currentDirectory='images/'+time
  })
}
}

exports.saveImage = function(){
  return function (req,res) {
  console.log("hit")

  res.jsonp({post:true})
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
  fs.rename(image.path,'images/'+currentDirectory+'/'+camera_id+'.jpg', function(err){
    imageCounter++;
    if(err) console.error(err)
    console.log('Image Saved.')
  })
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
