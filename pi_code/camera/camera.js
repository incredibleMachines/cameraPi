var spawn = require('child_process').spawn
var exec  = require('child_process').exec
var restler = require('restler')
var fs = require('fs')
var url = require('url')

var downloadURL = "http://169.254.225.128:3001"

//var tether = startTether()
startTether()

var http = require('http');
http.createServer(function (req, res) {
  console.log('got request')

  var url_parts = url.parse(req.url, true);
  console.log(url_parts)
  var query = url_parts.query;
  if(url_parts.pathname ==  '/favicon.ico'){
    res.writeHead(400,{'Content-Type':'application/json'})
    res.end('Not for you')
  }else{
    //tether.kill()
    res.writeHead(200, {'Content-Type': 'application/json'})


    var response;

    if(url_parts.pathname == '/set'){
        console.log('gphoto2 --set-config '+url_parts.search.substr(1))
        var child = exec('gphoto2 --set-config '+url_parts.search.substr(1),function(error, stdout, stderr){

          if(!error && !stderr){
            res.end(JSON.stringify({"success":"Property Written"}))
          }else{
            res.end(JSON.stringify({"error":stderr}))
          }
          console.log('restarting tethered')
          startTether()
        })

    }else if(url_parts.pathname == '/get'){
        console.log('gphoto2 --get-config '+url_parts.search.substr(1))
        var child = exec('gphoto2 --get-config '+url_parts.search.substr(1),function(error, stdout, stderr){

          if(!error && !stderr){

            res.end(JSON.stringify({"success":stdout}))
          }else{

            res.end(JSON.stringify({"error":stderr}))
          }
          console.log('restarting tethered')
          startTether()
        })

    }else{

      res.end(JSON.stringify({error:"unrecognized"}))
      console.log('restarting tethered')
      startTether()
    }
  }

}).listen(8080);
console.log('Server running at http://127.0.0.1:8080/');


function startTether(){
  var tethered = spawn('gphoto2', ['--capture-tethered'])

  var kill = function(){
      console.log('killing tethering')
      tethered.kill("SIGHUG")
  }

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
}



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
        console.log("Received: "+data)
        //delete file
        fs.unlink(filename, function(e){
          console.log("Deleted :"+filename)
      	})
    });
  });

}
