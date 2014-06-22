var fs = require('fs')
var http=require('http')
var _=require('underscore')
var path=require('path')
var exec = require('child_process').exec
var gm = require('gm')
var async = require('async')
var rimraf = require('rimraf')//recursive directory removal

//var net = require('net')

var Take = require('../modules/take')

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


var localPath =  "/Users/controlfreak/Desktop/cameraPi/processing_server/images"
var remotePath =  "/Users/controlfreak/Desktop/cameraPi/download_server/images"

// var localPath =  "/Users/IM_Laptop_01/Documents/cameraPi/processing_server/images"
// var remotePath =  "/Users/IM_Laptop_01/Documents/cameraPi/download_server/images"




exports.process = function(MongoDB){

  return function(req,res){

    MongoDB.getAll('cameras',function(_e,_data){
      if(_e) console.error(_e)
      else deviceList=_data
    })//MongoDB.getAll

    var take=req.param('take')
    var participant = req.param('participant')
    console.log(participant)

    console.log("begin processing on folder: "+remotePath+"/"+take)
    rimraf(localPath+"/"+take, function(e){
      if(e) console.error(e)
      else{
        fs.mkdir(localPath+"/"+take,function(_e){
          console.log("making local take folder")
          if(e) console.error(_e)
          else{

            fs.mkdir(localPath+"/"+take+"/originals",function(__e){
              console.log("making local originals folder")
              if(_e) console.error(__e)
              else{
                exec("cp -R "+remotePath+"/"+take+"/ "+localPath+'/'+take+'/originals', function(err,stdout,stderr){
                  if(err)console.error("mv command error "+err)
                  if(stderr) console.error(stderr)

                  fs.mkdir(localPath+"/"+take+"/cropped",function(){})
                  fs.mkdir(localPath+"/"+take+"/warped",function(){})
                  fs.mkdir(localPath+"/"+take+"/movs",function(){})
                  fs.mkdir(localPath+"/"+take+"/renamed",function(){})
                  fs.mkdir(localPath+"/"+take+"/output",function(){})

                  fs.readdir(localPath+"/"+take+"/originals", function(err, files){
                    //console.log("Processing: "+)
                    var counter = 0
                    console.log(files.length)
                    Take.run(take,participant,files,deviceList,function(err,take){
                      console.log("Finished Take: "+take)
                      sendFinishToBrowser(take,participant)

                    })
                      // queue.push(files,function(_err){
                      //     counter++
                      //     if(err) {
                      //       console.log("push error")
                      //       console.error(_err)
                      //     }
                      //     else console.log('finished queue item: '+ counter)
                      // })//queue.push

                      if(err){
                        console.log(err)
                      }

                      else{
                          console.log("filenumber: "+files)
                          console.log("length: "+totalCams)
                      }
                    })//end fs read directory
                  })//end exec cp
              }//endif (__e)
            })//fs.mkdir originals
          }//endif(_e)
        })//fs.mkdir take
      }//endif(e)
    })//rimraf
  }//return function
}//process()



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
          // http.get('http://'+BROWSER_IP+':3000/processed?take='+take+'&participant='+participant,function(res){
          //     res.on('data',function(chunk){
          //       console.log(chunk.toString())
          //     })
          // }).on('error',function(e){
          //   console.log('Error Processed')
          //   console.error(e)
          // })
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
