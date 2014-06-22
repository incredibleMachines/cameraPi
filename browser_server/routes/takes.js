exports.index=function(MongoDB){
  return function(req,res){
      MongoDB.getAll('takes',function(err,takes){
        res.render('takes-index',{title: 'takes', takes:takes})
      })
  }
}
exports.findSingle =function(MongoDB){
  return function(req,res){
    var id = req.params.id
    console.log(id)
    MongoDB.getDocumentByID('takes',id,function(err,doc){
      if(err){
        console.error(err)
        res.jsonp(500,{error:err})
        }else{
          res.jsonp(doc)
      }
    })
  }
}
