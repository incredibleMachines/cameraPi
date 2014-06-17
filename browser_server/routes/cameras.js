//camera view



exports.index = function(MongoDB){
  return function(req,res){
    MongoDB.queryCollectionWithOptions('cameras',{},{sort:{camera_id:1}},function(err,cameras){
      if(!err) res.render('cameras-index',{ title:'Cameras Index', cameras: cameras})
      else res.jsonp({error: err})
    })
  }
}
