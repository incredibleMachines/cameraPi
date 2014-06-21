
var http = require('http')

var net = require('net')

var dgram = require('dgram');

var TRIGGER_IP = '192.168.0.199'
var TRIGGER_PORT = '7998'

// var DOWNLOAD_IP='192.168.0.2'
var DOWNLOAD_IP='localhost'

var BOLSTER_IP= "192.168.2.199"//"10.18.0.201"

var BOLSTER_PORT = '10001'


var LIVECAPTURE_IP = "192.168.0.6"
var LIVECAPTURE_PORT = "12121"

var currentTake = ''

exports.renderPage = function (MongoDB){
	return function(req,res){
		MongoDB.queryCollectionWithOptions('cameras',{camera_id:{$ne:"NULL"}},{sort:{camera_id:1}},function(err,cameras){
			if(!err){
					res.render('controller', {
						status: "Ready",
							title: "Nike Controller",
							header: "Controller Page",
							cameras: cameras
					})//render
			}else{
				res.jsonp({error:'db error', message: err})
			}
	})
	}//function
}//renderPage


/* INPUT FROM BOLSTER */

exports.scan = function(MongoDB){
	return function(req,res){
		var post = req.body
		console.log('---------------------------------------')
		console.log('SCAN FROM QR')
		console.log('action: '+post.action)
		console.log('participantCode: '+post.participantCode)
		console.log('firstName: '+post.firstName)
		console.log('lastName: '+post.lastName)
		console.log('---------------------------------------')


		//store the DB?

		//create take number
		var obj = {
								participantCode: post.participantCode,
								firstName: post.firstName,
								lastName: post.lastName,
								status: 'created',
								timestamp: new Date()
		}

		MongoDB.add('takes',obj,function(err,_take){

				if(err){
					res.jsonp(500,{error:error})
				}else{
					console.log('Created Take ID: '+_take._id)

					currentTake=_take
					var data = {
												app: 'SKILL_TRACK',
												action: 'ARM',
												takeawayId: _take._id,
												participantCode: _take.participantCode,

					}

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

					socket = net.Socket()
					socket.connect(BOLSTER_PORT,BOLSTER_IP)
					socket.on("connect",function(){
						console.log('socket connected')
						socket.write(JSON.stringify(data),'utf8',function(){
							res.jsonp({send:"success"})
						})
					}).on("error",function(err){
						res.jsonp(500,{error:err})
					})

				}
		})

		//socket connection to the browser app
		// var options={
		// 	hostname:DOWNLOAD_IP,
		// 	port:3001,
		// 	path:'/init?participantCode='+post.participantCode+'&firstName='+post.firstName+'&lastName='+post.lastName,
		// 	method:'GET'
		// }
		//
		// http.get(options, function(server){
		// 	console.log("Got response: " + server.statusCode)
		// 	res.jsonp({"armed":"sent"})
		// }).on('error', function(e) {
		// 		console.log("Got error: " + e.message)
		// 		res.jsonp({"error":e.message})
		// });
	}
}

exports.scanned = function(MongoDB,io){
	return function(req,res){
			var post = req.body
			console.log(post)
			MongoDB.getDocumentByID('takes', post.takeawayId,function(err,_take){
				if(err){
					res.jsonp(500,{error:err})
				}else{
					//we're good to go
					if(_take){
						if(_take.participantCode == post.participantCode){
							var server_error = false
							console.log('---------------------------')
							console.log('Signaling New Take')
							console.log('TakeID: '+_take._id)
							console.log('ParticipantCode: '+_take.participantCode)
							console.log(_take.firstName+' '+_take.lastName)
							console.log('---------------------------')

							//init download app
							http.get('http://'+DOWNLOAD_IP+':3001/init?take='+_take._id+'&method=armed&participant='+_take.participantCode,function(res){

								res.on('data',function(data){
									console.log('Received From Download: ')
									console.log(data.toString())
								})


							}).on("error",function(e){
								console.error("Could Not Connect to DownloadApp")
								console.error(e)
								server_error = true
							})//http.get
							//send to browser
							//let the browser know we have a new connection
							io.sockets.emit('QRSCAN',{take_id: _take._id, participantCode: _take.participantCode, firstName: _take.firstName, lastName: _take.lastName})

							var takeMessage = new Buffer("take "+_take._id)
							var qrMessage = new Buffer("qrcode "+_take.participantCode)
							var fNameMessage = new Buffer("firstname "+_take.firstName)
							var lNameMessage = new Buffer("lastname "+_take.lastName)

							var cbCounter = 0;
							var udpclient = dgram.createSocket("udp4");
							var message = new Buffer("take "+_take._id+" "+_take.participantCode)
							udpclient.send(message,0,message.length, TRIGGER_PORT,TRIGGER_IP,function(err,bytes){
								console.log("trigger message sent")
								udpclient.close()
							})
							var udpclient2 = dgram.createSocket("udp4")
							udpclient2.send(message,0,message.length,LIVECAPTURE_PORT, LIVECAPTURE_IP,function(err,bytes){
								console.log('Live Capture message sent')
								udpclient2.close()
							})

							if(!server_error) res.jsonp({success:'signaling to track'})
							else res.jsonp(500,{error:'could not connect to DownloadApp'})
						}else{
							res.jsonp(500,{error:'not a match'})
						}
					}else{
						res.jsonp(500,{error:'not found'})
					}

			}
		})
	}
}

exports.processed = function(MongoDB){
	return function(req,res){
		console.log("Processed Message!")
		console.log(req.param('take'))
		console.log(req.param('participant'))
		MongoDB.getDocumentByID('takes',req.param('take'),function(err,_take){
			// var options = {
			//   hostname: '192.168.0.200',
			//   port: 3000,
			//   path: '/',
			//   method: 'POST'
			// };
			// var req = http.request(options,function(res){
			// 	res.setEncoding('utf8')
			// 	res.on('data', function (chunk) {
			//     console.log('BODY: ' + chunk);
			//   });
			// })
			//
			// _take.bulletTime = "controlfreak/Desktop/cameraPi/processing_server/images/"+_take._id+"/output/"+_take.participantCode+"_"+_take._id+".mov"
			// _take.liveCapture = "controlfreak/Desktop/of/addons/ofxBlackMagic/liveVideoRecorder/bin/data/capture/"+_take.participantCode+"_"+_take._id+".mov"
			//
			// req.write(_take)
			// req.end()

		})
	}
}

exports.reset = function(){
	//return function(req,res){
		console.log("Reset Message")

				/* BETA BETA BETA */
				var data = {
											app: 'SKILL_TRACK',
											action: 'FINISH',
											takeawayId: currentTake._id,
											participantCode: currentTake.participantCode,
											filename: currentTake._id+'/output.mov'

				}
				socket = net.Socket()
				socket.connect(BOLSTER_PORT,BOLSTER_IP)
				socket.on("connect",function(){
					console.log('socket connected')
					socket.write(JSON.stringify(data),'utf8',function(){
						console.log("success")
					})
				}).on("error",function(err){
					console.log(err)
				})
	//}
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


			// MongoDB.getAll('cameras',function(_e,_data){
			// 	if(_e) console.error(_e)
			// 	else{
			// 		_data.forEach(function(camera){
			// 			console.log('calling reconnect for' +camera['address'])
			// 			reconnect(camera['address'])
			// 		})//_data.forEach
			// 	}//if(_3)
			// })//MongDB.getall

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
	if(count<3){
	http.get('http://'+address+':8080/reconnect',function(_res){
		_res.on('data',function(chunk){
			var status=JSON.parse(chunk)
			if(status['reconnect']==false){
				  count++
					setTimeout(reconnect(address,count),7500)
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
