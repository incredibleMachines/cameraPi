var editPoints 	
var currentCamera

var loadPoints = function(vars,cur){
	currentCamera=parseInt(cur)
	console.log("CURRENT:"+currentCamera)	
	editPoints=vars[currentCamera].warp
	
}

$(document).ready(function(){
	var method="psr"
	
	var mouseThreshold=20
	
	var imgPoints = [{x:0,y:0},{x:960,y:0},{x:960,y:640},{x:0,y:640} ]
/* 	var editPoints =  */
	
		$('#0X').attr("value",editPoints[0]["x"])
		$('#0Y').attr("value",editPoints[0]["y"])
		$('#1X').attr("value",editPoints[1]["x"])
		$('#1Y').attr("value",editPoints[1]["y"])
		$('#2X').attr("value",editPoints[2]["x"])
		$('#2Y').attr("value",editPoints[2]["y"])
		$('#3X').attr("value",editPoints[3]["x"])
		$('#3Y').attr("value",editPoints[3]["y"])
	
	var c=document.getElementById("image-editor")
	var ctx=c.getContext("2d")
	var img=new Image()	
	
	var selected=null
	
	
	
	$('#psr').click(function(){
		method="psr"
		console.log(method)
		$('#quad').prop('checked',false)
	})
	$('#quad').click(function(){
		method="quad"
		console.log(method)
		$('#psr').prop('checked',false);
	})
	
	
		img.onload = function(){

			drawImage()



		}
		
		img.src = "test_images/test_image.jpg"
	
		$(document).click(function(event){
		if(method=="quad"){
			var x=event.clientX-c.offsetLeft+$(window).scrollLeft()
			var y=event.clientY-c.offsetTop+$(window).scrollTop()
			var clicked=false
			for(var i=0; i<editPoints.length;i++){
				if(x>editPoints[i]["x"]-mouseThreshold&&x<editPoints[i]["x"]+mouseThreshold){
					if(y>editPoints[i]["y"]-mouseThreshold&&y<editPoints[i]["y"]+mouseThreshold){
						selected=i
						console.log("selected point: "+i)
						drawImage()
						clicked=true
					}
				}
			
			}
			if(clicked==false){
				selected=null
				drawImage()
			}
			}
		})

		$(document).keydown(function(event){
			console.log(editPoints)

			
			if(event.shiftKey==true){
				moveModifier=5
			}
			else if(event.ctrlKeyx==true){
				moveModifer=0.1
			}
			else{
				moveModifier=1
			}
		
			if(event.which==38){	
				event.preventDefault()
				if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(0,-moveModifier,i)
					}
				}
				else
				{
					adjustPosition(0,-moveModifier,selected)
				}
			}
			else if(event.which==39){
				event.preventDefault()
				if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(moveModifier,0,i)
					}
				}
				else
				{
					adjustPosition(moveModifier,0,selected)
				}
			}
			else if(event.which==40){	
				event.preventDefault()
				if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(0,moveModifier,i)
					}
				}
				else
				{
					adjustPosition(0,moveModifier,selected)
				}
			}
			else if(event.which==37){	
				event.preventDefault()
				if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(-moveModifier,0,i)
					}
				}
				else
				{
					adjustPosition(-moveModifier,0,selected)
				}
			}
			else if(event.which==90){
				adjustZoom(moveModifier)
			}
			else if(event.which==65){
				adjustZoom(-moveModifier)
			}
			
			else if(event.which==188){
				adjustRotate(-moveModifier)
			}
			else if(event.which==190){
				adjustRotate(moveModifier)
			}
			
			drawImage()
			$('#0X').attr("value",editPoints[0]["x"])
			$('#0Y').attr("value",editPoints[0]["y"])
			$('#1X').attr("value",editPoints[1]["x"])
			$('#1Y').attr("value",editPoints[1]["y"])
			$('#2X').attr("value",editPoints[2]["x"])
			$('#2Y').attr("value",editPoints[2]["y"])
			$('#3X').attr("value",editPoints[3]["x"])
			$('#3Y').attr("value",editPoints[3]["y"])
		})

	
	function drawImage(){
			ctx.clearRect(0,0,c.width, c.height)
			ctx.drawImage(img,imgPoints[0]["x"],imgPoints[0]["y"],imgPoints[2]["x"],imgPoints[2]["y"])

			ctx.beginPath()
			ctx.moveTo(editPoints[0]["x"],editPoints[0]["y"])
			ctx.lineTo(editPoints[1]["x"],editPoints[1]["y"])		
			ctx.lineTo(editPoints[2]["x"],editPoints[2]["y"])
			ctx.lineTo(editPoints[3]["x"],editPoints[3]["y"])
			ctx.lineTo(editPoints[0]["x"],editPoints[0]["y"])
			ctx.closePath()
			ctx.strokeStyle = '#ff0000'
			ctx.lineWidth=2
			ctx.stroke()

			ctx.beginPath()
			ctx.arc(editPoints[0]["x"],editPoints[0]["y"], 3, 0, 2 * Math.PI, false)
			ctx.closePath()

			ctx.fillStyle = '#ffff00'
			if(selected==0){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()
			
			ctx.beginPath()
			ctx.arc(editPoints[1]["x"],editPoints[1]["y"], 3, 0, 2 * Math.PI, false)
			ctx.closePath()
			ctx.fillStyle = '#ffff00'
			if(selected==1){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()
			
			ctx.beginPath()
			ctx.arc(editPoints[2]["x"],editPoints[2]["y"], 3, 0, 2 * Math.PI, false)
			ctx.closePath()
			ctx.fillStyle = '#ffff00'
			if(selected==2){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()
			
			ctx.beginPath()
			ctx.arc(editPoints[3]["x"],editPoints[3]["y"], 3, 0, 2 * Math.PI, false)
			ctx.closePath()
			ctx.fillStyle = '#ffff00'
			if(selected==3){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()
	}
	
	function adjustPosition (x, y, which){
		editPoints[which]["x"]=parseFloat(editPoints[which]["x"])+x
		editPoints[which]["y"]=parseFloat(editPoints[which]["y"])+y
	}	
	
	function adjustZoom (amt){
		editPoints[0]["x"]=parseFloat(editPoints[0]["x"])-amt
		editPoints[0]["y"]=parseFloat(editPoints[0]["y"])-amt
		editPoints[1]["x"]=parseFloat(editPoints[1]["x"])+amt
		editPoints[1]["y"]=parseFloat(editPoints[1]["y"])-amt
		editPoints[2]["x"]=parseFloat(editPoints[2]["x"])+amt
		editPoints[2]["y"]=parseFloat(editPoints[2]["y"])+amt
		editPoints[3]["x"]=parseFloat(editPoints[3]["x"])-amt
		editPoints[3]["y"]=parseFloat(editPoints[3]["y"])+amt
	}
	
	function adjustRotate (angle){
		var arr=[[editPoints[0]["x"],editPoints[0]["y"]],[editPoints[1]["x"],editPoints[1]["y"]],[editPoints[2]["x"],editPoints[2]["y"]],[editPoints[3]["x"],editPoints[3]["y"]]]
		
		var x = arr.map(function(a){ return a[0] });
	    var y = arr.map(function(a){ return a[1] });
	    var minX = Math.min.apply(null, x);
	    var maxX = Math.max.apply(null, x);
	    var minY = Math.min.apply(null, y);
	    var maxY = Math.max.apply(null, y);
	    var centerX=(minX + maxX)/2
	    var centerY= (minY + maxY)/2
	    
		var rotate=rotate_point(editPoints[0]["x"],editPoints[0]["y"],centerX,centerY,angle)
		editPoints[0]["x"]=rotate.x
		editPoints[0]["y"]=rotate.y
		rotate=rotate_point(editPoints[1]["x"],editPoints[1]["y"],centerX,centerY,angle)
		editPoints[1]["x"]=rotate.x
		editPoints[1]["y"]=rotate.y
		var rotate=rotate_point(editPoints[2]["x"],editPoints[2]["y"],centerX,centerY,angle)
		editPoints[2]["x"]=rotate.x
		editPoints[2]["y"]=rotate.y
		var rotate=rotate_point(editPoints[3]["x"],editPoints[3]["y"],centerX,centerY,angle)
		editPoints[3]["x"]=rotate.x
		editPoints[3]["y"]=rotate.y
	}
	
	function rotate_point(pointX, pointY, originX, originY, angle) {
	    angle = angle * Math.PI / 180.0;
	    return {
	        x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
	        y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
	    };
	}
		

})


