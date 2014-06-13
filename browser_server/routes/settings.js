
var http = require('http')

var master, cameras
var currentCamera="all"
var selectAll=true

exports.setupDB = function (_settings, MongoDB){
	return function(req,res){
		console.log(_settings)
		console.log(_settings[0])
		_settings.forEach(function(setting,i){

			var values = {}
			console.log(setting.call)
			values.call=setting.call
			values.value=setting.value
			values.camera_id="master"

			MongoDB.queryCollection('settings',{call:values.call},function(e,_data){
				if(!e){
					if(_data.length==0){

						MongoDB.add('settings', values, function(e){})
					}
					else{
						console.log("found")
						MongoDB.update('settings',{call:values.call,camera_id:"master"},{$set:{value:values.value}},function(e,_data){

						})
					}
				}
				})

			var info = {}
			info.call=_settings[i].call
			info.name=_settings[i].name
			info.order=i
			info.options=_settings[i].options
			MongoDB.queryCollection('options',{call:info.call},function(e,_data){
				if(!e){
					if(_data.length==0){

						MongoDB.add('options', info, function(e){})
					}
				}
				})

		})
			res.redirect('/cameras/settings')
		}
}

exports.load =  function(MongoDB){

	return function(req,res){

		var post=req.body
		var current = []
		var selectCamera
		if(selectAll==true){
			selectCamera="master"
		}
		else{
			selectCamera=currentCamera
		}

		var options
		MongoDB.getAll('options', function(e, _data){
			if(!e){
				options=_data
				var optionCount=0
				options.forEach(function(option,i){
					MongoDB.queryCollection('settings',{camera_id:selectCamera,call:option.call},function(e,currentdata){
						if(!e){

							var item={}
							item.name=option.name
							item.call=option.call
							item.value=currentdata[0].value
							item.options=option.options
							item.order=option.order
							current.push(item)
						}
						optionCount++
						if(optionCount==options.length){
							current=sortByKey(current, 'order')
							MongoDB.getAll('cameras', function(e, _data){
							if(!e){
									console.log(_data)
									_data=sortByKey(_data,'camera_id')
					    		res.render('camera-settings', {
						    		settings: current,
						    		cameras:_data,
						    		currentCamera:currentCamera,
						    		title: "Camera-Setting",
						    		header: "Camera Settings!"
									})
								}
							})
						}
					})
				})
			}
		})
	}
}

exports.initCamera = function(_settings,MongoDB){
	return function(req,res){
		var post=req.body
		console.log(req.body)
		http.get('http://'+post.address+':8080/init', function(server){
			console.log("Got response: " + res.statusCode)
			console.log("From: "+_data[0].address)
			res.redirect('/cameras/list')
		}).on('error', function(e) {
				console.log("Got error: " + e.message)
				console.log("From: "+_data[0].address)
				res.jsonp({"error":e.message})
		});
	}
}

exports.addCamera = function (_settings, MongoDB){
	return function(req,res){
		console.log('page hit new-camera')
		var post = req.body
		post.address = req.connection.remoteAddress;
    console.log(post)



		var camera
		MongoDB.queryCollection('cameras',{serial:post.serial},function(e,_data){
				if(!e){
					if(_data.length==0){
						if(post.serial!='NaN'){
						console.log("new serial number found.")
						camera={camera_id:'NULL',address:post.address,serial:post.serial,laser:false,master:false, master_number:null,delay:null}
						MongoDB.update('cameras',{address:post.address},{$set: {serial: post.serial}}, function(e, _data) {

							if(!e){
								if(typeof _data=='undefined'){
									MongoDB.add('cameras',camera, function(){
										console.log("added to db!")
									})
								}
							}

						})
							}

						else{
							MongoDB.queryCollection('cameras',{address:post.address},function(e,_data){
									if(!e){
									if(_data.length==0){
										console.log("new ip address number found.")
										camera={camera_id:'NULL',address:post.address,serial:post.serial,laser:false,master:false, master_number:null,delay:null}
										MongoDB.add('cameras',camera, function(){
											console.log("added to db!")
										})
									}
								}
							})

						}

					}


					else if(_data.length==1) {
						if(post.serial=='NaN'){
							MongoDB.queryCollection('cameras',{address:post.address},function(e,_data){
								if(!e){
								if(_data.length==0){
									console.log("new ip address number found.")
									camera={camera_id:'NULL',address:post.address,serial:post.serial,laser:false,master:false, master_number:null,delay:null}
									MongoDB.add('cameras',camera, function(){
										console.log("added to db!")
									})
								}
							}
						})
						}
						else{
						if(_data[0].address==post.address){
							console.log("camera found. no changes to record")
						}
						else{
							console.log("camera found with new address.")
/* 							camera={camera_id:_data[0].id,address:post.address,serial:post.serial} */
						MongoDB.update('cameras',{serial:post.serial},{$set: {address: post.address}}, function(e, _data) {
							console.log("updated db!")
						})
						}
					}
				}


					else if(post.serial=='NaN'){
						MongoDB.queryCollection('cameras',{address:post.address},function(e,_data){
							if(!e){
							if(_data.length==0){
								console.log("new ip address number found.")
								camera={camera_id:'NULL',address:post.address,serial:post.serial,laser:false,master:false, master_number:null,delay:null}
								MongoDB.add('cameras',camera, function(){
									console.log("added to db!")
								})
							}
						}
					})
					}

					else{
						console.log("identical serial numbers found in db")
					}
				}
				else{
					message=e;
				}

			/** MUST MUST MUST MUST SEND RESPONSE BACK TO CLIENT WITH SETTINGS **/
			res.jsonp(post)

		})
	}
}

exports.reset = function (){
	return function(req,res){
	    res.render('camera-settings', {
		    settings: master,
		    title: "Reset Camera",
		    header: "Reset Camera"
		})
	}
}

exports.deleteCamera = function (MongoDB){

	return function(req,res){

var post = req.body
MongoDB.remove('cameras',{address:post.address},function(e){

	res.jsonp("camera:removed")

})




	}

}

exports.displayCameras = function (MongoDB){
return function(req,res){
	MongoDB.getAll('cameras', function(e, _data){
		if(!e){
			_data=sortByKey(_data,'camera_id')
			res.render('cameras-list',{
					cameras:_data,
					title:"New-Camera",
					header: "New Camera Ping"
					})
			}
	})
}
}

exports.saveCamera = function (MongoDB){
return function(req,res){
		var post = req.body
		console.log(post)
		if(post.laser==null){
			post.laser=false
		}
		else if(post.laser=="on"){
			post.laser=true
		}
		if(post.master==null){
			post.master=false
		}
		else if(post.master=="on"){
			post.master=true
		}

		MongoDB.queryCollection('settings',{camera_id:post.camera_id,address:post.address},function(e,_data){
				if(!e){
				if(_data.length==0){
				console.log(_data)
				MongoDB.queryCollection('settings',{camera_id:"master"},function(e,master_data){
						master_data.forEach(function(setting,i){
							var newSettings = {}
							newSettings.call=setting.call
							newSettings.value=setting.value
							newSettings.camera_id=post.camera_id
							MongoDB.add('settings', newSettings, function(e){})
						})
						console.log("added settings to db!")

					})
				}
				}

		})

		var reset=[{x:20,y:20},{x:620,y:20},{x:620,y:620},{x:20,y:620} ]

		MongoDB.update('cameras',{camera_id:post.camera_id, warp:{$exists:false}, address:post.address},{$set: {warp:reset}}, function(e, _data){
			console.log("update warp")
		})

		MongoDB.update('cameras',{serial:post.serial, address:post.address},{$set: {camera_id: post.camera_id,laser:post.laser,master:post.master,master_number:post.master_number,delay:post.delay}}, function(e, _data){
			res.redirect('/cameras/list')
		})

	}
}

exports.armCameras = function (MongoDB){
	return function(req,res){
		var trigger={}
		var cameras=MongoDB.getAll('cameras', function(e, _data){
			if(!e){
				var count=0
			_data=sortByKey(_data, 'camera_id')
				_data.forEach(function(camera,i){
					trigger[i.toString()]={}
						trigger[i.toString()].camera_id=camera.camera_id
						trigger[i.toString()].address=camera.address
						trigger[i.toString()].serial=camera.serial
						trigger[i.toString()].laser=camera.laser
						count++
				})
				if(count==_data.length){
				res.jsonp(trigger)
				}
			}
		})
	}
}

exports.getInfo = function (MongoDB){
	return function(req,res){
		var cameras=MongoDB.getAll('cameras', function(e, _data){
			if(!e){
				res.jsonp(_data)
			}
		})
	}
}

exports.selectCamera=function (){
	return function(req,res){
		console.log("SELECTED")
		var get=req.param('camera_id');
		if(get=="all"){
			selectAll=true
		}
		else{
			selectAll=false
		}
		currentCamera=get
		res.redirect('/cameras/settings')
	}
}

exports.saveSetting=function(MongoDB){
	return function(req,res){
	if(selectAll==false){
		var post=req.body
		console.log(post)
		var key=Object.keys(post)[0]
		var newValue=post[key]
		console.log("key: "+key)

		MongoDB.update('settings',{camera_id:currentCamera,call:key},{$set:{value:newValue}},function(e,_data){
			console.log("settings save to camera "+currentCamera)
		})

		MongoDB.queryCollection('cameras',{camera_id:currentCamera},function(e,_data){
			if(!e){
				console.log(_data)
				console.log('http://'+_data[0].address+':8080/set?'+key+'='+post[key])
				http.get('http://'+_data[0].address+':8080/set?'+key+'='+post[key], function(server){
					console.log("Got response: " + res.statusCode)
					console.log("From: "+_data[0].address)
				}).on('error', function(e) {
  					console.log("Got error: " + e.message)
						console.log("From: "+_data[0].address)
				});

			}
		})
		res.redirect('/cameras/settings')
	}
	else{
		var post=req.body

		var post=req.body
		console.log(post)
		var key=Object.keys(post)[0]
		var newValue=post[key]
		console.log("key: "+key)

		MongoDB.getAll('cameras', function(e, _data){
			if(!e){
				_data.forEach(function(camera,i){

					MongoDB.update('settings',{camera_id:camera.camera_id,call:key},{$set:{value:newValue}},function(e,_data){
						console.log("settings save to camera "+camera.camera_id)
					})

					MongoDB.queryCollection('cameras',{camera_id:camera.camera_id},function(e,_data){
						if(!e){
							console.log(_data)
							console.log('http://'+_data[0].address+':8080/set?'+key+'='+post[key])
							http.get('http://'+_data[0].address+':8080/set?'+key+'='+post[key], function(server){
								console.log("Got response: " + res.statusCode)
								console.log("From: "+_data[0].address)
							}).on('error', function(e) {
			  					console.log("Got error: " + e.message)
									console.log("From: "+_data[0].address)
							});

						}
					})
		})
		}})
		res.redirect('/cameras/settings')

		MongoDB.update('settings',{camera_id:"master",call:key},{$set:{value:newValue}},function(e,_data){
						console.log("settings save to camera master")
					})


	}
	}
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key]
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
