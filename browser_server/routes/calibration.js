
var http = require('http')
var fs = require('fs')
var gm = require('gm')
var exec = require('child_process').exec
var currentCamera='001'

var width = 4272/960
var height = 2848/640

exports.renderPage = function (MongoDB){

	return function(req,res,next){
		MongoDB.getAll('cameras', function(e, _data){
			if(!e){
			// console.log(_data)
			_data=sortByKey(_data, 'camera_id')//MIGRATE TO UNDERSCORE
					res.render('calibration', {
						cameras:_data,
						currentCamera:currentCamera,
						status: "Ready",
					    title: "Nike Image Editor",
					    header: "Image Page"
				})//sortbyKey
			}//endif(!e)
		})//MongoDB.getAll
	}//return function
}//renderPage

exports.saveCentered = function(MongoDB){
	return function(req,res){

		MongoDB.update('cameras',{camera_id:currentCamera},{$set:{x:160,y:0,w:640,h:640,rotate:0}},function(_e,_data){
				if(!_e){
					console.log("crop for camera "+currentCamera+" saved!")
					res.redirect("/images")
				}else console.log(_e)
			})//if(!_e)
		}//return function
}

exports.setCamera = function(){
	return function (req,res){
		var get=req.param('camera_id');
		currentCamera=get
		console.log("GET: "+get)
		res.redirect('/calibration')
	}//return function
}//setCamera

exports.saveImage = function(MongoDB){
	return function (req,res){
		var post = req.body
		console.log(post["current"]);
	currentCamera=post["current"]
	MongoDB.update('cameras',{camera_id:currentCamera},{$set:{x:post["x"],y:post["y"],w:post["w"],h:post["h"],rotate:post["rotate"]}},function(_e,_data){
				if(!_e){
					console.log("crop for camera "+currentCamera+" saved!")
					res.redirect("/images")
				}else console.log(_e)
			})//if(!_e)
		}//return function
}//saveImage

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key]
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}
