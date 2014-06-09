var master, cameras
var currentCamera=001
var selectAll=false

exports.load =  function(_settings, MongoDB){
	return function(req,res){
	master=_settings
	var cameras=MongoDB.getAll('cameras', function(e, _data){
		if(!e){
			_data=sortByKey(_data,'camera_id');
		    res.render('camera-settings', {
			    settings: master,
			    cameras:_data,
			    currentCamera:currentCamera,
			    title: "Camera-Setting",
			    header: "Camera Settings!"
			})
		}
	})
	}
}

exports.addCamera = function (MongoDB){
	return function(req,res){
		console.log('page hit new-camera')
		var post = req.body
		console.log(post)
		var camera
		MongoDB.queryCollection('cameras',{serial:post.serial},function(e,_data){
				console.log(_data)
				if(!e){
					if(_data.length==0){
						message="new serial number found. added to db!"
						camera={camera_id:'NULL',address:post.address,serial:post.serial}
						MongoDB.add('cameras',camera, function(){})
					}
					
					else if(_data.length==1) {
						if(_data[0].address==post.address){
							message="camera found. no changes to record"
							camera={camera_id:_data[0].id,address:post.address,serial:post.serial}
						}
						else{
							message="camera found with new serial. updating db"
							camera={camera_id:_data[0].id,address:post.address,serial:post.serial}
						}
					}
					
					else{
						message="identical serial numbers found in db"
						camera={camera_id:'NULL',address:post.address,serial:post.serial}
					}
				}
				else{
					message="ERROR";
					camera={camera_id:'NULL',address:post.address,serial:post.serial}
				}
				res.render('new-camera',{
					camera:camera,
					message:message,
					title:"New-Camera",
					header: "New Camera Ping"
				})
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

exports.displayCameras = function (MongoDB){
return function(req,res){
	var cameras=MongoDB.getAll('cameras', function(e, _data){
		if(!e){
			_data=sortByKey(_data,'camera_id');
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
		MongoDB.update('cameras',{serial:post.serial},{$set: {camera_id: post.camera_id}}, function(e, _data){
			console.log("saved")
			res.redirect('/cameras/list') 
		})
	}
}

exports.armCameras = function (MongoDB){
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
		var get=req.param('camera_id');
		console.log(get)
		currentCamera=get
		res.redirect('/cameras/settings')
	}
}

exports.saveSetting=function(MongoDB){
	return function(req,res){
		var post=req.body
		console.log(post)
		console.log(Object.keys(post))

		MongoDB.queryCollection('cameras',{camera_id:currentCamera},function(e,_data){
			if(!e){
				console.log(_data);
				console.log('http://'+_data[0].address+'/set?'+Object.keys(post)+'='+post.manualfocusdrive)
				res.get('http://'+_data[0].address+'/set?'+Object.keys(post)+'='+post.manualfocusdrive)
			}
		})
	}
}




function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}