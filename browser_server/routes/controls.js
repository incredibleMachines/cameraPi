
var http = require('http')

exports.renderPage = function (){
	return function(req,res){
		res.render('controller', {
			status: "Ready",
		    title: "Nike Controller",
		    header: "Controller Page"
		})
	}
}

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
		MongoDB.getAll('cameras',function(e, _data){
			if(!e){
				console.log(_data)
				console.log('http://'+_data[0].address+':8080/gitpull')
				http.get('http://'+_data[0].address+':8080/gitpull', function(server){
					console.log("Got response: " + res.statusCode)
					res.redirect('/cameras/list')
				}).on('error', function(e) {
  					console.log("Got error: " + e.message)
				});

			}
		})
	}
}
