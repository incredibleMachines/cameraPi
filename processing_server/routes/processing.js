var fs = require('fs')
var http=require('http')
var _=require('underscore')
var path=require('path')
var exec = require('child_process').exec
var gm = require('gm')
var async = require('async')
var FFmpeg = require('fluent-ffmpeg')//ffmpeg inline commands in node
var rimraf = require('rimraf')//recursive directory removal

var AfterEffects = require('../modules/AfterEffects')
//var net = require('net')

var Take = require('../modules/take')

var BROWSER_IP = '192.168.0.2'
// var BROWSER_IP = 'localhost'

var mode="quad"

var deviceList = []
var currentDirectory

var imagecount = 0
var imagetotal = 1

var totalCams = 23

var width = 4272/960
var height = 2848/640

//var take='';
var duration =.1
var framerate = 30
var numJpgs = 0;

var ae_queue = async.queue(function(data,callback){
  AfterEffects.runScriptFunction(data.script,data.call,function(err,stdout){
    console.error(err)
    console.log(stdout)
    callback()
  })
},1)

ae_queue.drain = function(){
  console.log('ae_queue empty')
}

var localPath =  __dirname+"/../images"
//var remotePath = '~/Desktop/chris'
var remotePath =  "/Volumes/controlfreak/Desktop/cameraPi/download_server/images"

// var localPath =  "/Users/IM_Laptop_01/Documents/cameraPi/processing_server/images"
// var remotePath =  "/Users/IM_Laptop_01/Documents/cameraPi/download_server/images"

getCameras(function(_deviceList){
  deviceList = _deviceList
})


exports.process = function(){
  return function(req,res){
    var take=req.param('take')
    var participant = req.param('participant')
    res.jsonp({take:take,participant:participant})
    var folder = participant+"_"+take;
    console.log("begin processing on folder: "+localPath+"/"+folder)
    rimraf(localPath+"/"+folder, function(e){
      if(e) console.error(e)
      else{
        fs.mkdir(localPath+"/"+folder,function(_e){
          console.log("making local take folder")
          if(e) console.error(_e)
          else{
            exec("cp -R "+remotePath+"/"+folder+"/ "+localPath+'/'+folder, function(err,stdout,stderr){
              if(err)console.error("mv command error "+err)
              if(stderr) console.error(stderr)
              console.log("making local originals folder")
              if(_e) console.error(__e)
              else{
                var curl = "/usr/local/bin/curl -u controlfreak:cfs -O sftp://192.168.0.6/Users/controlfreak/Desktop/of_v0.8.1_osx_release/addons/ofxBlackmagic/nikeVideoRecorder/bin/data/"
                console.log('curl exec')
                exec("cd "+localPath+'/'+folder+" && "+curl+take+'.mov',function(error,stdout,stderr){
                  if(error ) console.error(error)
                  else{
                    console.log(stdout)
                    var body = ''
                    http.get('http://'+BROWSER_IP+':3000/take/'+take,function(res){
                      res.on('data',function(chunk){
                        body+=chunk
                      })
                      res.on('end',complete)
                      res.on('complete',complete)
                    }).on('error',function(getErr){
                      console.error('get Take JSON')
                      console.error(getErr)
                      //send back data to Browser to Update DB
                    })
                    function complete(){
                      //send back data to browser to update db
                      console.log('GOT JSON')
                      console.log(body)

                      var data = JSON.parse(body)

                      var person = {firstName:data.firstName, lastName:data.lastName}
                      var call = 'run('+JSON.stringify(person)+', "'+__dirname+'/../images/'+folder+'/'+take+'.mov" , "'+__dirname+'/../images/'+folder+'/'+folder+'.mov","'+folder+'")'
                      var script = 'NikePhenomFastTrack.jsx'

                      var obj = {call:call,script:script}
                      ae_queue.push(obj)

                    }
                  }//end if error curl
                })//end curl

              }//endif (__e)
            })//end exec cp

          }//endif(_e)
        })//fs.mkdir take
      }//endif(e)
    })//rimraf
  }//return function
}//process()

function getCameras(cb){
  var info = ''
  http.get('http://'+BROWSER_IP+':3000/getinfo',function(res){
    res.on('data', function (chunk) {
        info+=chunk
    })
    res.on('close',complete)
    res.on('end',complete)
  }).on('error',function(e){
    console.log('getCameras')
    console.error(e)
  })

  function complete(){
    cb(JSON.parse(info))
    //res.jsonp(deviceList)
  }

}

function sendFinishToBrowser(take,participant){
  					/* COMPLETE */
					/*
					{
												app: 'SKILL_TRACK',
												action: 'FINISH',
												takeawayId: _take._id,
												participantCode: _take.participantCode,
												filename: takeawayId+'/'+output.mov

					}
					*/
          http.get('http://'+BROWSER_IP+':3000/processed?take='+take+'&participant='+participant,function(res){
              res.on('data',function(chunk){
                console.log(chunk.toString())
              })
          }).on('error',function(e){
            console.log('Error Processed')
            console.error(e)
          })
					// socket = net.Socket()
					// socket.connect(BOLSTER_PORT,BOLSTER_IP)
					// socket.on("connect",function(){
					// 	console.log('socket connected')
					// 	socket.write(JSON.stringify(data),'utf8',function(){
					// 		res.jsonp({send:"success"})
					// 	})
					// }).on("error",function(err){
					// 	res.jsonp(500,{error:err})
					// })

}
