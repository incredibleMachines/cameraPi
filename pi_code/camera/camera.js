var spawn = require('child_process').spawn
var exec  = require('child_process').exec
var restler = require('restler')
var fs = require('fs')
var url = require('url')

var downloadURL = "http://169.254.225.128:3001"

//var tether = startTether()
//startTether()

var tether = new Tether()

var http = require('http');
http.createServer(function (req, res) {
  //console.log('got request')

  var url_parts = url.parse(req.url, true);
  //console.log(url_parts)
  var query = url_parts.query;

  keys = Object.keys(url_parts.query)
  if(url_parts.pathname ==  '/favicon.ico'){
    res.writeHead(400,{'Content-Type':'application/json'})
    res.end('Not for you')
  }else{
    //tether.kill()
    tether.kill()
    res.writeHead(200, {'Content-Type': 'application/json'})


    var response;

    if(url_parts.pathname == '/set'){
        //console.log('gphoto2 --set-config '+url_parts.search.substr(1))
        var child = exec('gphoto2 --set-config '+url_parts.search.substr(1),function(error, stdout, stderr){

          if(!error && !stderr){
            var obj = {}
            obj[keys[0]] = url_parts.query[keys[0]]
            res.end(JSON.stringify(obj))
          }else{
            res.end(JSON.stringify({"error":stderr}))
          }
          console.log('restarting tethered')
          //startTether()
          tether.start()
        })

    }else if(url_parts.pathname == '/get'){
        //console.log('gphoto2 --get-config '+url_parts.search.substr(1))
        var child = exec('gphoto2 --get-config '+url_parts.search.substr(1),function(error, stdout, stderr){

          if(!error && !stderr){
            var string = stdout.toString()

            var currentLoc = string.indexOf('Current:')+9
            var end = string.indexOf('\n',currentLoc)
            var value = string.substr(currentLoc,end-currentLoc)
            var obj = {}
            obj[keys[0]] =value
            res.end(JSON.stringify(obj))
          }else{

            res.end(JSON.stringify({"error":stderr}))
          }
          //console.log('restarting tethered')
          //startTether()
          tether.start()
        })

    }else{

      res.end(JSON.stringify({error:"unrecognized"}))
      //console.log('restarting tethered')
      //startTether()
      tether.start()
    }
  }

}).listen(8080);
console.log('Server running at 8080');


function Tether(){

  /* TO DO BETTER RECONNECT STRATEGIES */
  var _this = this

  this.start = function(){
      tethered =  spawn('gphoto2', ['--capture-tethered'])
      tethered.stdout.on('data',function(data){
          //console.log(data.toString())
      })
      tethered.stderr.on('data',function(data){
        var string = data.toString()

        if(string.indexOf('.jpg')>-1){
          if(string.indexOf('Deleting')>-1){
            console.log('Detected Photo')
            //console.log(string)
            var s = string.indexOf("'")
            var e = string.indexOf("'",s+1)
            //get the filename by finding the first and second '
            var filename = string.substr(s+1,e-s-1)
            console.log("Found file: "+filename)
            handleFile(filename)
          }
        }else if(string.indexOf('*** Error ***')>-1){
          console.error(string)
        }

      })

      tethered.on('close',function(code){
        console.log('Closed Tethered with code: '+code)
      })

      this.kill = function(){
          console.log('killing tethering')
          tethered.kill("SIGHUP")
      }

      return tethered
  }
  this.kill = function(){
    _this.tethered.kill()
  }

  this.tethered = this.start()

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