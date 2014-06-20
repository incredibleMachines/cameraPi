var editPoints, prevPoints, nextPoints

var currentSettings, prevSettings, nextSettings

var currentCamera='001'
var totalCam=116

var outWidth=640
var outHeight=640

var current, prev, next, prevCamera, nextCamera

var bPrev=false
var bNext=false

// var DOWNLOAD_IP='192.168.0.2'
var DOWNLOAD_IP='localhost'

var rotate

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

	currentSettings=vars[current-1]

	// editPoints=vars[current-1].warp
	if(current!=1){
		prevSettings=vars[prev-1]
		// prevPoints=vars[prev-1].warp
	}
	if(current<totalCam-1){
		// nextPoints=vars[next-1].warp
		nextSettings=vars[next-1]
	}

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
			drawOutput()

		}//img.onload

		img.crossOrigin = ''
		img.src = "http://"+DOWNLOAD_IP+":3001/post/"+currentCamera+".jpg"

		if(current!=1){
				prevImg.onload = function(){
					prevCtx.clearRect(0,0,c.width, c.height)
					prevCtx.globalAlpha=.5
					prevCtx.rotate(prevSettings[rotate])
					prevCtx.drawImage(prevImg,prevSettings['x'],prevSettings['y'],prevSettings['w'],prevSettings['h'])
				}//onload
				prevImg.crossOrigin = ''
				prevImg.src="http://"+DOWNLOAD_IP+":3001/post/"+prevCamera+".jpg"
			}//current!=0

		if(current<totalCam-1){
			nextImg.onload = function(){
				nextCtx.clearRect(0,0,c.width, c.height)
				nextCtx.globalAlpha=.5
				nextCtx.rotate(nextSettings[rotate])
				nextCtx.drawImage(nextImg,nextSettings['x'],nextSettings['y'],nextSettings['w'],nextSettings['h'])
			}
			nextImg.crossOrigin=''
			nextImg.src="http://"+DOWNLOAD_IP+":3001/post/"+nextCamera+".jpg"
		}//curent!=totalCam

		$('#onion-skin').click(function(){
			if($('#before').is(':checked')) bPrev=true
			else bPrev=false
			if($('#after').is(':checked')) bNext=true
			else bNext=false
			drawOutput()

		})//.click

		$(document).keydown(function(event){

			var rotateModifier=Math.PI/180
			if(event.shiftKey==true){
				moveModifier=5
				rotateModifier*=5
			}
			else if(event.ctrlKey==true){
				moveModifier=0.1
				rotateModifier*=.1
			}
			else{
				moveModifier=1
			}

			if(event.which==38){
				event.preventDefault()
				// if(method=="psr"){

						adjustPosition(0,-moveModifier)



			}
			else if(event.which==39){
				event.preventDefault()
				// if(method=="psr"){
						adjustPosition(moveModifier,0)



			}
			else if(event.which==40){
				event.preventDefault()
				// if(method=="psr"){
						adjustPosition(0,moveModifier)



			}
			else if(event.which==37){
				event.preventDefault()
				adjustPosition(-moveModifier,0)

			}
			else if(event.which==90){
				adjustZoom(moveModifier)

			}
			else if(event.which==65){
				adjustZoom(-moveModifier)

			}

			else if(event.which==188){
				adjustRotate(rotateModifier)

			}
			else if(event.which==190){
				adjustRotate(-rotateModifier)

			}

		})//keydown

function update(){

}

function drawOutput(){


	var destC = document.getElementById('image-output');
	var destCtx = destC.getContext('2d');

	drawImage()

	destC.width = destC.width; // clear the canvas

	destCtx.drawImage(c, currentSettings['x'], currentSettings['y'],currentSettings['w'],currentSettings['h'],0,0,640,640)

	if(bPrev==true){
		destCtx.drawImage(prevC, prevSettings['x'], prevSettings['y'],prevSettings['w'],prevSettings['h'],0,0,640,640)
	}

	if(bNext==true){
		destCtx.drawImage(nextC, nextSettings['x'], nextSettings['y'],nextSettings['w'],nextSettings['h'],0,0,640,640)
	}

	destCtx.beginPath()
	destCtx.moveTo(320,0)
	destCtx.lineTo(320,640)
	destCtx.closePath()
	destCtx.strokeStyle = '#ff0000'
	destCtx.lineWidth=.5
	destCtx.stroke()

	destCtx.beginPath()
	destCtx.moveTo(0,320)
	destCtx.lineTo(640,320)
	destCtx.closePath()
	destCtx.strokeStyle = '#ff0000'
	destCtx.lineWidth=.5
	destCtx.stroke()

	$('#x').val(currentSettings['x'])
	$('#y').val(currentSettings['y'])
	$('#w').val(currentSettings['w'])
	$('#h').val(currentSettings['h'])
	$('#rotate').val(currentSettings['rotate'])

}

	function drawImage(){
			ctx.clearRect(0,0,c.width, c.height)
			// ctx.rotate(currentSettings['rotate'])
			console.log(currentSettings['rotate'])

			ctx.save()
			ctx.translate(c.width/2,c.height/2)
			ctx.rotate(currentSettings['rotate'])
			ctx.translate(-c.width/2,-c.height/2)
			ctx.drawImage(img,0,0,c.width,c.height)
			ctx.restore()



	}

	function adjustPosition (x, y){
		currentSettings["x"]=parseFloat(currentSettings["x"])+x
		currentSettings["y"]=parseFloat(currentSettings["y"])+y
		drawOutput()
	}

	function adjustZoom (amt){
		currentSettings["x"]=parseFloat(currentSettings["x"])-amt/2
		currentSettings["y"]=parseFloat(currentSettings["y"])-amt/2
		currentSettings["w"]=parseFloat(currentSettings["w"])+amt
		currentSettings["h"]=parseFloat(currentSettings["h"])+amt
		drawOutput()
	}

	function adjustRotate (angle){
		currentSettings["rotate"]+=angle
		drawOutput()
	}
})
