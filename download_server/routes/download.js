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
var currentDirectory
var currentCamera

var imagecount = 0
var imagetotal = 20

var timedPhoto

var method="calibration"

var live=0
var recording=false
var take='st_12345'

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
    res.jsonp({"inited":"true"})
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

        if(method==="armed"){
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
              // res.jsonp({"sent":"success"})
            }).on('error',function(e){
              console.error(e)
            })//http.get
          })//fs.mkdir
      }else if(method==="calibration"){//endif (method=='armed')
        currentDirectory='public/calibration'
        http.get('http://'+BROWSER_IP+':3000/send-armed',function(__res){
          console.log("sent calibration arm data")
          // res.jsonp({"sent":"success"})
        }).on('error',function(e){
          console.error(e)
        })//http.get
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

          // exec("cp "+__dirname+'/../'+currentDirectory+'/'+camera_id+'.jpg '+__dirname+'/../public/calibration/'+camera_id+'.jpg',function(err,stdout,stderr){
          //   console.log('copied Image')
          //   if(err)console.error(err)
          //   if(stderr)console.error(stderr)
          // })//end exec

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
