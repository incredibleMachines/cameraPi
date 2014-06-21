var fs = require('fs')
var http=require('http')
var _=require('underscore')
var path=require('path')
var exec = require('child_process').exec
var gm = require('gm')
var async = require('async')
var FFmpeg = require('fluent-ffmpeg')//ffmpeg inline commands in node
var rimraf = require('rimraf')//recursive directory removal

var width = 4272/960
var height = 2848/640

var take='';
var framerate = 30
var numJpgs = 0;

var localPath =  "/Users/controlfreak/Desktop/cameraPi/processing_server/images"
var remotePath =  "/Volumes/controlfreak/Desktop/cameraPi/download_server/images"


exports.run = function(take,participant,files,deviceList,callback){
  console.log('starting process of new take')
  console.log(take)
  var concurrency = 50
  var counter = 0

  var queue = async.queue(processOutput,concurrency)

  queue.push(files,function(_err){
    counter++
    if(_err) {
      console.log("push error")
      console.error(_err)
    }
    else console.log('finished queue item: '+ counter)
  })//queue.push

  queue.drain = function(){
    console.log("Queue Complete")
    fs.readdir(localPath+'/'+take+'/cropped',function(error,files){
      if(error) {
        console.log("readdir error")
        console.error(error)
      }
      else{
        files.forEach(function(file,i){
          console.log("RENAME: "+file)
          var count=0
            if(file.indexOf('.jpg')>-1){
              fs.rename(localPath+'/'+take+'/cropped/'+file,localPath+'/'+take+'/renamed/'+i+'.jpg',function(e){
                if(e) {
                  console.log('rename error')
                  console.error(e)
                }
                else{
                  console.log("renaming file")
                  count++
                }
              })//fs.rename
            }//endif .jpg
            else{
              count++
            }

          if(i==files.length-1){
            console.log("making txt file")
            var filestring =''
            var outputFinalPath=localPath+"/"+take+"/output/"+take+".mov"
            // var outputFinalPath="/output/"+take+".mov"
            for(var i=0;i<files.length;i++){
              filestring+='file \''+localPath+'/'+take+'/renamed/'+i+'.jpg\'\n'
            }
            fs.writeFile(localPath+'/'+take+'/renamed/mylist.txt', filestring, function(err) {
              if(err) {
                console.log("write file error")
                console.error(err);
              }else {
                console.log("The file was saved!");
                var concat = "/usr/local/bin/ffmpeg -f concat -i "+localPath+'/'+take+'/renamed/mylist.txt -r 30 -c copy '+outputFinalPath
                exec(concat,function(error,stdout,stderr){
                  if(!error){
                    console.log("Final Video Rendered!")
                    //console.log("bye")
                    console.log("Moving File to folder.")
                    var copyFile = "cp "+outputFinalPath+" /output/"+participant+'_'+take+'.mov'
                    console.log(copyFile)
                    exec(copyFile,function(_err,stdout,stderr){
                      console.log("Finished Moving File.")
                      callback(null,take,participant)
                    })
                  }
                  else{
                    console.log("concat error")
                    console.error(error)
                  }
                })//end exec ffmpeg concat
              }//if(err)
            })//fse.writeFile
          }//if(lastfile)
        })//files.forEach
      }//endif(error)
    })//fs.readdir
  }

  function processOutput(file,cb){
      console.log('processing New Output')
      if(file.indexOf('.jpg')>-1){
        console.log("GOT A JPG")
        numJpgs++;
        var s = file.indexOf('_')
        var cam_id = file.substr(0,s)
        console.log(cam_id)
        var currentCamera=_.findWhere(deviceList,{camera_id:cam_id})
        var filename= file.substr(0,file.indexOf('.'))
        if(typeof currentCamera!='undefined'){
          console.log("start crop " +file)
          console.log(currentCamera.w +' / '+ currentCamera.w*width)
          console.log(currentCamera.h +' / '+ currentCamera.h*height)
gm(localPath+"/"+take+"/originals/"+filename+".jpg").rotate('#fff',currentCamera.rotate).crop(currentCamera.w*width,currentCamera.h*height,currentCamera.x*width,currentCamera.y*height).resize(640,null).write(localPath+"/"+take+"/cropped/"+filename+".jpg", function(e){
          if(!e){
            console.log("writing video " +file)
            cb()
          }else{//if(!e)
            console.log("gm error!")
            console.log(e)
            cb()
            //res.jsonp({"status":"error on gm"})
          }//endif(!e)
        })//end exec gmwrite
      }else{
        console.log("file is undefined");
        cb()
      }
    }
    else{
      console.log("NOT A JPG")
      cb()
    }
  }
}
