
var http = require('http')
var fs = require('fs')
var gm = require('gm')
var exec = require('child_process').exec



var width = 4272/960
var height = 2848/640

exports.renderPage = function (_settings, MongoDB){
	return function(req,res){
		res.render('images', {
			status: "Ready",
		    title: "Nike Image Editor",
		    header: "Image Page"
		})
	}
}

exports.saveImage = function(){
	return function (req,res){
		var post = req.body
		console.log(post["0X"])
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
		

/*
		gm("public/test_images/test_image.jpg").fill('#000').drawRectangle(0,0,4272,2848).fill("#fff").drawPolyline([post["0X"]*width,post["0Y"]*height],[post["1X"]*width,post["1Y"]*height],[post["2X"]*width,post["2Y"]*height],[post["3X"]*width,post["3Y"]*height]).write("public/test_images/test_matte.png",function(e){
				if(!e){
					console.log("masked")
					exec("gm composite -compose CopyOpacity public/test_images/test_matte.png public/test_images/test_image.jpg public/test_images/test_composed.png")	
				}	
				else{
					console.log(e)
				}
				})
				
		gm("public/test_images/test_image.jpg").crop(post["2X"]*width-post["0X"]*width,post["2Y"]*height-post["0Y"]*height,post["0X"]*width,post["0Y"]*height).resize(640,640).write("public/test_images/test_out.jpg", function(e){
			if(!e){
				console.log("write")
				res.redirect('/images')
			}
			else{
				console.log(e)
			}
		})
*/
	}
}
