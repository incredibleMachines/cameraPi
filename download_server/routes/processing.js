
var http = require('http')

exports.saveImage()= function(MongoDB){
  res.jsonp({post:true})
  //console.log(req)
  var post = req.body;
  //console.log(post)
  var files = req.files;
  //console.log(files)
  var image = files.image
  //console.log(image)
  var file = image.originalFilename.substr(0,image.originalFilename.indexOf('.'))
  //need to create unique image paths here
  fs.rename(image.path,'images/'+req.connection.remoteAddress+'.jpg', function(err){
    imageCounter++;
    if(err) console.error(err)
    console.log('Image Saved.')
  })
}