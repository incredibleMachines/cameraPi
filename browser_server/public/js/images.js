var editPoints, prevPoints, nextPoints

var currentSettings, prevSettings, nextSettings

var currentCamera='001'
var totalCam=111

var outWidth=320
var outHeight=320

var current, prev, next, prevCamera, nextCamera

var bPrev=false
var bNext=false

// var DOWNLOAD_IP='192.168.0.2'
var DOWNLOAD_IP='localhost'

var loadPoints = function(vars,cur){

	currentCamera=cur
	current=parseInt(currentCamera)
	next=current+1
	prev=current-1

	if(next<10) nextCamera="00"+String(next)
	else if (next<100) nextCamera="0"+String(next)
	else nextCamera=String(next)

	if(prev<10) prevCamera="00"+String(prev)
	else if(prev<100) prevCamera="0"+String(prev)
	else prevCamera=String(prev)


	console.log("NEXT: "+nextCamera)
	console.log("CURRENT:"+parseInt(currentCamera))

	currentSettings=vars[current-1].calibration

	// editPoints=vars[current-1].warp
	if(current!=0){
		prevSettings=vars[prev-1].calibration
		// prevPoints=vars[prev-1].warp
	}
	if(current!=totalCam-1){
		// nextPoints=vars[next-1].warp
		nextSettings=vars[prev-1].calibration
	}

	console.log(editPoints)

}

$(document).ready(function(){

	// $('quad').hide

	var method="psr"

	// var mouseThreshold=20

	var imgPoints = [{x:0,y:0},{x:960,y:0},{x:960,y:640},{x:0,y:640} ]

		// $('#0X').attr("value",editPoints[0]["x"])
		// $('#0Y').attr("value",editPoints[0]["y"])
		// $('#1X').attr("value",editPoints[1]["x"])
		// $('#1Y').attr("value",editPoints[1]["y"])
		// $('#2X').attr("value",editPoints[2]["x"])
		// $('#2Y').attr("value",editPoints[2]["y"])
		// $('#3X').attr("value",editPoints[3]["x"])
		// $('#3Y').attr("value",editPoints[3]["y"])

	var c=document.getElementById("image-editor")
	var ctx=c.getContext("2d")

	var prevC=document.getElementById("image-previous")
	var nextC=document.getElementById("image-next")
	var prevCtx=prevC.getContext("2d")
	var nextCtx=nextC.getContext("2d")

	var img=new Image()
	var prevImg=new Image()
	var nextImg=new Image()

	var destC = document.getElementById('image-output')
	var destCTX = destC.getContext('2d')



	var selected=null
		img.onload = function(){

			drawImage()
			initTransform(c, prevC, nextC, editPoints, prevPoints, nextPoints)

		}

		img.crossOrigin = ''
		img.src = "http://"+DOWNLOAD_IP+":3001/post/"+currentCamera+".jpg"

		if(current!=0){
				prevImg.onload = function(){
					prevCtx.clearRect(0,0,c.width, c.height)
					prevCtx.globalAlpha=.5
					prevCtx.rotate(prevSettings[rotate])
					prevCtx.drawImage(prevImg,prevSettings['x'],prevSettings['y'],prevSettings['w'],prevSettings['h'])
				}
				prevImg.crossOrigin = ''
				prevImg.src="http://"+DOWNLOAD_IP+":3001/post/"+nextCamera+".jpg"
			}

		if(current!=totalCam){
			nextImg.onload = function(){
				nextCtx.clearRect(0,0,c.width, c.height)
				nextCtx.globalAlpha=.5
				nextCtx.rotate(nextSettings[rotate])
				nextCtx.drawImage(nextImg,nextSettings['x'],nextSettings['y'],nextSettings['w'],nextSettings['h'])
			}
			nextImg.crossOrigin=''
			nextImg.src="http://"+DOWNLOAD_IP+":3001/post/"+prevCamera+".jpg"
		}

		$('#onion-skin').click(function(){
			if($('#before').is(':checked')) bPrev=true
			else bPrev=false
			if($('#after').is(':checked')) bNext=true
			else bNext=false
			initTransform(c, prevC, nextC, editPoints, prevPoints, nextPoints)
		})

		$(document).keydown(function(event){


			if(event.shiftKey==true){
				moveModifier=5
			}
			else if(event.ctrlKeyx==true){
				moveModifier=0.1
			}
			else{
				moveModifier=1
			}

			if(event.which==38){
				event.preventDefault()
				// if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(0,-moveModifier,i)
					}
				// }
				// else
				// {
				// 	adjustPosition(0,-moveModifier,selected)
				// }
			}
			else if(event.which==39){
				event.preventDefault()
				// if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(moveModifier,0,i)
					}
				// }
				// else
				// {
				// 	adjustPosition(moveModifier,0,selected)
				// }
			}
			else if(event.which==40){
				event.preventDefault()
				// if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(0,moveModifier,i)
					}
				// }
				// else
				// {
				// 	adjustPosition(0,moveModifier,selected)
				// }
			}
			else if(event.which==37){
				event.preventDefault()
				// if(method=="psr"){
					for(var i=0; i<editPoints.length;i++){
						adjustPosition(-moveModifier,0,i)
					}
				// }
				// else
				// {
				// 	adjustPosition(-moveModifier,0,selected)
				// }
			}
			else if(event.which==90){
				adjustZoom(moveModifier)
			}
			else if(event.which==65){
				adjustZoom(-moveModifier)
			}

			else if(event.which==188){
				adjustRotate(-moveModifier/10)
			}
			else if(event.which==190){
				adjustRotate(moveModifier/10)
			}

			drawImage()

			$('rotate').attr("value",currentSettings['rotate'])
			$('x').attr("value",currentSettings['x'])
			$('y').attr("value",currentSettings['y'])
			$('h').attr("value",currentSettings['h'])
			$('w').attr("value",currentSettings['w'])

		})

function initTransform(c,prevC, nextC, editPoints,prevPoints,nextPoints){

	var trans = transformCanvas(c,currentSettings,true)
	var prevTrans, nextTrans

	if(bPrev==true){
		prevTrans=transformCanvas(prevC,prevSettings,false)
	}

	if(bNext==true){
		nextTrans=transformCanvas(nextC,nextSettings,false)
	}

	var destC = document.getElementById('image-output');
	var destCtx = destC.getContext('2d');

	destC.width = destC.width; // clear the canvas

	destCtx.drawImage(trans, outWidth, outHeight);

	if(bPrev==true){
		destCtx.drawImage(prevTrans,outWidth,outHeight)
	}

	if(bNext==true){
		destCtx.drawImage(nextTrans,outWidth,outHeight)
	}

	destCtx.beginPath()
	destCtx.moveTo(480,320)
	destCtx.lineTo(480,1280)
	destCtx.closePath()
	destCtx.strokeStyle = '#ff0000'
	destCtx.lineWidth=.5
	destCtx.stroke()

	destCtx.beginPath()
	destCtx.moveTo(320,480)
	destCtx.lineTo(640,480)
	destCtx.closePath()
	destCtx.strokeStyle = '#ff0000'
	destCtx.lineWidth=.5
	destCtx.stroke()

}

	function drawImage(){
			ctx.clearRect(0,0,c.width, c.height)
			ctx.rotate(currentSettings['rotate'])
			ctx.drawImage(img,imgPoints[0]["x"],imgPoints[0]["y"],imgPoints[2]["x"],imgPoints[2]["y"])

			ctx.beginPath()
			ctx.moveTo(currentSettings['x'],currentSettings['y'])
			ctx.lineTo(currentSettings['x']+currentSettings['w'],currentSettings['y'])
			ctx.lineTo(currentSettings['x']+currentSettings['w'],currentSettings['y']+currentSettings['h'])
			ctx.lineTo(currentSettings['x'],urrentSettings['y']+currentSettings['h'])
			ctx.lineTo(currentSettings['x'],currentSettings['y'])
			ctx.closePath()
			ctx.strokeStyle = '#ff0000'
			ctx.lineWidth=2
			ctx.stroke()

			ctx.beginPath()
			ctx.arc(currentSettings['x'],currentSettings['y'], 3, 0, 2 * Math.PI, false)
			ctx.closePath()

			ctx.fillStyle = '#ffff00'
			if(selected==0){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()

			ctx.beginPath()
			ctx.arc(currentSettings['x']+currentSettings['w'],currentSettings['y'], 3, 0, 2 * Math.PI, false)
			ctx.closePath()
			ctx.fillStyle = '#ffff00'
			if(selected==1){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()

			ctx.beginPath()
			ctx.arc(currentSettings['x']+currentSettings['w'],currentSettings['y']+currentSettings['h'], 3, 0, 2 * Math.PI, false)
			ctx.closePath()
			ctx.fillStyle = '#ffff00'
			if(selected==2){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()

			ctx.beginPath()
			ctx.arc(currentSettings['x'],urrentSettings['y']+currentSettings['h'], 3, 0, 2 * Math.PI, false)
			ctx.closePath()
			ctx.fillStyle = '#ffff00'
			if(selected==3){
				ctx.fillStyle='#00ff00'
			}
			ctx.fill()
	}

	function adjustPosition (x, y, which){
		currentSettings["x"]=parseFloat(currentSettings["x"])+x
		currentSettings["y"]=parseFloat(currentSettings["y"])+y
		initTransform(c, prevC, nextC, currentSettings, prevSettings, nextSettings)
	}

	function adjustZoom (amt){
		currentSettings["x"]=parseFloat(currentSettings["x"])+x/2
		currentSettings["y"]=parseFloat(currentSettings["y"])+y/2
		currentSettings["w"]=parseFloat(currentSettings["w"])+x/2
		currentSettings["h"]=parseFloat(currentSettings["h"])+y/2
		initTransform(c, prevC, nextC, currentSettings, prevSettings, nextSettings)
	}

	function adjustRotate (angle){
		currentSettings["rotate"]=parseFloat(currentSettings["rotate"])+angle
		initTransform(c, prevC, nextC, editPoints, prevPoints, nextPoints)
		initTransform(c, prevC, nextC, currentSettings, prevSettings, nextSettings)
	}
