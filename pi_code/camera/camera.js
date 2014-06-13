/*
CAMERA.JS

*/

//**********************************//

var DOWNLOAD_IP  = "192.168.0.2"
var BROWSER_IP   = "192.168.0.4"
var VERSION      = "RC4"

//**********************************//

var Gpio = require('onoff').Gpio;
var spawn = require('child_process').spawn;
var exec  = require('child_process').exec;
var restler = require('restler');
var fs = require('fs');
var url = require('url');
var http = require('http');

//** VARS **//
var downloadURL = "http://"+ DOWNLOAD_IP +":3001";
var settingsFile = __dirname + '/settings.json';
// [SHUTTER, AF, RED, GREEN, BLUE, 3MM, LASER]
var PIN = [4, 17, 24, 27, 25, 22, 23];


//*** set permissions to local scripts ***//
// var chmodx = exec('echo pi | sudo chmod -x ~/piFirmware/camera/gpioExport.sh && echo pi | sudo chmod -x ~/piFirmware/camera/gitpull.sh',
// function(error,stdout,stderr){
//   console.log('set chmod to all scripts');
// })


//*** EXECUTE EXPORT GPIO PIN SCRIPT ***//
child = exec('bash ~/piFirmware/camera/gpioExport.sh',
  function(error,stdout,stderr){
    if(!error && !stderr){
      console.log("GPIO pins EXPORTED GLOBALLY");
    }else{
      console.log("error: "+error)
      console.log("stdout: "+stdout)
      console.log("stderr: "+stderr)
    }
  }
);


//*** remove any jpg at the root level of the pi ***//
var rm = exec('rm -rf ~/*.jpg',function(error,stdout,stderr){
  console.log('deleted all jpeg files in home directory')
})

console.log("WELCOME TO "+VERSION);

//Init routine
init()


//*** SETUP PINS ***//
var PIN_SHUTTER   = new Gpio(PIN[0], 'out');
var PIN_AF        = new Gpio(PIN[1], 'out');
var PIN_LED_RED   = new Gpio(PIN[2], 'out');
var PIN_LED_GRN   = new Gpio(PIN[3], 'out');
var PIN_LED_BLUE  = new Gpio(PIN[4], 'out');
var PIN_LED_3MM   = new Gpio(PIN[5], 'out');
console.log("GPIO pins inited");


//*** TETHER TO CAMERA ***//
var tether = new Tether();

//*** CREATE SERVER on port 8080 ***//
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
    // tether.kill()
    res.writeHead(200, {'Content-Type': 'application/json'})

    if(url_parts.pathname == '/set'){
        //console.log('gphoto2 --set-config '+url_parts.search.substr(1))
        tether.kill();
        setCameraConfigValue(keys[0],url_parts.query[keys[0]],function(err,val){
          var response =''

          if(!err) response = val
          else response = JSON.stringify({"error":err})

          res.end(response)
          tether.start()
        })

    }else if(url_parts.pathname == '/get'){

        tether.kill();
        getCameraConfigValue(url_parts.search.substr(1),function(err,val){
          var response =''

          if(!err) response = val
          else response = JSON.stringify({"error":err})

          res.end(response)
          tether.start()
        })

    }else if(url_parts.pathname == '/version'){

      res.end(JSON.stringify({"version":VERSION}));

    }else if(url_parts.pathname == '/init'){
      init()
      res.end(JSON.stringify({"init":"running"}))

    }else if(url_parts.pathname =='/gitpull'){
      console.log('attemping git pull')
      child = exec('expect ~/piFirmware/camera/gitpull.sh',
        function(error,stdout,stderr){
            if(!error && !stderr){
              //console.log('git pull success')
              res.end(JSON.stringify({"Success":"Git Pull"}))
              reboot()
              console.log(stdout)
            }else{
              console.log(error)
              console.log(stderr)
              res.end(JSON.stringify({"Error":"Git Pull", "details":{error:error,stderr:stderr}}))
            }
        })
    }else if(url_parts.pathname=='/shutdown'){
      var child = exec('echo pi | sudo shutdown -h now',function(error,stdout,stderr){
        console.log('stdout: '+stdout)
        console.log('stderr: '+stderr)
      })
    }else{
      res.end(JSON.stringify({error:"unrecognized"}))
    }
  }
}).listen(8080);
console.log('Server running at 8080');


//**** SET SETTINGS VALUE INTO CANNON ****//
function setCameraConfigValue(key,val,cb){
  console.log('gphoto2 --set-config '+key+"="+val)
  var child = exec('gphoto2 --set-config '+key+"="+val,function(error, stdout, stderr){

      if(!error && !stderr){
        var obj = {}
        obj[key] = val
        digitalWrite(PIN_LED_3MM, 0); //turn on RED led
        //res.end(JSON.stringify(obj))
        cb(null,JSON.stringify(obj))
      }else{
        digitalWrite(PIN_LED_3MM, 1); //turn on RED led
        cb(stderr)
        //res.end(JSON.stringify({"error":stderr}))
      }
      console.log('restarting tethered')
      //tether.start()
    })
}


//**** GET SETTINGS VALUE FROM CANNON ****//
function getCameraConfigValue(key,cb){

  console.log('gphoto2 --get-config '+key)
  var child = exec('gphoto2 --get-config '+key,function(error, stdout, stderr){

    if(!error && !stderr){
      var string = stdout.toString()
      var currentLoc = string.indexOf('Current:')+9
      var end = string.indexOf('\n',currentLoc)
      var value = string.substr(currentLoc,end-currentLoc)
      var obj = {}
      obj[key] =value
      digitalWrite(PIN_LED_3MM, 0); //turn off RED led
      cb(null,JSON.stringify(obj))
    }else{
      digitalWrite(PIN_LED_3MM, 1); //turn on RED led
      cb(stderr)
    }
    //console.log('restarting tethered')
  })
}



//*** TETHER TO CANON ****
function Tether(){

  /* TO DO BETTER RECONNECT STRATEGIES */
  var _this = this

  this.start = function(){
      tethered =  spawn('gphoto2', ['--capture-tethered'])
      tethered.stdout.on('data',function(data){
          //console.log(data.toString())
          digitalWrite(PIN_LED_3MM,0); //turn red LED off to give the benefit of the doubt
      })
      tethered.stderr.on('data',function(data){
        var string = data.toString()

        if(string.indexOf('.jpg')>-1){
          digitalWrite(PIN_LED_3MM, 0);
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
        }else if(string.indexOf('*** Error')>-1){
          digitalWrite(PIN_LED_3MM, 1);
          console.error(string)
        }
      })
      tethered.on('close',function(code){
        digitalWrite(PIN_LED_3MM, 1);
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

//**** hit shutter, take picture ****
function hitShutter(){
  digitalWrite(PIN_SHUTTER, 1);
  digitalWrite(PIN_BLUE, 1);
  setTimeout(function(){
     digitalWrite(PIN_SHUTTER, 0);
     digialWrite(PIN_BLUE, 0);
  },300); //button press duration
}

//**** half-press for Auto-Focus ****
function hitAutoFocus(){
  digitalWrite(PIN_AF, 1);
  setTimeout(function(){
     digitalWrite(PIN_AF, 0);
  },300); //button press duration
}

//**** digitalWrite function ****
function digitalWrite(pin, state){
  pin.write(state, function(err) { // Asynchronous write.
    //pin.write(value === 0 ? 1 : 0, function(err) {
      if (err) throw err;
  });
}


//**** HANDLE FILE ****
function handleFile(filename){
  //delete file
  //pass file back to processing server
  fs.stat(filename, function(err, stats) {
    restler.post(downloadURL, {
        multipart: true,
        data: {
            "id": "0",
            "image": restler.file(filename, null, stats.size, null, "image/jpg")
        }
    }).on("complete", function(data) {
        console.log("Received: "+JSON.stringify(data))
        //delete file
        fs.unlink(filename, function(e){
          console.log("Deleted :"+filename)
      	})
    })
  });

}
function reboot(){
  console.log('sending system reboot now. Good-bye')
  var reboot = exec("echo pi | sudo reboot",function(error, stdout, stderr){
    console.log('going down for a reboot')
  })
}
//*** SAVE SETTINGS on boot or later when received from server ***//
function saveSettings(newSettings){
  fs.writeFile(settingsFile, JSON.stringify(newSettings), function(err){
    if(err) console.log("err in saveSettings: "+err);
    else console.log("saved settings file!");
  });
}

/*** INIT THE CAMERA ***/
function init(){
  console.log("Camera Init")
  fs.exists(settingsFile, function(exists){
    if(exists){ //we have a serial file
      console.log("found settings file");
      fs.readFile(settingsFile,'utf8',function(err,data){
        if(err) console.log(err)
        else{
          var settingsData = JSON.parse(data)
          console.log(JSON.stringify(settingsData))
          saveAndReport(settingsData)
        }
      })
    }else{//no serial file
        console.log("SETTINGS.js NOT FOUND. creating settings file:");
        var mySettings = {
          "piFirmware_version":VERSION,
          "serial": "NaN"
        }
        saveAndReport(mySettings)
        //saveSettings(mySettings);

    }
  })
}

function saveAndReport(settingsData){
   console.log(settingsData)
   //check for serial number from camera
    tether.kill();
    getCameraConfigValue('eosserialnumber',function(err,val){
      if(!err){
        var data = JSON.parse(val)
        settingsData.serial = data.eosserialnumber;
        console.log(settingsData)
        saveSettings(settingsData)
        //make request to browser
        restler.postJson('http://'+BROWSER_IP+':3000/camera', settingsData).on('complete',function(data, response){
          // handle response
          console.log(data)
        });
      }else{
        console.log(err)

        if(settingsData.serial == "NaN" ) saveSettings(settingsData)

        restler.postJson('http://'+BROWSER_IP+':3000/camera', settingsData).on('complete',function(data, response){
          // handle response
          console.log(data)
        });
      }
      tether.start()
    })
}
