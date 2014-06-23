var editPoints, prevPoints, nextPoints

var currentSettings, prevSettings, prev2settings, nextSettings, next2settings

var currentCamera='001'
var totalCam=116

var outWidth=640
var outHeight=640

var flow=3

var current, prev, prev2, next, next2, prevCamera, nextCamera, prev2Camera, next2Camera

var bPrev=false
var bNext=false
var bCross=true
var flowMode=false

var allSettings

// var DOWNLOAD_IP='192.168.0.2'
//var DOWNLOAD_IP='localhost'

var DOWNLOAD_IP = document.location.hostname

var rotate

var loadPoints = function(vars,cur){

	allSettings = vars

	currentCamera=cur
	current=parseInt(currentCamera)
	console.log("current: "+current)
	next=current+1
	console.log("next: "+next)
	next2=current+2
	console.log("next2: "+next2)
	prev=current-1
	console.log("prev: "+prev)
	prev2=current-2
	console.log("prev2: "+prev2)

	if(next<10) nextCamera="00"+next.toString()
	else if (next<100) nextCamera="0"+next.toString()
	else nextCamera=next.toString()

	if(next2<10) next2Camera="00"+next2.toString()
	else if (next2<100) next2Camera="0"+next2.toString()
	else next2Camera=next2.toString()

	if(prev<10) prevCamera="00"+prev.toString()
	else if(prev<100) prevCamera="0"+prev.toString()
	else prevCamera=prev.toString()

	if(prev2<10) prev2Camera="00"+prev2.toString()
	else if(prev2<100) prev2Camera="0"+prev2.toString()
	else prev2Camera=prev2.toString()

	console.log(vars[prev2-1])
	console.log(vars[prev-1])
	console.log(vars[current-1])
	console.log(vars[next-1])
	console.log(vars[next2-1])

	currentSettings=vars[current-1]

	// editPoints=vars[current-1].warp
	if(current>1){
		prevSettings=vars[prev-1]
		// prevPoints=vars[prev-1].warp
	}
	if(current>2){
		prev2Settings=vars[prev2-1]
		// prevPoints=vars[prev-1].warp
	}
	if(current<totalCam-1){
		// nextPoints=vars[next-1].warp
		nextSettings=vars[next-1]
	}
	if(current<totalCam-2){
		// nextPoints=vars[next-1].warp
		next2Settings=vars[next2-1]
	}

}

$(document).ready(function(){

	// $('quad').hide

	var method="psr"

	// var mouseThreshold=20

	var imgPoints = [{x:0,y:0},{x:720,y:0},{x:720,y:480},{x:0,y:480} ]

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

	var prev2C=document.getElementById("image-previous2")
	var next2C=document.getElementById("image-next2")
	var prev2Ctx=prev2C.getContext("2d")
	var next2Ctx=next2C.getContext("2d")

	var img=new Image()
	var prevImg=new Image()
	var nextImg=new Image()
	var prev2Img=new Image()
	var next2Img=new Image()

	var destC = document.getElementById('image-output')
	var destCTX = destC.getContext('2d')

	var selected=null
		img.onload = function(){

			drawImage()
			drawOutput()

		}//img.onload

		img.crossOrigin = ''
		img.src = "http://"+DOWNLOAD_IP+":3001/calibration/"+currentCamera+".jpg"

		if(current>1){
				prevImg.onerror = function(){
					prev--
					if(prev<10) prevCamera="00"+prev
					else if(prev<100) prevCamera="0"+prev
					else prevCamera=prev

					prevSettings=allSettings[prev-1]
					console.log(prevCamera)
					prevImg.src="http://"+DOWNLOAD_IP+":3001/calibration/"+prevCamera+".jpg"

				}
				prevImg.onload = function(){

					prevCtx.drawImage(prevImg,0,0,720,480)
				}//onload
				prevImg.crossOrigin = ''
				prevImg.src="http://"+DOWNLOAD_IP+":3001/calibration/"+prevCamera+".jpg"
			}//current!=0

			if(current>2){
					prev2Img.onerror = function(){
						prev2--
						if(prev2<10) prev2Camera="00"+prev2
						else if(prev2<100) prev2Camera="0"+prev2
						else prev2Camera=prev2

								prev2Settings=allSettings[prev2-1]
								console.log(prev2Camera)
								prev2Img.src="http://"+DOWNLOAD_IP+":3001/calibration/"+prev2Camera+".jpg"

					}
					prev2Img.onload = function(){

						prev2Ctx.drawImage(prev2Img,0,0,720,480)
					}//onload
					prev2Img.crossOrigin = ''
					prev2Img.src="http://"+DOWNLOAD_IP+":3001/calibration/"+prev2Camera+".jpg"
				}//current!=0

		if(current<totalCam-1){
			nextImg.onerror=function(){
				next++
				if(next<10) nextCamera="00"+next.toString()
				else if(next<100) nextCamera="0"+next.toString()
				else nextCamera=next.toString()

					nextSettings=allSettings[next-1]
					nextImg.src="http://"+DOWNLOAD_IP+":3001/calibration/"+nextCamera+".jpg"

			}
			nextImg.onload = function(){

				nextCtx.drawImage(nextImg,0,0,720,480)
			}
			nextImg.crossOrigin=''
			nextImg.src="http://"+DOWNLOAD_IP+":3001/calibration/"+nextCamera+".jpg"
		}//curent!=totalCam


	if(current<totalCam-2){
		next2Img.onerror=function(){
			next2++
			if(next2<10) next2Camera="00"+next2.toString()
			else if(next2<100) next2Camera="0"+next2.toString()
			else next2Camera=next2.toString()

				next2Settings=allSettings[next2-1]
				next2Img.src="http://"+DOWNLOAD_IP+":3001/calibration/"+next2Camera+".jpg"

		}
		next2Img.onload = function(){
			next2Ctx.clearRect(0,0,c.width, c.height)
			next2Ctx.globalAlpha=.5

			next2Ctx.drawImage(next2Img,0,0,720,480)
		}
		next2Img.crossOrigin=''
		next2Img.src="http://"+DOWNLOAD_IP+":3001/calibration/"+next2Camera+".jpg"
	}//curent!=totalCam

	console.log(allSettings[prev2-1])
	console.log(allSettings[prev-1])
	console.log(allSettings[current-1])
	console.log(allSettings[next-1])
	console.log(allSettings[next2-1])

		$('#onion-skin').click(function(){
			if($('#before').is(':checked')) bPrev=true
			else bPrev=false
			if($('#after').is(':checked')) bNext=true
			else bNext=false
			drawOutput()
		})//.click


		$(document).keydown(function(event){
			console.log(event.which)

		if(flowMode==false){
			var rotateModifier=Math.PI/180

			if(event.shiftKey==true){
				moveModifier=5
				rotateModifier*=5
			}
			else if(event.altKey==true){
				moveModifier=0.1
				rotateModifier*=.1
			}
			else{
				moveModifier=1
			}

			if(event.which==40){
				event.preventDefault()
				// if(method=="psr"){

						adjustPosition(0,-moveModifier)
			}
		else if(event.which==70){
			event.preventDefault()
			flowMode=!flowMode
			drawOutput()
			if(flowMode==true){
				prev2C.width=prev2C.width
				prevC.width=prevC.width
				nextC.width=nextC.width
				next2C.width=next2C.width

				prev2Ctx.globalAlpha=1
				prevCtx.globalAlpha=1
				next2Ctx.globalAlpha=1
				nextCtx.globalAlpha=1







prev2Ctx.save()

				prev2Ctx.drawImage(prev2Img,0,0,720,480)
prev2Ctx.restore()

prevCtx.save()

				prevCtx.drawImage(prevImg,0,0,720,480)
prevCtx.restore()

nextCtx.save()

				nextCtx.drawImage(nextImg,0,0,720,480)
nextCtx.restore()

next2Ctx.save()

				next2Ctx.drawImage(next2Img,0,0,720,480)
next2Ctx.restore()
}

		else{
			prev2C.width=prev2C.width
			prevC.width=prevC.width
			nextC.width=nextC.width
			next2C.width=next2C.width

prev2Ctx.save()

				prev2Ctx.drawImage(prev2Img,0,0,720,480)
prev2Ctx.restore()

prevCtx.save()

				prevCtx.drawImage(prevImg,0,0,720,480)
prevCtx.restore()

nextCtx.save()

				nextCtx.drawImage(nextImg,0,0,720,480)
nextCtx.restore()

next2Ctx.save()

				next2Ctx.drawImage(next2Img,0,0,720,480)
next2Ctx.restore()

			prev2Ctx.globalAlpha=.5
			prevCtx.globalAlpha=.5
			next2Ctx.globalAlpha=.5
			nextCtx.globalAlpha=.5

			prev2Ctx.drawImage(prev2Img,0,0,720,480)
			prevCtx.drawImage(prevImg,0,0,720,480)
			next2Ctx.drawImage(next2Img,0,0,720,480)
			nextCtx.drawImage(nextImg,0,0,720,480)
		}
		}
		else if(event.which==71){
			event.preventDefault()
			bCross=!bCross
			drawOutput()
		}
			else if(event.which==37){
				event.preventDefault()
				// if(method=="psr"){
				adjustPosition(moveModifier,0)
			}
			else if(event.which==38){
				event.preventDefault()
				// if(method=="psr"){
						adjustPosition(0,moveModifier)

			}
			else if(event.which==39){
				event.preventDefault()
				adjustPosition(-moveModifier,0)

			}
			else if(event.which==90){
				adjustZoom(moveModifier)

			}
			else if(event.which==65){
				adjustZoom(-moveModifier)

			}

			else if(event.which==189){
				adjustRotate(rotateModifier)
			}

			else if(event.which==187){
				adjustRotate(-rotateModifier)
			}

		}

	else{



		if(event.which==39){
			event.preventDefault()
			flow++
		}

		else if(event.which==37){
			event.preventDefault()
			flow--
		}
		if(flow<1){
			flow=1
		}
		if(flow>5){
			flow=5
		}
		drawOutput()

	}

		})//keydown

function update(){

}

function drawOutput(){


	var destC = document.getElementById('image-output');
	var destCtx = destC.getContext('2d');

	// drawImage()

	destC.width = destC.width; // clear the canvas

	if(flowMode==false){

		destCtx.drawImage(c, 0,0,940,480)

		if(bPrev==true){
			destCtx.drawImage(prevC, 0,0,940,480)
		}

		if(bNext==true){
			destCtx.drawImage(nextC, 0,0,940,480)
		}
	}

else{
	if(flow==1) {
		destCtx.drawImage(prev2C, 0,0,940,480)
	}
	else if(flow==2) destCtx.drawImage(prevC,0,0,940,480)
	else if(flow==3) destCtx.drawImage(c, 0,0,940,480)
	else if(flow==4) destCtx.drawImage(nextC, 0,0,940,480)
	else if(flow==5) destCtx.drawImage(next2C, 0,0,940,480)

}

	if(bCross==true){
destCtx.beginPath()
destCtx.moveTo(c.width/2,0)
destCtx.lineTo(c.width/2,c.height)
destCtx.closePath()
destCtx.strokeStyle = '#ff0000'
destCtx.lineWidth=.5
destCtx.stroke()

destCtx.beginPath()
destCtx.moveTo(0,c.height/4)
destCtx.lineTo(c.width,c.height/4)
destCtx.closePath()
destCtx.strokeStyle = '#ff0000'
destCtx.lineWidth=.5
destCtx.stroke()
	}

	$('#x').val(currentSettings['x'])
	$('#y').val(currentSettings['y'])
	$('#w').val(currentSettings['w'])
	$('#h').val(currentSettings['h'])
	$('#rotate').val(currentSettings['rotate'])

}

	function drawImage(){
			ctx.clearRect(0,0,c.width, c.height)
			ctx.save()
			ctx.translate(c.width/2,c.height/2)
			ctx.rotate(parseFloat(currentSettings['rotate']))
			ctx.translate(-c.width/2,-c.height/2)
			ctx.drawImage(img,0,0,720,480)
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
		currentSettings["rotate"]=parseFloat(currentSettings['rotate'])+angle
		drawImage()
		drawOutput()
	}

	$('#trigger').submit(function(e){
		e.preventDefault()
		$.ajax({
		  url: $(this).attr('action'),
			data: $(this).serialize(),
			success:function(){
				location.reload()
			}
		});
	})
})
