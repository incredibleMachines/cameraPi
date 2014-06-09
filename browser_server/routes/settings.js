var master, cameras
var currentCamera="all"
var selectAll=true

exports.load =  function(_settings, MongoDB){
	return function(req,res){
	var post=req.body
	master=_settings
	current=master
	if(selectAll==false){
		for(var i=0;i<current.length;i++){
			var currentVal=res.get('http://'+currentCamera+'/get?'+current[i].call)
			if(currentVal){
				current[i].value=currentVal
			}
			console.log('http://'+currentCamera+'/get?'+current[i].call)
			console.log(current[i].value)
		}
	}
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
				if(!e){
					if(_data.length==0){
						console.log("new serial number found.")
						camera={camera_id:'NULL',address:post.address,serial:post.serial}
						MongoDB.add('cameras',camera, function(){
							console.log("added to db!")	
						})
					}
					else if(_data.length==1) {
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
					
					else{
						console.log("identical serial numbers found in db")
					}
				}
				else{
					message=e;
				}
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
		if(get=="all"){
			selectAll=true	
		}
		else{
			selectAll=false
		}
		console.log(get)
		currentCamera=get
		res.redirect('/cameras/settings')
	}
}

exports.saveSetting=function(MongoDB){
	return function(req,res){
	if(selectAll==false){
		var post=req.body
		MongoDB.queryCollection('cameras',{camera_id:currentCamera},function(e,_data){
			if(!e){
				console.log(_data);
				console.log('http://'+_data[0].address+'/set?'+Object.keys(post)+'='+post[0])
				res.get('http://'+_data[0].address+'/set?'+Object.keys(post)+'='+post[0])
			}
		})
	}
	else{
		var post=req.body
		MongoDB.getAll('cameras', function(e, _data){
			if(!e){
				for(var i=0;i<_data.length;i++){
					console.log(_data[i]);
					console.log('http://'+_data[i].address+'/set?'+Object.keys(post)+'='+post[0])
					res.get('http://'+_data[i].address+'/set?'+Object.keys(post)+'='+post[0])
				}
				}
		})
	}
	}
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}