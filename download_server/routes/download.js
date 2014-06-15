var fs = require('fs')
var http=require('http')
var dgram=require('dgram')
var _=require('underscore')
var exec = require('child_process').exec


var BROWSER_IP = '192.168.0.4'
var DOWNLOAD_IP = '127.0.0.1'

var deviceList = {}
var currentDirectory
var currentCamera

var imagecount = 0
var imagetotal = 20

var timedPhoto

var method="armed"

var live=0
var recording=false
var take='st_12345'


// /* UDP Server Functionality */
// var server = dgram.createSocket('udp4')
// server.bind(41234);
//
//
// /* UDP SERVER ERROR */
// server.on('error',function(err){
//   console.log('Server Error: \n'+err.stack)
//   console.log('Warning Server has been closed and must be restarted')
//   server.close()
// })
//
// //** UDP MESSAGE RECEIVED **/
// server.on('message', function (msg, rinfo) {
//   console.log('server got: ' + msg + ' from ' + rinfo.address + ":" + rinfo.port);
// });
//
// /* START LISTENING ON THE SERVER*/
// server.on("listening", function () {
//   server.setBroadcast(true)
//   server.setMulticastTTL(128);
//   //server.addMembership('230.185.192.108');
//   var address = server.address();
//   console.log("server listening " +
//       address.address + ":" + address.port);
// });


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
    })//http.get

    function onComplete(){
      console.log(info)
      console.log("dl: "+deviceList.length)


      console.log(req.param('action'))
      deviceList=JSON.parse(info)

        if(method=="armed"){
          take=new Date().getTime()
          fs.mkdir('images/'+take,function(){
            currentDirectory='images/'+take
            imagecount=0
            console.log("current: "+currentDirectory)

            console.log(req.param('participantCode'))
            console.log(req.param('firstName'))
            console.log(req.param('lastName'))

            http.get('http://'+BROWSER_IP+':3000/send-armed?takeawayID='+take+'&participantCode='+req.param('participantCode'),function(__res){
              console.log("sent arm data")
              res.jsonp({"sent":"success"})
            }).on('error',function(e){
              console.error(e)
            })//http.get
          })//fs.mkdir
      }else if(method=="calibration"){//endif (method=="calibration")
        currentDirectory='public/calibration';
      }
    }// onComplete

  }//return function
}//function

exports.saveImage = function(){
  return function (req,res) {


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



      var camera = _.findWhere(deviceList,{address:req.connection.remoteAddress})
      console.log('Camera: '+camera['camera_id'])
      camera_id=camera['camera_id']


      console.log(currentDirectory)
      fs.rename(__dirname+'/../'+image.path,__dirname+'/../'+currentDirectory+'/'+camera_id+'.jpg',  function(err){
          imagecount++;
          if(err) console.error(err)
          console.log('Image Saved.')

          exec("cp "+__dirname+'/../'+currentDirectory+'/'+camera_id+'.jpg '+__dirname+'/../public/calibration/'+camera_id+'.jpg',function(err,stdout,stderr){
            console.log('copied Image')
            if(err)console.error(err)
            if(stderr)console.error(stderr)
          })//end exec

        })//fs.rename
  }//return function
}//saveImage

exports.setMethod=function(){
  return function(req,res){
    method=req.param('method')
    console.log("method: "+method)
    res.jsonp({"method":method})
  }
}

// exports.captureCalibrationImage = function(){
//   return function(req,res){
//     var message = new Buffer('go')
//     var address
//     console.log(live)
//
//     if(live==0&&recording==true){
//       clearInterval(timedPhoto)
//       recording=false
//     }
//     else if(live==0){
//       triggerCamera(message,address)
//     }
//     else if (recording==false){
//       timedPhoto=setInterval(function() { triggerCamera(message,address) },500)
//       recording=true
//     }
//     res.send('sending image trigger');
//   }
// }
//
// exports.serveCalibrationImage = function(){
//   return function (req,res){
//     currentCamera=req.param('camera')
//     console.log(req.param('live'))
//     console.log(currentCamera)
//     live=req.param('live')
//     method="calibration"
//
//     var imageURL='/calibration/'+currentCamera+'.jpg'
//     res.redirect('/capture-calibration?camera='+currentCamera)
//   }
// }


// function triggerCamera(message,address){
//   console.log("photo")
//   server.send(message,0,message.length,41234,address)
// }
