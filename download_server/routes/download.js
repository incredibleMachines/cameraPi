var fs = require('fs')
var http=require('http')
var dgram=require('dgram')
var _=require('underscore')
var exec = require('child_process').exec


// var BROWSER_IP = '192.168.0.4'
var BROWSER_IP = "localhost"
// var DOWNLOAD_IP = '127.0.0.1'
var DOWNLOAD_IP = "localhost"

var deviceList = {}
var currentDirectory = 'public/calibration'
var currentCamera

var imagecount = 0
var imagetotal = 20

var timedPhoto

var method="calibration" //or "armed"

var live=0
var recording=false
var take='st_12345'

var incomingCaptureCount = {};

var Info=''
//populate data on launch pre init reinit on runs to ensure image capture
http.get('http://'+BROWSER_IP+':3000/getinfo',function(_res){
  _res.on('data',function(chunk){
    Info+=chunk
  })//res.on
  _res.on('close',Complete)
  _res.on('end',Complete)
}).on('error',function(err){
  console.error(err)
})//http.get

function Complete(){
  deviceList=Info
}


exports.startProcessing=function(){
    return function(req,res){
      http.get('http://'+DOWNLOAD_IP+':3002/?take='+take,function(res){
          console.log("inited procesing")
      })
      res.jsonp({"status":"processing"})
    }
}

exports.initDownload= function(){
  return function(req,res){
    var info = ''

    http.get('http://'+BROWSER_IP+':3000/getinfo',function(_res){
      _res.on('data',function(chunk){
        info+=chunk
      })//res.on
      _res.on('close',onComplete)
      _res.on('end',onComplete)
    }).on('error',function(err){
      console.error(err)
    })//http.get

    function onComplete(){
      deviceList=info
    //console.log(info)
    console.log("dl: "+deviceList.length)
    deviceList=JSON.parse(info)
    console.log(req.param('take'))

    if(req.query.hasOwnProperty('method')){
      //MUST UNCOMMENT THIS
      //method = "calibration"
      method = req.param('method')
    }

      if(method==="armed"){
        if(req.query.hasOwnProperty('take')){
          //MUST UNCOMMENT THIS
          take=req.param('take')//new Date().getTime()
        }

        fs.mkdir('images/'+take,function(){
          //MUST UNCOMMENT THIS
          currentDirectory='images/'+take

          incomingCaptureCount = {};

          imagecount=0
          console.log("current: "+currentDirectory)

          // console.log(req.param('participantCode'))
          // console.log(req.param('firstName'))
          // console.log(req.param('lastName'))
          res.jsonp({inited:true,method: method, take:take})
        })//fs.mkdir
    }else if(method==="calibration"){//endif (method=='armed')
      currentDirectory='public/calibration'
      res.jsonp({inited:true,method:method})
    }

    }// onComplete

  }//return function
}//function


exports.saveImage = function(){
  return function (req,res) {


      console.log(method)

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



      var camera = _.findWhere(deviceList,{address:req.connection.remoteAddress})
      console.log('Camera: '+camera['camera_id'])
      camera_id=camera['camera_id']

      console.log(currentDirectory)
      if(camera_id !== "NULL"){
        if(method == 'calibration'){
          var filename = camera_id+'_'+incomingCaptureCount[camera.camera_id]

          fs.rename(__dirname+'/../'+image.path,__dirname+'/../'+currentDirectory+'/'+camera_id+'.jpg',  function(err){
              imagecount++;
              if(err) console.error(err)
              console.log('Image Saved.')

              // exec("cp "+__dirname+'/../'+currentDirectory+'/'+camera_id+'.jpg '+__dirname+'/../public/calibration/'+camera_id+'.jpg',function(err,stdout,stderr){
              //   console.log('copied Image')
              //   if(err)console.error(err)
              //   if(stderr)console.error(stderr)
              // })//end exec

          })//fs.rename
        }else if(method=='armed'){
          //console.log(method)
          if(incomingCaptureCount.hasOwnProperty(camera.camera_id)){
            incomingCaptureCount[camera.camera_id]++
          }else{
            incomingCaptureCount[camera.camera_id] = 0
          }

          var filename = camera_id+'_'+incomingCaptureCount[camera.camera_id]
          console.log(filename)
          fs.rename(__dirname+'/../'+image.path,__dirname+'/../'+currentDirectory+'/'+filename+'.jpg',  function(err){
              imagecount++;
              if(err) console.error(err)
              console.log('Image Saved.')

              // exec("cp "+__dirname+'/../'+currentDirectory+'/'+camera_id+'.jpg '+__dirname+'/../public/calibration/'+camera_id+'.jpg',function(err,stdout,stderr){
              //   console.log('copied Image')
              //   if(err)console.error(err)
              //   if(stderr)console.error(stderr)
              // })//end exec

          })//fs.rename

      }//end if method
    }//end camera_id !=null
  }//return function
}//saveImage

exports.setMethod=function(){
  return function(req,res){
    method=req.param('method')
    console.log("method: "+method)
    if(method == 'calibration') currentDirectory='public/calibration'
    res.jsonp({"method":method})
  }
}
