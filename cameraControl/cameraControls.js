var spawn = require('child_process').spawn
var restler = require('restler');
var fs = require('fs')

var downloadURL = "http://169.254.225.128:3000"


var tethered = spawn('gphoto2', ['--capture-tethered'])

tethered.stdout.on('data',function(data){
    //var buffer = new Buffer(data)
    console.log(data.toString())
    //console.log(data)
  // if(data.indexOf('.jpg')>-1){
  //   console.log(data)
  //   if(data.indexOf('Deleting')>-1){
  //     //download the image
  //     var s = data.indexOf("'")
  //     var e = data.indexOf("'",s+1)
  //     var filename = data.substr(s,e)
  //     console.log("Found File: "+filename)
  //   }
  // }

})

tethered.stderr.on('data',function(data){
  var string = data.toString()
  console.error(string)

  if(string.indexOf('.jpg')>-1){
    if(string.indexOf('Deleting')>-1){
      var s = string.indexOf("'")
      var e = string.indexOf("'",s+1)
      //get the filename by finding the first and second '
      var filename = string.substr(s+1,e-s-1)
      console.log("found file: "+filename)
      handleFile(filename)
    }
  }


})

tethered.on('close',function(code){
  console.log('Closed Tethered with code: '+code)
})




function handleFile(filename){
  //delete file
  //pass file back to processing server
  fs.stat(filename, function(err, stats) {
    restler.post(downloadURL, {
        multipart: true,
        data: {
            "_id": "0",
            "image": restler.file(filename, null, stats.size, null, "image/jpg")
        }
    }).on("complete", function(data) {
        console.log(data)
        //delete file
    });
  });

}
