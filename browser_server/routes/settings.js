var master;

exports.load =  function(_settings){
	master=_settings;
	return function(req, res){
	    res.render('camera-settings', {
		    settings: master,
		    title: "Camera-Setting",
		    header: "Camera Settings!"
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
				console.log(_data);
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
				console.log(post);
				MongoDB.update('cameras',{serial:post.serial},{$set: {camera_id: post.camera_id}}, function(e, _data){
					console.log("saved");
					res.redirect('/cameras/list') 
				})
}
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}