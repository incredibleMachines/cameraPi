
var http = require('http')

var master, cameras
var currentCamera="all"
var selectAll=true

// var DOWNLOAD_IP = "192.168.0.2"
var DOWNLOAD_IP = "localhost"

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

						MongoDB.add('settings', values, function(e){

						})//MongoDB.add
					}//end if(_data.length==0)
					else{
						console.log("found")
						MongoDB.update('settings',{call:values.call,camera_id:"master"},{$set:{value:values.value}},function(e,_data){

						})//MongoDB.update
					}//end else if(_data.length==0)
				}//end if(!e)
				else{
					console.error(e)
				}//end else if(!e)
			})//MongoDB.queryCollection('settings'

			var info = {}
			info.call=setting.call
			info.name=setting.name
			info.order=i
			info.options=setting.options
			MongoDB.queryCollection('options',{call:info.call},function(e,_data){
				if(!e){
						if(_data.length==0){
							MongoDB.add('options', info, function(e){})
						}//end if(_data.length==0)
				}//end if(!e)
				else{
					console.error(e)
				}//end else if(!e)
			})//MongoDB.queryCollection('options'

		})//_settings.forEach
		res.redirect('/cameras/settings')
	}//return function
}//setupDB

exports.load =  function(MongoDB){

	return function(req,res){

		var post=req.body
		var current = []
		var selectCamera
		if(selectAll==true){
			selectCamera="master"
		}//end if(selectAll==true)
		else{
			selectCamera=currentCamera
		}//end else if(selectAll==true){

		var options
		MongoDB.getAll('options', function(_e, _data){
			if(!_e){
				options=_data
				var optionCount=0
				options.forEach(function(option,i){
					MongoDB.queryCollection('settings',{camera_id:selectCamera,call:option.call},function(__e,__data){
						if(!__e){

							var item={}
							item.name=option.name
							item.call=option.call
							item.value=__data[0].value
							item.options=option.options
							item.order=option.order
							current.push(item)

							optionCount++
							if(optionCount==options.length){
								current=sortByKey(current, 'order')
								MongoDB.getAll('cameras', function(___e, ___data){
								if(!___e){
										console.log(___data)
										___data=sortByKey(___data,'camera_id')
										res.render('camera-settings', {
											settings: current,
											cameras: ___data,
											currentCamera:currentCamera,
											title: "Camera-Setting",
											header: "Camera Settings!"
										})//res.render
									}//end if(!___e)
								else{
									console.error(___e)
								}//end else if(!___e)
							})//MongoDB.getAll
						}//if(optionCount==options.length)

					}//end if (!__e)
					else{
						console.error(__e)
					}//end else if(!__e)

				})//MongoDB.queryCollection
			})//options.forEach
		}//end if(!_e)
		else{
			console.error(_e)
		}//end else if(!_e)
	})//MongoDB.getAll('options'
}//return function
}//function load()

exports.initCamera = function(_settings,MongoDB){
	return function(req,res){
		var post=req.body
		console.log(req.body)
		http.get('http://'+post.address+':8080/init', function(server){
			console.log("Got response: " + res.statusCode)
			console.log("From: "+post.address)
			res.redirect('/cameras/list')
		}).on('error', function(e) {
				console.log("Got error: " + e.message)
				console.log("From: "+post.address)
				res.jsonp({"error":e.message})
		});//end http.get
	}//end return function
}//end funciton initCamera()

exports.addCamera = function (_settings, MongoDB){
	return function(req,res){

		//Get Post Data from Form
		console.log('page hit new-camera')
		var post = req.body
		post.address = req.connection.remoteAddress;
    console.log(post)

		var camera
		MongoDB.queryCollection('cameras',{address:post.address},function(_e,_data){
			if(_e) console.error(_e)
			else{
				if(_data.length==0){
					MongoDB.add('cameras',{address:post.address,camera_id:'NULL'},function(__e){
							if(__e) console.error(_e)
							else console.log("added adress: "+post.address+" to db")
					})//MongoDB.add
				}else{
					console.log("address alread present")
				}//endif(_data.length==0)
			}//endif(_e)
		})//MongoDB.queryCollection
	}//return function
}//end addCamera

exports.reset = function (){
	return function(req,res){
	    res.render('camera-settings', {
		    settings: master,
		    title: "Reset Camera",
		    header: "Reset Camera"
		})//res.render('camera-settings')
	}//end return function
}//end reset

exports.deleteCamera = function (MongoDB){

	return function(req,res){
		var post = req.body
		MongoDB.remove('cameras',{address:post.address},function(e){
			res.jsonp("camera:removed")
		})//MongoDB.remote('cameras')
	}//end return function
}//end function deletCamera

exports.displayCameras = function (MongoDB){
	return function(req,res){
		MongoDB.getAll('cameras', function(_e, _data){
			if(!_e){
					_data=sortByKey(_data,'camera_id')
					res.render('cameras-list',{
						cameras:_data,
						title:"Camera List"
					})//end res.render
				}//end if(!_e)
				else{
					console.error(_e)
				}
		})//end MongoDB.getAll('cameras')
	}//end return function
}//end function displayCameras

exports.saveCamera = function (MongoDB){
return function(req,res){
		var post = req.body
		console.log(post)

		if(post.laser==null) post.laser=false
		else if(post.laser=="on") post.laser=true

		if(post.master==null) post.master=false
		else if(post.master=="on") post.master=true


		MongoDB.queryCollection('settings',{camera_id:post.camera_id,address:post.address},function(_e,_data){
				if(!_e){
				if(_data.length==0){
				console.log(_data)
				MongoDB.queryCollection('settings',{camera_id:"master"},function(__e,__data){
					if(!__e){
						__data.forEach(function(setting,i){
							var newSettings = {}
							newSettings.call=setting.call
							newSettings.value=setting.value
							newSettings.camera_id=post.camera_id
							MongoDB.add('settings', newSettings, function(___e){
								if(___e) console.error(___e)
							})//end MongoDB.add('settings')
						})//end __data.forEach
						console.log("added settings to db!")
					}//end if(!__e)
					else console.error(__e)

					})//end MongoDB.queryCollection('settings')
				}//end if (_data.length==0)
			}//end if(!_e)
			else{
				console.log(_e)
			}//end else if(!_e)

		})//end MongoDB.queryCollection('settings')

		MongoDB.getDocumentByCameraID('cameras',post.camera_id,function(_e,_doc){
			if(!_e){
				if(!_doc){
					console.error("Camera id: "+ post.camera_id+" not found")
					var updateObj = {$set: {camera_id: post.camera_id,
																	laser:post.laser,
																	master:post.master,
																	master_number:post.master_number,
																	delay:post.delay,
																	warp: [{x:20,y:20},{x:620,y:20},{x:620,y:620},{x:20,y:620} ]}
																	}
					MongoDB.update('cameras',{address:post.address},updateObj,function(__e){
						if(__e) console.error(__e)
					})//MongoDB.update
					res.redirect('/cameras/list')
				}else{
						if(_doc.hasOwnProperty('warp')){
							updateCameraOnSave(MongoDB,_doc,post,function(__e){
								if(__e) console.error(__e)
								res.redirect('/cameras/list')
							})
						}else{
							var reset=[{x:20,y:20},{x:620,y:20},{x:620,y:620},{x:20,y:620} ]
							var updateObj = {$set: {warp:reset}}
							MongoDB.updateByID('cameras',_doc._id,updateObj,function(__e){
								if(__e) console.error(__e)
								updateCameraOnSave(MongoDB,_doc,post,function(___e){
									if(___e) console.error(___e)
									res.redirect('/cameras/list')
								})
							})//MongoDB.updateByID
						}//endif(_doc.hasOwnProperty('warp'))
				}//endif(!doc)

			}else console.error(_e) //if(!_e)
		})//MongoDB.queryCollection('cameras')


	}//end return function
}//end function saveCamera()

function updateCameraOnSave(_MongoDB,_doc,post,cb){
	var updateObj = {$set: {camera_id: post.camera_id,
													laser:post.laser,
													master:post.master,
													master_number:post.master_number,
													delay:post.delay}
													}
	_MongoDB.updateByID('cameras',_doc._id,updateObj, function(_e){
		cb(_e)
		console.log('saved')
		// res.redirect('/cameras/list')
	})//end MongoDB.update('cameras')
}

exports.armCameras = function (MongoDB){
	return function(req,res){
		var trigger={}
		var cameras=MongoDB.getAll('cameras', function(_e, _data){
			if(!_e){
				var count=0
				_data=sortByKey(_data, 'camera_id')
				_data.forEach(function(camera,i){
					trigger[i.toString()]={}
						trigger[i.toString()].camera_id=camera.camera_id
						trigger[i.toString()].address=camera.address
						trigger[i.toString()].serial=camera.serial
						trigger[i.toString()].laser=camera.laser
						count++
				})//end _data.forEach
				if(count==_data.length){
					res.jsonp(trigger)
				}//end if(count==_data.length)
			}//end if(!_e)
			else console.error(_e)
		})//end MongoDB.getAll('cameras')
	}//end return funciton
}//end armCameras()

exports.getInfo = function (MongoDB){
	return function(req,res){
		var cameras=MongoDB.getAll('cameras', function(_e, _data){
			if(_e) console.error(_e)
			_data=sortByKey(_data,'camera_id')
			console.log(_data)
			res.jsonp(_data)
		})//end MongoDB.getAll('cameras')
	}//return function
}//getInfo()

exports.selectCamera=function (){
	return function(req,res){
		console.log("SELECTED")
		var get=req.param('camera_id');
		if(get=="all") selectAll=true
		else selectAll=false
		currentCamera=get
		res.redirect('/cameras/settings')
	}//end return function
}//end selectCamera()

exports.saveSetting=function(MongoDB){
	return function(req,res){
		var post=req.body
		console.log(post)
		var key=Object.keys(post)[0]
		var newValue=post[key]
		console.log("key: "+key)

		if(selectAll==false){

			MongoDB.update('settings',{camera_id:currentCamera,call:key},{$set:{value:newValue}},function(_e,_data){
				if(_e) console.error(_e)
				else console.log("settings save to camera "+currentCamera)
				MongoDB.getDocumentByCameraID('cameras',currentCamera,function(__e,__doc){
					if(!__e){
						console.log(__doc)
						console.log('http://'+__doc.address+':8080/set?'+key+'='+post[key])
						http.get('http://'+__doc.address+':8080/set?'+key+'='+post[key], function(__res){
							console.log("Got response: " + __res.statusCode)
							console.log("From: "+__doc.address)
						}).on('error', function(___e) {
								console.log("Got error: " + ___e.message)
								console.log("From: "+__doc.address)
						})//http.get
					}//if(!_e)
					else console.error(_e)
					res.redirect('/cameras/settings')
				})//MongoDB.getDocumentByCameraID
			})//MongoDB.update('settings')


	}else{

		MongoDB.getAll('cameras', function(_e, _data){
			if(!_e){
				_data.forEach(function(camera,i){
					MongoDB.update('settings',{camera_id:camera.camera_id,call:key},{$set:{value:newValue}},function(__e,__data){
						if(__e) console.error(__e)
						else console.log("settings save to camera "+camera.camera_id)
						MongoDB.getDocumentByCameraID('cameras',camera.camera_id,function(___e,___doc){
									if(!___e){
										console.log(___doc)
										console.log('http://'+___doc.address+':8080/set?'+key+'='+post[key])
										http.get('http://'+___doc.address+':8080/set?'+key+'='+post[key], function(___res){
											console.log("Got response: " + ___res.statusCode)
											___res.on('data',function(chunk){
												console.log("Got Data: "+chunk)
											})
											console.log("From: "+___doc.address)
										}).on('error', function(____e) {
												console.log("Got error: " + ____e.message)
												console.log("From: "+___doc.address)
										});
									}else console.error(___e)//endif(!___e)
							})//MongoDB.getDocumentByCameraID
					})//MongoDB.update('settings')
				})//_data.forEach
			}else console.error(_e)//endif(!_e)
			res.redirect('/cameras/settings')
		})//MongoDB.getAll('cameras')


/*THIS UPDATES ALL MASTER SETTINGS - NOT SURE WHY THIS IS HERE? SP */
		// MongoDB.update('settings',{camera_id:"master",call:key},{$set:{value:newValue}},function(_e,_data){
		// 	if(_e) console.error(_e)
		// 	else console.log("settings save to camera master")
		// })


		}//endif (selectAll==true)
	}//return function
}//saveSettings()

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key]
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
