function ControlController(cameras){
  console.log(cameras)
  //system IPS
  var BROWSER_IP = '192.168.0.2:3000',
      DOWNLOAD_IP = '192.168.0.2:3001',
      PROCESSING_IP = '192.168.0.5',

      TRIGGER_IP ='192.168.0.199' //stu 192.168.0.199

  var IO_PORTS = ':3000'

  //GENERAL STATES OF OPERATION
  //QR_SCANNED, SYSTEM_READY, SYSTEM_ARMED, SYSTEM_ACTIVE, SYSTEM_IDLE, GO
  var take,
      participantCode,
      firstName,
      lastName,
      STATE = "IDLE"



  var socket = io.connect(BROWSER_IP)

  socket.on('data', function(data){
    //alert(JSON.stringify(data))
  })

  socket.on('QRSCAN',function(data){
    console.log(JSON.stringify(data))

    STATE= 'QR_SCANNED'
    participantCode = data.participantCode
    firstName = data.firstName
    lastName = data.lastName

    //change button states to get ready
    //$('.qr').parent().hide()
    //$('.check').parent().show()
    $('.IDLE').hide()
    $('.QR_SCANNED').show()
    $('.firstName').html(firstName)
    $('.lastName').html(lastName)
    $('.code').html(participantCode)
    //change color state of page
  })
  //system check
  $('.check').click(function(e){
    var connected_counter = 0;
    var disconnected_counter = 0;
    var error_counter = 0;
    console.log(cameras.length)
    getAll('reconnect',function(err,camera,json){

      if(err){
        error_counter++;
        console.log('error address: '+camera.address)
        console.log('error camera_id:'+camera.camera_id)
      }else{

        if(json.reconnect == true){
          connected_counter++

        }else{
          disconnected_counter++
        }

      }
      console.log(error_counter+connected_counter+disconnected_counter)
      console.log(cameras.length)
      if(error_counter+connected_counter+disconnected_counter == cameras.length){
        console.log('error count = '+ error_counter)
        console.log('disconnect Count = '+disconnected_counter)
        console.log('connected Count = '+ connected_counter)

        if(error_counter > 0 ){
          if(confirm('System Error: '+error_counter+' cameras offline. Proceed?')){
            //alert('good to move forward')
            systemChecked()
          }else{
            alert('hold for tech.')

          }
        }else{

          //alert('good to move forward')
          systemChecked()
        }

      }

    })
  })//end $('.check')

  $('.arm').click(function(){
    var ready_counter=0
    var error_counter=0
    var disconnect_counter=0
    getAll('ready',function cb(err,camera,json){
      if(!err){
        if(json.status == true){
          ready_counter++
        }else{
          disconnect_counter++
        }
      }else{
        error_counter ++
      }

      if(ready_counter+error_counter+disconnect_counter == cameras.length){
        if(confirm('Camera\'s Armed:  \nReady Count:'+ready_counter+'\nDisconnected: '+disconnect_counter+'\nError Count: '+error_counter+'\nWould You Like to Proceed.')){
          setToReady()
        }else{
          getAll('ready',cb)
        }
      }
    })


  })

  $('.go').click(function(){
    sendMessage('go')
    setToActive()

  })

  $('.kick').click(function(){
    sendMessage('kick')
  })
  $('.miss').click(function(){
    sendMessage('miss')
    $(".SYSTEM_ACTIVE").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')
  })
  $('.wiff').click(function(){
    sendMessage('wiff')
    $(".SYSTEM_ACTIVE").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')
  })
  $('.goal').click(function(){
    sendMessage('goal')
    $(".SYSTEM_ACTIVE").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')

  })

  $('.reset').click(function(){
    sendMessage('reset')
    $(".SYSTEM_ACTIVE").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')
  })

  function sendMessage(msg){
    socket.emit(msg,{timestamp: new Date().getTime()})
  }
  function setToActive(){
    $(".SYSTEM_ARMED").hide()
    $(".SYSTEM_ACTIVE").show()
  }
  function setToReady(){
    $(".SYSTEM_CHECKED").hide()
    $(".SYSTEM_ARMED").show()
    //$.getJSON('http://'++'')
  }
  function systemChecked(){
      $('.QR_SCANNED').hide()
      $('.SYSTEM_CHECKED').show()
      //STATE = 'SYSTEM_ARMED'
  }
  function getAll(type, cb){
    //a function to get all camera status' reconnects etc
    //must pass function type parameter to get data
    //console.log('getting Json')
    $(cameras).each(function(i,camera){
      //console.log(camera)
      var url ='http://'+camera.address+':8080/'+type
      //console.log(url)
      $.ajax({
        dataType: "json",
        url: url,
        timeout:15000,
        success: function(json){
          console.log(json)
          cb(null,camera,json)
        },
        error: function(jqxhr,status,error){
          var err = status+' '+error
          console.log('request failed: '+err)
          cb(err,camera,null)
          //$('.'+camera._id).addClass('offline')
        }
      })
      // $.getJSON(url).done(function(json){
      //   console.log(json)
      //   cb(null,camera,json)
      // }).fail(function(jqxhr,status,error){
      //   var err = status+' '+error
      //   console.log('request failed: '+err)
      //   cb(err,camera,null)
      //   //$('.'+camera._id).addClass('offline')
      // })

    })

  }
}
