

function CameraController( cameras ){
    console.log('camera controller')
    //getAll('status')

    $('button.get-status-all').click(function(event){

      getAll('status',function(err,camera,json){
        if(!err){
            if(json.status == true){
              $('.'+camera._id).addClass('connected')
            }else{
              $('.'+camera._id).addClass('disconnected')
            }
        }else{
          $('.'+camera._id).addClass('offline')

        }
      })

    })
    $('button.git-pull-all').click(function(event){

      getAll('gitpull',function(err,camera,json){
        if(!err){
            if(json.status == true){
              $('.'+camera._id).addClass('connected')
            }else{
              $('.'+camera._id).addClass('disconnected')
            }
        }else{
          $('.'+camera._id).addClass('offline')

        }
      })

    })

    $('button.reconnect-all').click(function(event){
      getAll('reconnect',function(err,camera,json){
        if(!err){
            if(json.reconnect == true){
              $('.'+camera._id).addClass('connected')
            }else{
              $('.'+camera._id).addClass('disconnected')
            }
        }else{
          $('.'+camera._id).addClass('offline')

        }
      })
    })

    $('button.reconnect').click(function(event){
      //console.log($(this))
      //hacking up a way to get the id...
      //super ugly
      var cameraParent =  $(this).parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      console.log(_id)
      var camera = _.findWhere(cameras,{_id:_id})
      //console.log(camera)
      getSingle('reconnect',camera.address,function(err,json){
        if(!err){
            console.log(json)
            if(json.reconnect == true){
              $('.'+camera._id).addClass('connected')
            }else{
              $('.'+camera._id).addClass('disconnected')
            }
        }else{
          $('.'+camera._id).addClass('offline')

        }
      })

    })
    $('button.status').click(function(event){
      var cameraParent = $(this).parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      var camera = _.findWhere(cameras,{_id:_id})
      console.log(camera)
      getSingle('status',camera.address,function(err,json){
        if(!err){
            if(json.status == true){
              $('.'+camera._id).addClass('connected')
            }else{
              $('.'+camera._id).addClass('disconnected')
            }
        }else{
          $('.'+camera._id).addClass('offline')

        }
      })
    })

    $('button.reboot').click(function(event){
      var cameraParent = $(this).parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      var camera = _.findWhere(cameras,{_id:_id})
      getSingle('reboot',camera.address,function(err,json){
        console.log('sent reboot')
      })
    })

    $('button.shutdown').click(function(event){
      var cameraParent = $(this).parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      var camera = _.findWhere(cameras,{_id:_id})
      getSingle('shutdown',camera.address,function(err,json){
        console.log('sent reboot')
      })
    })

    //******************************
    // Custom Functions
    //******************************

    function getSingle(type, ip, cb){
      var url ='http://'+ip+':8080/'+type
      $.getJSON(url).done(function(json){
        cb(null,json)
      }).fail(function(jqxhr,status,error){
        var err = status+' '+error;
        cb(err,null)
      })

    }

    function getAll(type, cb){
      //a function to get all camera status' reconnects etc
      //must pass function type parameter to get data
      //console.log('getting Json')
      $(cameras).each(function(i,camera){
        console.log(camera)
        var url ='http://'+camera.address+':8080/'+type
        console.log(url)
        $.getJSON(url).done(function(json){
          console.log(json)
          cb(null,camera,json)
        }).fail(function(jqxhr,status,error){
          var err = status+' '+error
          console.log('request failed: '+err)
          cb(err,camera,null)
          //$('.'+camera._id).addClass('offline')
        })

      })

    }

}
