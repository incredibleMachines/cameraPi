var fs = require('fs')
var http=require('http')
var _=require('underscore')
var path=require('path')
var exec = require('child_process').exec
var gm = require('gm')
var async = require('async')

var BROWSER_IP = 'http://192.168.0.4'

var deviceList = []
var currentDirectory

var imagecount = 0
var imagetotal = 1

var totalCams = 111

var width = 4272/960
var height = 2848/640

var take;
var length = 10

getCameras(function(_deviceList){
  deviceList = _deviceList
})


var concurrency = 4

var queue = async.queue(processOutput,concurrency)

queue.drain = function(){
    console.log("concatting")
    exec("printf \"file '%s'\n\" /Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/movs/*.mov > mylist.txt",function(error,stdout,stderr){
      if(!error){
        var outputFinalPath="/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/output/"+take+".mov"
        var concat = "ffmpeg -f concat -i mylist.txt -c copy "+outputFinalPath
        exec(concat,function(error,stdout,stderr){
          if(!error){
            console.log("Final Video Rendered! ENJOY!")
            res.jsonp({"status":"rendered"})
          }
          else{
            console.log(error)
            res.jsonp({"status":"error on concat"})
          }
          //cb()
        })//end exec ffmpeg concat
      }
      else{
        console.log(error)
        res.jsonp({"status":"error on video"})
      }

    })//end exec printf

}

function processOutput(file,cb){
    console.log('processing New Output')
    if(file.indexOf('.jpg')>-1){
      var thisCam=file.slice(0,-4)
      console.log('filename: '+thisCam)
      var currentCamera=_.findWhere(deviceList,{camera_id:thisCam})
if(typeof currentCamera!='undefined'){
  var command = "convert /Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/"+thisCam+".jpg -matte -virtual-pixel transparent \ -distort Perspective \ '"+currentCamera.warp[0]["x"]*width+","+currentCamera.warp[0]["y"]*height+" 0,0 "+currentCamera.warp[1]["x"]*width+","+currentCamera.warp[1]["y"]*height+" 640,0 "+currentCamera.warp[2]["x"]*width+","+currentCamera.warp[2]["y"]*height+" 640,640 "+currentCamera.warp[3]["x"]*width+","+currentCamera.warp[3]["y"]*height+" 0,640' \ /Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/warped/"+thisCam+".jpg"

console.log("command: "+command)
    exec(command,function(error,stdout,stderr){
      if(!error){

      console.log("start crop")
       gm("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/warped/"+thisCam+".jpg").crop(640,640,0,0).write("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/cropped/"+thisCam+".jpg", function(e){
      if(!e){
        console.log("write")
        console.log("writing video")
        var inputPath="/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/cropped/"+thisCam+".jpg"
        var outputPath="/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/movs/"+thisCam+".mov"
        var videocmd = "/usr/local/bin/ffmpeg -f image2 -i "+inputPath+" -r "+length+" "+outputPath
        exec(videocmd,function(error,stdout,stderr){
          console.log("video")
          if(!error){
            console.log("video finished!")
            //count++
            //console.log("count: "+count)

          }
          else{
            console.log(error)
            res.jsonp({"status":"error on video"})
          }
          cb()
        })//end exec videocmd
      }
      else{
        console.log("gm error!")
        console.log(e)
        res.jsonp({"status":"error on gm"})
      }
    })//end exec gmwrite
    }
      else{
        console.log(error)
      }



    })//exec command
  }
}else{
  cb()
}

}

exports.cropImages = function(){
  return function(req,res){

  take=req.param('take')
  console.log("process began")


  console.log("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take)

  deleteFolderRecursive("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/cropped")
  deleteFolderRecursive("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/warped")
  deleteFolderRecursive("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/movs")
  deleteFolderRecursive("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/output")


  fs.mkdir("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/cropped",function(){})
  fs.mkdir("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/warped",function(){})
  fs.mkdir("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/movs",function(){})
  fs.mkdir("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/output",function(){})

    fs.readdir("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take, function(err, files){

      queue.push(files,function(err){
          if(err) console.error(err)
          else console.log('finshed queue item')
      })

if(err){
  console.log(err)
}
else{
    console.log("filenumber: "+files)


    console.log("length: "+totalCams)
    //var count=0


    /*files.forEach(function (file,i) {
      if(file.indexOf('.jpg')>-1){
        var thisCam=file.slice(0,-4)
        console.log('filename: '+thisCam)
        var currentCamera=_.findWhere(deviceList,{camera_id:thisCam})
if(typeof currentCamera!='undefined'){
    var command = "convert /Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/"+thisCam+".jpg -matte -virtual-pixel transparent \ -distort Perspective \ '"+currentCamera.warp[0]["x"]*width+","+currentCamera.warp[0]["y"]*height+" 0,0 "+currentCamera.warp[1]["x"]*width+","+currentCamera.warp[1]["y"]*height+" 640,0 "+currentCamera.warp[2]["x"]*width+","+currentCamera.warp[2]["y"]*height+" 640,640 "+currentCamera.warp[3]["x"]*width+","+currentCamera.warp[3]["y"]*height+" 0,640' \ /Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/warped/"+thisCam+".jpg"

console.log("command: "+command)
      exec(command,function(error,stdout,stderr){
        if(!error){

        console.log("start crop")
         gm("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/warped/"+thisCam+".jpg").crop(640,640,0,0).write("/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/cropped/"+thisCam+".jpg", function(e){
        if(!e){
          console.log("write")
          console.log("writing video")
          var inputPath="/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/cropped/"+thisCam+".jpg"
          var outputPath="/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/movs/"+thisCam+".mov"
          var videocmd = "/usr/local/bin/ffmpeg -f image2 -i "+inputPath+" -r "+length+" "+outputPath
          exec(videocmd,function(error,stdout,stderr){
            console.log("video")
            if(!error){
              console.log("video finished!")
              count++
              console.log("count: "+count)
              if(count==totalCams){
                console.log("concatting")
                exec("printf \"file '%s'\n\" /Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/movs/*.mov > mylist.txt",function(error,stdout,stderr){
                  if(!error){
                    var outputFinalPath="/Users/controlfreak/Desktop/cameraPi/download_server/images/"+take+"/output/"+take+".mov"
                    var concat = "ffmpeg -f concat -i mylist.txt -c copy "+outputFinalPath
                    exec(concat,function(error,stdout,stderr){
                      if(!error){
                        console.log("Final Video Rendered! ENJOY!")
                        res.jsonp({"status":"rendered"})
                      }
                      else{
                        console.log(error)
                        res.jsonp({"status":"error on concat"})
                      }
                    })//end exec ffmpeg concat
                  }
                  else{
                    console.log(error)
                    res.jsonp({"status":"error on video"})
                  }

                })//end exec printf

              }
            }
            else{
              console.log(error)
              res.jsonp({"status":"error on video"})
            }
          })//end exec videocmd
        }
        else{
          console.log("gm error!")
          console.log(e)
          res.jsonp({"status":"error on gm"})
        }
      })//end exec gmwrite
      }
        else{
          console.log(error)
        }



      })//exec command
    }
    }
  })//end for each*/
    }

  })//end fs read directory
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

deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};