function SettingsController(cameras){

    $('form').submit(function(e){

      e.preventDefault()
      var string = $(this).serialize()

      if($('.camera').val()==='all'){
        cameras.forEach(function(camera){
        console.log('http://'+camera.address+':8080/set?'+string)
        $.getJSON('http://'+camera.address+':8080/set?'+string).done(function(json){
          console.log('success')
        }).fail(function(jqxhr,status,error){
          console.log('fail')
        })

        })
      }else{

        //alert($('.camera').val())

        $.getJSON('http://'+$('.camera').val()+':8080/set?'+string).done(function(json){
          console.log('success')
        }).fail(function(jqxhr,status,error){
          console.log('fail')
        })
      }


    })

}
