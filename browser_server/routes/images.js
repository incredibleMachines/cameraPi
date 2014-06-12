
var http = require('http')
var fs = require('fs')
var gm = require('gm')
var exec = require('child_process').exec
var currentCamera='001'



var width = 4272/960
var height = 2848/640

exports.renderPage = function (MongoDB){

	return function(req,res){
		MongoDB.getAll('cameras', function(e, _data){
			if(!e){
			console.log(_data)
			_data=sortByKey(_data, 'camera_id')
					res.render('images', {
						cameras:_data,
						currentCamera:currentCamera,
						status: "Ready",
					    title: "Nike Image Editor",
					    header: "Image Page"
				})
			}
		})
	}
}

exports.setCamera = function(){
	return function (req,res){
		var get=req.param('camera_id');
/* 		console.log(get) */
		currentCamera=get
		console.log("GET: "+get)
		res.redirect('/images')
	}
}

exports.saveImage = function(MongoDB){
	return function (req,res){
		var post = req.body
		console.log(post);
		var json=[{"x":post["0X"],"y":post["0Y"]},{"x":post["1X"],"y":post["1Y"]},{"x":post["2X"],"y":post["2Y"]},{"x":post["3X"],"y":post["3Y"]}]
		
		MongoDB.update('cameras',{camera_id:currentCamera},{$set:{warp:json}},function(e,_data){
				if(!e){
					console.log("crop for camera "+currentCamera+" saved!")
					res.redirect("/images")
				}
				})
				}
		
		
		/*
var command = "convert public/test_images/test_image.jpg -matte -virtual-pixel transparent \ -distort Perspective \ '"+post["0X"]*width+","+post["0Y"]*height+" 0,0 "+post["1X"]*width+","+post["1Y"]*height+" 640,0 "+post["2X"]*width+","+post["2Y"]*height+" 640,640 "+post["3X"]*width+","+post["3Y"]*height+" 0,640' \ public/test_images/test_warped.jpg"
		
		exec(command,function(error,stdout,stderr){
			if(!error){
				gm("public/test_images/test_warped.jpg").crop(640,640,0,0).write("public/test_images/test_out.jpg", function(e){
			if(!e){
				console.log("write")
				res.redirect('/images')
			}
			else{
				console.log(e)
			}
		})
			}
			else{
				console.log(error)
			}
		})
		
		
		console.log("convert public/test_images/test_image.jpg -matte -virtual-pixel transparent \ -distort Perspective \ '"+post["0X"]*width+","+post["0Y"]*height+" 0,0 "+post["1X"]*width+","+post["1Y"]*height+" 640,0 "+post["2X"]*width+","+post["2Y"]*height+" 640,640 "+post["3X"]*width+","+post["3Y"]*height+" 0,640' \ public/test_images/test_warped.jpg")
		
	}
*/
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key]
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

