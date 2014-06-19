

function CameraController( cameras ){
    console.log('camera controller')
    //getAll('status')

    /* GLOBALS */

    var CURRENT_TAKE = '',
        DOWNLOAD_IP = '192.168.0.2:3001',
        PROCESS_IP = '192.168.0.5:3002'



    $('button.process').click(function(event){
      if(CURRENT_TAKE !== ''){
        $.getJSON('http://'+PROCESS_IP+'/?take='+CURRENT_TAKE)
      }else{
        alert('You Must Arm The System First')
      }
    })
    $('button.get-status-all').click(function(event){

      getAll('status',function(err,camera,json){
        if(!err){
            if(json.status == true){
              $('.'+camera._id).addClass('connected').removeClass('ready').removeClass('offline').removeClass('disconnected')
              $('.'+camera._id+' .camera-settings').html(JSON.stringify(json))

            }else{
              $('.'+camera._id).addClass('disconnected').removeClass('ready').removeClass('connected').removeClass('offline')
            }
        }else{
          $('.'+camera._id).addClass('offline').removeClass('disconnected').removeClass('ready').removeClass('connected')

        }
      })

    })
    $('button.git-pull-all').click(function(event){

      getAll('gitpull',function(err,camera,json){
        if(!err){
            if(json.status == true){
              $('.'+camera._id).addClass('connected').removeClass('ready').removeClass('offline').removeClass('disconnected')
            }else{
              $('.'+camera._id).addClass('disconnected').removeClass('ready').removeClass('connected').removeClass('offline')
            }
        }else{
          $('.'+camera._id).addClass('offline').removeClass('disconnected').removeClass('ready').removeClass('connected')

        }
      })

    })

    $('button.reconnect-all').click(function(event){
      getAll('reconnect',function(err,camera,json){
        if(!err){
            if(json.reconnect == true){
              $('.'+camera._id).addClass('connected').removeClass('ready').removeClass('offline').removeClass('disconnected')
            }else{
              $('.'+camera._id).addClass('disconnected').removeClass('ready').removeClass('connected').removeClass('offline')
            }
        }else{
          $('.'+camera._id).addClass('offline').removeClass('disconnected').removeClass('ready').removeClass('connected')

        }
      })
    })
    //prep the system
    $('button.ready-all').click(function(event){
      getAll('ready',function(err,camera,json){
        if(!err){
          if(!json.hasOwnProperty('error')){
            if(json.status == true){
              $('.'+camera._id).addClass('ready').removeClass('disconnected').removeClass('offline')
            }else{
              $('.'+camera._id).addClass('disconnected').removeClass('ready').removeClass('connected').removeClass('offline')
            }
          }else{
              $('.'+camera._id).addClass('disconnected').removeClass('ready').removeClass('connected').removeClass('offline')
          }
        }else{
            $('.'+camera._id).addClass('offline').removeClass('disconnected').removeClass('ready').removeClass('connected')
        }
      })

      console.log('sending download init')
      $.getJSON('http://'+DOWNLOAD_IP+'/init').done(function(json){
        //alert('camera Init')
        console.log('')
        console.log('-------------------------------')
        console.log(json)
        console.log('------------------------------')
        console.log('')

        CURRENT_TAKE = json.take

      }).fail(function(jqxhr,status,error){
        var err = status+' '+error
        console.log('request failed: '+err)
        alert('cameras not inited')
      })


    })

    $('button.trigger-all').click(function(event){
      alert('trigger not implimented yet')

    })

    $('button.broadcast').click(function(event){
        $.getJSON('http://192.168.0.3:3000/broadcast').done(function(json){
          $('.ready').removeClass('ready')
        }).fail(function(jqxhr,status,error){
          var err = status+' '+error
          console.log('request failed: '+err)
          $('.ready').removeClass('ready')
          alert('broadcast not sent')
        })
    })

    $('button.reconnect').click(function(event){
      //console.log($(this))
      //hacking up a way to get the id...
      //super ugly
      var cameraParent =  $(this).parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      //console.log(_id)
      var camera = _.findWhere(cameras,{_id:_id})
      //console.log(camera)
      getSingle('reconnect',camera.address,function(err,json){
        if(!err){
            console.log(json)
            if(json.reconnect == true){
              $('.'+camera._id).addClass('connected').removeClass('disconnected').removeClass('ready').removeClass('offline')
            }else{
              $('.'+camera._id).addClass('disconnected').removeClass('connected').removeClass('ready').removeClass('offline')
            }
        }else{
          $('.'+camera._id).addClass('offline').removeClass('disconnected').removeClass('ready').removeClass('connected')

        }
      })

    })
    $('button.gitpull').click(function(event){
      console.log('gitpull')
      var cameraParent = $(this).parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      var camera = _.findWhere(cameras,{_id:_id})
      getSingle('gitpull',camera.address,function(err,json){
        console.log(json)
        if(!err){
          if(json.hasOwnProperty('error')){
            alert(json.error)
          }else{
            $('.'+camera._id).removeClass('disconnected').removeClass('connected').removeClass('ready').removeClass('offline')
          }
        }else{
          $('.'+camera._id).addClass('offline').removeClass('disconnected').removeClass('ready').removeClass('connected')
        }
      })

    })
    $('button.status').click(function(event){
      var cameraParent = $(this).parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      var camera = _.findWhere(cameras,{_id:_id})
      //console.log(camera)
      getSingle('status',camera.address,function(err,json){
        if(!err){
            if(json.status == true){
              $('.'+camera._id).addClass('connected').removeClass('disconnected').removeClass('ready').removeClass('offline')
              //console.log($('.'+camera._id))
              $('.'+camera._id+' .camera-settings').html(JSON.stringify(json))
            }else{
              $('.'+camera._id).addClass('disconnected').removeClass('connected').removeClass('ready').removeClass('offline')
            }
        }else{
          $('.'+camera._id).addClass('offline').removeClass('disconnected').removeClass('ready').removeClass('connected')

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
        console.log('sent shutdown')
      })
    })

    $('button.laser_local').click(function(event){
      var cameraParent = $(this).parent().parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      var camera = _.findWhere(cameras,{_id:_id})
      getSingle('laserlocal?set=1',camera.address,function(err,json){
        console.log(json)
      })
    })
    $('button.laser').click(function(event){
      //alert('laser')
      var cameraParent = $(this).parent().parent().parent().parent()
      var _id = $(cameraParent).data('mongoid')
      var camera = _.findWhere(cameras,{_id:_id})
      getSingle('laser?set=1',camera.address,function(err,json){
        console.log(json)
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
