function ControlController(cameras){
  console.log(cameras)

  var start = '', end= '';
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



  var socket = io.connect(document.location.hostname)

  // socket.on('data', function(data){
  //   //alert(JSON.stringify(data))
  // })

  //testing message sending back

  //   start = new Date().getTime()
  // console.log('start: '+start)
  //   setTimeout(function(){
  //     console.log('sending finish ')
  //     end = new Date().getTime()
  //     var time = end-start
  //     finish( take, participantCode, 'goal' ,time)
  //   },5000)

  socket.on('QRSCAN',function(data){
    console.log(JSON.stringify(data))

    STATE= 'QR_SCANNED'
    participantCode = data.participantCode
    firstName = data.firstName
    lastName = data.lastName
    take = data.take_id
    //change button states to get ready
    //$('.qr').parent().hide()
    //$('.check').parent().show()
    $('.controller').removeClass().addClass('controller').addClass('QR_SCANNED')
    $('.IDLE').hide()
    $('.QR_SCANNED').show()
    $('.firstName').html(firstName)
    $('.lastName').html(lastName)
    $('.code').html(participantCode)
    //change color state of page
    systemCheck()
  })


  //system check
  // $('.check').click(function(e){
  //   var connected_counter = 0;
  //   var disconnected_counter = 0;
  //   var error_counter = 0;
  //   console.log(cameras.length)
  //
  // })//end $('.check')

  $('.arm').click(function(){
    var ready_counter=0
    var error_counter=0
    var disconnect_counter=0
    getAll('arm?take_id='+take,function cb(err,camera,json){
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
        //TO DO SEND MESSAGE TO ADMIN PANEL
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
    start = new Date().getTime()

  })

  $('.kick').click(function(){
    //sendMessage('kick')
  })
  $('.miss').click(function(){
    $(".controller").removeClass().addClass('controller').addClass("IDLE")
    sendMessage('miss')
    $(".SYSTEM_ACTIVE").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')
  })
  $('.wiff').click(function(){
    $(".controller").removeClass().addClass('controller').addClass("IDLE")
    sendMessage('wiff')
    $(".SYSTEM_ACTIVE").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')
  })
  $('.goal').click(function(){
    $(".controller").removeClass().addClass('controller').addClass("IDLE")
    sendMessage('goal')
    $(".SYSTEM_ACTIVE").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')

  })

  $('.reset').click(function(){
    sendMessage('reset')
    //console.log('reset')
    $(".controller").removeClass().addClass('controller').addClass("IDLE")
    $(".SYSTEM_ACTIVE").hide()
    $(".SYSTEM_ARMED").hide()
    $(".SYSTEM_CHECKED").hide()
    $(".QR_SCANNED").hide()
    $(".IDLE").show()
    $('.firstName').html(' ')
    $('.lastName').html(' ')
    $('.code').html(' ')
  })
  $(".SYSTEM_ACTIVE .reset, .SYSTEM_ACTIVE .goal, .SYSTEM_ACTIVE .wiff, .SYSTEM_ACTIVE .miss, .SYSTEM_ACTIVE .kick").click(function(){
    end = new Date().getTime()
    var time = end-start
    var outcome = ''

    if($(this).hasClass('goal')){
      outcome = 'goal'
    }else if($(this).hasClass('reset') ){
      outcome = 'reset'
    }else if( $(this).hasClass('wiff') || $(this).hasClass('miss')  || $(this).hasClass('kick') ){
      outcome = 'miss'
    }
    console.log(outcome)
    console.log(time)
    console.log(take)
    console.log(participantCode)
    finish(take,participantCode,outcome,time)

  })
  function sendMessage(msg,data){
      socket.emit(msg,{timestamp: new Date().getTime()})
  }
  function setToActive(){
    $('.controller').removeClass().addClass('controller').addClass('SYSTEM_ACTIVE')
    $(".SYSTEM_ARMED").hide()
    $(".SYSTEM_ACTIVE").show()
  }
  function setToReady(){
    $('.controller').removeClass().addClass('controller').addClass('SYSTEM_ARMED')

    $(".SYSTEM_CHECKED").hide()
    $(".SYSTEM_ARMED").show()
    //$.getJSON('http://'++'')
  }
  function systemChecked(){
    $('.controller').removeClass().addClass('controller').addClass('SYSTEM_CHECKED')
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
  function systemCheck(){
    var error_counter = 0,
        connected_counter =0,
        disconnected_counter =0

    console.log('system checking')
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
          // if(confirm('System Error: '+error_counter+' cameras offline. Proceed?')){
          //   //alert('good to move forward')
          //   systemChecked(cb)
          // }else{
          //   alert('hold for tech.')
          //
          // }
          systemChecked()
          //TO DO NOTIFY BACK OF HOUSE OF ERROR COUNTER
        }else{

          //alert('good to move forward')
          systemChecked()
        }

      }

    })
  }



  function finish(_take,_participantCode, _outcome, _time){
    var timeoutTime = 60000 //180000 //three minutes //300000/ //five minutes
    console.log('Finish Queued.')
    console.log('Timeout: '+timeoutTime)
    socket.emit('finish',{take:_take, participant:_participantCode,outcome:_outcome,time:_time})
    // setTimeout(function(__take,__participantCode){
    //   console.log('Attempting Processing of Output')
    //   console.log(__take+' '+__participantCode)
    //   $.getJSON('http://'+PROCESSING_IP+':3002/?take='+__take+'&participant='+__participantCode).done(function(json){
    //     console.log('POSTED')
    //   }).fail(function(jqxhr,status,error){
    //     console.log('PROCESS ERROR')
    //   })
    // }(_take,_participantCode),timeoutTime)


  }
}
