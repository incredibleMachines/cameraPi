var fs = require('fs')
var http=require('http')
var _=require('underscore')
var path=require('path')
var exec = require('child_process').exec
var gm = require('gm')
var async = require('async')
var FFmpeg = require('fluent-ffmpeg')//ffmpeg inline commands in node
var rimraf = require('rimraf')//recursive directory removal

// var BROWSER_IP = 'http://192.168.0.2'
var BROWSER_IP = 'localhost'

var mode="quad"

var deviceList = []
var currentDirectory

var imagecount = 0
var imagetotal = 1

var totalCams = 23

var width = 4272/960
var height = 2848/640

var take='';
var frameRate = 10
var numJpgs = 0;

// var localPath =  "/Users/controlfreak/Desktop/cameraPi/processing_server/images"
// var remotePath =  "/Volumes/controlfreak/Desktop/cameraPi/download_server/images"

var localPath =  "/Users/IM_Laptop_01/Documents/cameraPi/processing_server/images"
var remotePath =  "/Users/IM_Laptop_01/Documents/cameraPi/download_server/images"



getCameras(function(_deviceList){
  deviceList = _deviceList
})


var concurrency = 4

var queue = async.queue(processOutput,concurrency)

queue.drain = function(){
    console.log("Queue Complete")

    fs.readdir(localPath+'/'+take+'/movs',function(error,files){
       if(error) {
         console.log("readdir error")
         console.error(error)
       }
       else{
         files.forEach(function(file,i){
            console.log("RENAME: "+file)
            var count=0

          if(file.indexOf('.mov')>-1){

            fs.rename(localPath+'/'+take+'/movs/'+file,localPath+'/'+take+'/renamed/'+i+'.mov',function(e){
              if(e) {
                console.log('rename error')
                console.error(e)
              }
              else{
                console.log("renaming file")
                count++
              }
              })//fs.rename
            }//endif .mov
            else{
              count++
            }
             if(i==files.length-1){
               console.log("making txt file")
               var filestring =''
               var outputFinalPath=localPath+"/"+take+"/output/"+take+".mov"
               for(var i=0;i<files.length;i++){
                  filestring+='file \''+localPath+'/'+take+'/renamed/'+i+'.mov\'\n'
                }
            fs.writeFile(localPath+'/'+take+'/renamed/mylist.txt', filestring, function(err) {
              if(err) {
                console.log("write file error")
                  console.error(err);
              } else {
                  console.log("The file was saved!");
                  var concat = "/usr/local/bin/ffmpeg -f concat -i "+localPath+'/'+take+'/renamed/mylist.txt -c copy '+outputFinalPath
                  exec(concat,function(error,stdout,stderr){
                    if(!error){
                      console.log("Final Video Rendered! ENJOY!")
                      console.log("bye")
                      // res.jsonp({"status":"rendered"})
                    }
                    else{
                      console.log("concat error")
                      console.error(error)
                      //res.jsonp({"status":"error on concat"})
                    }
                    //cb()
                  })//end exec ffmpeg concat
              }
            });


          }




           })//files.forEach

    }//endif(error)

    })//fs.readdir


}

function processOutput(file,cb){
    console.log('processing New Output')
    if(file.indexOf('.jpg')>-1){
      console.log("GOT A JPG")
      numJpgs++;

      var thisCam=file.slice(0,-4)
      console.log('filename: '+thisCam)
      var currentCamera=_.findWhere(deviceList,{camera_id:thisCam})

      if(typeof currentCamera!='undefined'){

            var command = "convert "+localPath+"/"+take+"/originals/"+thisCam+".jpg -matte -virtual-pixel transparent \ -distort Perspective \ '"+currentCamera.warp[0]["x"]*width+","+currentCamera.warp[0]["y"]*height+" 0,0 "+currentCamera.warp[1]["x"]*width+","+currentCamera.warp[1]["y"]*height+" 640,0 "+currentCamera.warp[2]["x"]*width+","+currentCamera.warp[2]["y"]*height+" 640,640 "+currentCamera.warp[3]["x"]*width+","+currentCamera.warp[3]["y"]*height+" 0,640' \ "+localPath+"/"+take+"/warped/"+thisCam+".jpg"

            console.log("command: "+command)
            exec(command,function(error,stdout,stderr){
                if(!error){

                console.log("start crop " +thisCam)
       gm(localPath+"/"+take+"/warped/"+thisCam+".jpg").crop(640,640,0,0).write(localPath+"/"+take+"/cropped/"+thisCam+".jpg", function(e){
                if(!e){
                  console.log("writing video " +thisCam)
                  var inputPath=localPath+"/"+take+"/cropped/"+thisCam+".jpg"
                  var outputPath=localPath+"/"+take+"/movs/"+thisCam+".mov"

                  var command = new FFmpeg ({source: inputPath})
                  .loop(.1)
                  .withFps(30)
                  .toFormat('h264')
                    .on ('start',function(cmd){
                      console.log("Spawned ffmpeg with command: "+cmd)
                    })
                    .on('codecData', function(data){
                      console.log('Input is ' + data.audio + ' audio with ' + data.video + ' video')
                    })
                    .on('progress',function(progress){
                      console.log('Processing: ' + progress.percent + '% done')
                    })
                    .on('error',function(error){
                      console.log('Cannot process video: ' + err.message)
                    })
                    .on('end', function() {
                          console.log('Processing finished successfully')
                          cb()
                      })
                    .saveToFile(outputPath)
                }
                else{//if(!e)
                  console.log("gm error!")
                  console.log(e)
                  //res.jsonp({"status":"error on gm"})
                }//endif(!e)
              })//end exec gmwrite
            }else {
              console.log("exec command error")
              console.log(error)
            }
          })//exec command

      }else{
        cb()
      }
  }else{
    console.log("NOT A JPG");
    cb()
  }
}


exports.process = function(){
  return function(req,res){
    take='';
    take=req.param('take')
    console.log("begin processing on folder: "+localPath+"/"+take)
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
            var counter = 0;
            console.log(files.length)
            queue.push(files,function(err){
                counter++
                if(err) {
                  console.log("push error")
                  console.error(err)
                }
                else console.log('finished queue item: '+ counter)
            })//queue.push

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

    //})//
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
