
var http = require('http')

var net = require('net')

// var DOWNLOAD_IP='192.168.0.2'
var DOWNLOAD_IP='localhost'

var BOLSTER_IP="192.168.2.8"

var BOLSTER_PORT = '10001'

exports.renderPage = function (){
	return function(req,res){
		res.render('controller', {
			status: "Ready",
		    title: "Nike Controller",
		    header: "Controller Page"
		})//render
	}//function
}//renderPage

/* DEPRECATED */
exports.triggerCameras = function(){
	return function(req,res){
		console.log("triggered");
	}
}

exports.pingCameras = function(){
	return function(req,res){
		console.log("pinged");
		res.redirect('/cameras/settings')
	}
}

exports.gitPull = function(MongoDB){
	return function(req,res){
		MongoDB.getAll('cameras',function(_e, _data){
			if(!_e){
				var count=0
				var responseCount=0
				var errorCount=0
			_data.forEach(function(addr){
				//console.log(_data)
				count++
				http.get('http://'+addr.address+':8080/gitpull', function(server){
					server.on('data',function(chunk){
						console.log("Got response: " + res.statusCode)
						console.log('http://'+addr.address+':8080/gitpull')
						console.log('received: '+chunk)
						console.log('')
					})
					server.on('close',function(){
						responseCount++
					})
					server.on('end',function(){
						responseCount++
					})
				}).on('error', function(__e) {
					errorCount++
  					console.log("Got error: " + __e.message)
						console.log('http://'+addr.address+':8080/gitpull')
						console.log('')
				})//end http.get


				if(errorCount+responseCount==_data.length){
					res.jsonp({"gitpull":"completed"})
					console.log('attempted connection to '+_data.length+' addresses')
					console.log('received '+responseCount+' responses')
				}//endif (count==_data.length)
			})//end foreach
		}//end if(!_e)
		else console.error(_e)
		})//end MongoDB.getAll
	}//return function
}//end gitPull


exports.shutdown = function(MongoDB){
	return function(req,res){
		MongoDB.getAll('cameras',function(_e, _data){
			if(!_e){
				var count=0
			_data.forEach(function(addr, i){
				//console.log(_data)
				console.log('http://'+addr.address+':8080/shutdown')
				http.get('http://'+addr.address+':8080/shutdown', function(server){
					console.log("Got response: " + res.statusCode)
					count++
				}).on('error', function(e) {
						console.log("Got error: " + e.message)
				});
				if(count==_data.length){
					res.redirect('/camera/list')
				}
			})//_data.foreach
		}else console.error(_e)//if(!e)
		})//MongoDB.getAll
	}//return function
}//shutdown

exports.scan = function(){
	return function(req,res){
		var post = req.body
		console.log('action: '+post.action)
		console.log('participantCode: '+post.participantCode)
		console.log('firstName: '+post.firstName)
		console.log('lastName: '+post.lastName)

		var options={
			hostname:DOWNLOAD_IP,
			port:3001,
			path:'/init?participantCode='+post.participantCode+'&firstName='+post.firstName+'&lastName='+post.lastName,
			method:'GET'
		}

		http.get(options, function(server){
			console.log("Got response: " + server.statusCode)
			res.jsonp({"armed":"sent"})
		}).on('error', function(e) {
				console.log("Got error: " + e.message)
				res.jsonp({"error":e.message})
		});
	}
}

exports.sendArmed = function(MongoDB){
	return function(req,res){
		console.log("socketTakeaway:"+req.param('takeawayID'))
		console.log("socketParticipant:"+req.param('participantCode'))
			var socket = net.Socket()
			socket.connect(BOLSTER_PORT, BOLSTER_IP)
			socket.on("connect",function(){
				socket.write(JSON.stringify({'app': 'SKILL_TRACK', 'action': 'ARM', 'takeawayId':req.param('takeawayID'),'participantCode':req.param('participantCode')}),'utf8',function(){
					console.log("Sent: "+req.param('takeawayID'))
					res.jsonp({"send":"success"})
				})//callback
			}).on("error", function(){
				res.jsonp({"send":"error"})
			})//socket.on


			MongoDB.getAll('cameras',function(_e,_data){
				if(_e) console.error(_e)
				else{
					_data.forEach(function(camera){
						console.log('calling reconnect for' +camera['address'])
						reconnect(camera['address'])
					})//_data.forEach
				}//if(_3)
			})//MongDB.getall

	}//return function
}//sendArmed

exports.reconnectAll = function(MongoDB){
	return function(req, res){
			MongoDB.getAll('cameras',function(_e,_data){
				if(_e) console.error(_e)
				else{
					_data.forEach(function(camera){
						console.log('calling reconnect for' +camera['address'])
						reconnect(camera['address'])
					})//_data.forEach
				}//if(_3)
			})//MongDB.getall
	}
}

//RECONNECTION CALLBACK FOR COUNTER CONNECTION

function reconnect(address,count){
	if(typeof count=='undefined') count=0
	if(count<10){
	http.get('http://'+address+':8080/reconnect',function(_res){
		_res.on('data',function(chunk){
			var status=JSON.parse(chunk)
			if(status['reconnect']==false){
				  count++
					setTimeout(reconnect(address,count),5000)
					console.log("attempting to reconnect to" +address)
			}
			else{
				console.log("reconnected to address: "+address)
			}
		})//_res.on
	}).on("error",function(e){
		console.error(e)
		console.log(address)
	})//http.get
}else{
	console.log("reconnection error on address: "+address)
}//endif count<10
}
