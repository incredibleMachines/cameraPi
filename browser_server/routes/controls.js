
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
				var count=0
			_data.forEach(function(addr, i){
				//console.log(_data)
				console.log('http://'+addr.address+':8080/gitpull')
				http.get('http://'+addr.address+':8080/gitpull', function(server){
					console.log("Got response: " + res.statusCode)
				}).on('error', function(e) {
  					console.log("Got error: " + e.message)
				});
				count++
				if(count==_data.length){
					res.redirect('/camera/list')
				}
			})
			}
		})
	}
}


exports.shutdown = function(MongoDB){
	return function(req,res){
		MongoDB.getAll('cameras',function(e, _data){
			if(!e){
				var count=0
			_data.forEach(function(addr, i){
				//console.log(_data)
				console.log('http://'+addr.address+':8080/shutdown')
				http.get('http://'+addr.address+':8080/shutdown', function(server){
					console.log("Got response: " + res.statusCode)
				}).on('error', function(e) {
						console.log("Got error: " + e.message)
				});
				count++
				if(count==_data.length){
					res.redirect('/camera/list')
				}
			})
			}
		})
	}
}
