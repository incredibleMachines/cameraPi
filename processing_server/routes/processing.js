var fs = require('fs')
var http=require('http')
var _=require('underscore')
var path=require('path')
var exec = require('child_process').exec
var gm = require('gm')
var async = require('async')

var BROWSER_IP = 'http://192.168.0.2'
//var BROWSER_IP = 'localhost'

var mode="quad"

var deviceList = []
var currentDirectory

var imagecount = 0
var imagetotal = 1

var totalCams = 23

var width = 4272/960
var height = 2848/640

var take='';
var length = 10
var numJpgs = 0;

var localPath =  "/Users/controlfreak/Desktop/cameraPi/processing_server/images"
var remotePath =  "/Volumes/controlfreak/Desktop/cameraPi/download_server/images"

getCameras(function(_deviceList){
  deviceList = _deviceList
})


var concurrency = 4

var queue = async.queue(processOutput,concurrency)

queue.drain = function(){
    console.log("Queue Complete")

    fs.readdir(localPath+'/'+take+'/movs',function(error,files){
       if(error) console.error(error)
       else{
         var count=0;
         files.forEach(function(file,i){
            console.log("RENAME: "+file);

          fs.rename(localPath+'/'+take+'/movs/'+file,localPath+'/'+take+'/renamed/'+i+'.mov',function(e){
            if(e) console.error(e)
            else{
              console.log("count: "+count+" Files Length: "+numJpgs-1);
               count++;
             }
             if(count==numJpgs-1){
               console.log("making txt file")
               var filestring =''
            var outputFinalPath=localPath+"/"+take+"/output/"+take+".mov"
            for(var i=0;i<files.length;i++){

              filestring+='file \''+localPath+'/'+take+'/renamed/'+i+'.mov\'\n'

            }
            fs.writeFile(localPath+'/'+take+'/renamed/mylist.txt', filestring, function(err) {
              if(err) {
                  console.log(err);
              } else {
                  console.log("The file was saved!");
                  var concat = "/usr/local/bin/ffmpeg -f concat -i mylist.txt -c copy "+outputFinalPath
                  exec(concat,function(error,stdout,stderr){
                    if(!error){
                      console.log("Final Video Rendered! ENJOY!")
                      console.log("bye")
                      //res.jsonp({"status":"rendered"})
                    }
                    else{
                      console.error(error)
                      //res.jsonp({"status":"error on concat"})
                    }
                    //cb()
                  })//end exec ffmpeg concat
              }
            });


          }


             })//fs.rename

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

            var command = "convert "+localPath+"/"+take+"/"+thisCam+".jpg -matte -virtual-pixel transparent \ -distort Perspective \ '"+currentCamera.warp[0]["x"]*width+","+currentCamera.warp[0]["y"]*height+" 0,0 "+currentCamera.warp[1]["x"]*width+","+currentCamera.warp[1]["y"]*height+" 640,0 "+currentCamera.warp[2]["x"]*width+","+currentCamera.warp[2]["y"]*height+" 640,640 "+currentCamera.warp[3]["x"]*width+","+currentCamera.warp[3]["y"]*height+" 0,640' \ "+localPath+"/"+take+"/warped/"+thisCam+".jpg"

            console.log("command: "+command)
            exec(command,function(error,stdout,stderr){
                if(!error){

                console.log("start crop " +thisCam)
       gm(localPath+"/"+take+"/warped/"+thisCam+".jpg").crop(640,640,0,0).write(localPath+"/"+take+"/cropped/"+thisCam+".jpg", function(e){
                if(!e){
                  console.log("writing video " +thisCam)
                  var inputPath=localPath+"/"+take+"/cropped/"+thisCam+".jpg"
                  var outputPath=localPath+"/"+take+"/movs/"+thisCam+".mov"
                  var videocmd = "/usr/local/bin/ffmpeg -f image2 -i "+inputPath+" -r "+length+" "+outputPath
                  console.log(videocmd)
                  exec(videocmd,function(error,stdout,stderr){

                    if(!error) console.log("video finished!")
                    else{
                      console.log(error)
                      //res.jsonp({"status":"error on video"})
                    }//endif(!error)
                    cb()
                  })//end exec videocmd
                }
                else{
                  console.log("gm error!")
                  console.log(e)
                  //res.jsonp({"status":"error on gm"})
                }//endif(!e)
              })//end exec gmwrite
            }else console.log(error)
          })//exec command

  }else{
    cb()
  }
}else{
  console.log("NOT A JPG");
  cb()
}

}


exports.cropImages = function(){
  return function(req,res){
    take='';
    take=req.param('take')
    console.log("process began")
    console.log(localPath+"/"+take)
    //fs.mkdir(localPath+"/"+take,function(error){
      //if(error) console.error(error)
      //console.log("mkdir completed")
      exec("cp -R "+remotePath+"/"+take+" "+localPath, function(err,stdout,stderr){
        if(err)console.error("mv command error "+err)
        if(stderr) console.error(stderr)

        deleteFolderRecursive(localPath+"/"+take+"/cropped")
        deleteFolderRecursive(localPath+"/"+take+"/warped")
        deleteFolderRecursive(localPath+"/"+take+"/movs")
        deleteFolderRecursive(localPath+"/"+take+"/output")

        fs.mkdir(localPath+"/"+take+"/cropped",function(){})
        fs.mkdir(localPath+"/"+take+"/warped",function(){})
        fs.mkdir(localPath+"/"+take+"/movs",function(){})
        fs.mkdir(localPath+"/"+take+"/renamed",function(){})
        fs.mkdir(localPath+"/"+take+"/output",function(){})

        fs.readdir(localPath+"/"+take, function(err, files){
          //console.log("Processing: "+)
          var counter = 0;
          console.log(files.length)
          queue.push(files,function(err){
              counter++
              if(err) console.error(err)
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
      })//end exec mv
    //})//
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
