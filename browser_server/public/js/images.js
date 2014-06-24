var currentSettings

var currentCamera='001'

var totalCam=81

var outWidth=640
var outHeight=640

var flow=3

var current, prev, prev2, next, next2, prevCamera, nextCamera, prev2Camera, next2Camera

var bPrev=false
var bNext=false
var bCross=true
var flowMode=false

var allSettings

var alphaVal=.5

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

	// console.log(vars[prev2-1])
	// console.log(vars[prev-1])
	// console.log(vars[current-1])
	// console.log(vars[next-1])
	// console.log(vars[next2-1])

	currentSettings=vars[current-1]

	console.log(vars[current-1])

}

$(document).ready(function(){


	var imgPoints = [{x:0,y:0},{x:960,y:0},{x:960,y:640},{x:0,y:640} ]


	var c=document.getElementById("image-editor")
	var ctx=c.getContext("2d")

	var img=new Image()
	var imgCrop=new Image()
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

		renderCrop()

		img.crossOrigin = ''
		img.src = "http://"+DOWNLOAD_IP+":3001/post/originals/"+currentCamera+".jpg"

		imgCrop.crossOrigin = ''
		imgCrop.src = "http://"+DOWNLOAD_IP+":3001/post/cropped/"+currentCamera+".jpg"

		if(current>1){
				prevImg.crossOrigin = ''
				prevImg.src="http://"+DOWNLOAD_IP+":3001/post/cropped/"+prevCamera+".jpg"
		}//current!=0

			if(current>2){
					prev2Img.crossOrigin = ''
					prev2Img.src="http://"+DOWNLOAD_IP+":3001/post/cropped/"+prev2Camera+".jpg"
				}//current!=0

		if(current<totalCam-1){
			nextImg.crossOrigin=''
			nextImg.src="http://"+DOWNLOAD_IP+":3001/post/cropped/"+nextCamera+".jpg"
		}//curent!=totalCam

	if(current<totalCam-2){
		next2Img.crossOrigin=''
		next2Img.src="http://"+DOWNLOAD_IP+":3001/post/cropped/"+next2Camera+".jpg"
	}//curent!=totalCam

		$('#onion-skin').click(function(){
			if($('#before').is(':checked')) bPrev=true
			else bPrev=false
			if($('#after').is(':checked')) bNext=true
			else bNext=false
				drawImage()
				drawOutput()
		})//.click


		$(document).keydown(function(event){
			console.log(event.which)

	if(event.which==13){
		event.preventDefault()
		console.log(currentSettings["x"])
		renderCrop()
	}

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

				alphaVal=1

// drawImage()
}

		else{
			alphaVal=.1
			drawFlow()


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
				if(event.metaKey==false){
				adjustRotate(rotateModifier)
			}
			}

			else if(event.which==187){
				if(event.metaKey==false){
				adjustRotate(-rotateModifier)
			}
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

	destC.width = destC.width; // clear the canvas

	if(flowMode==false){
		destCtx.globalAlpha=1

destCtx.drawImage(imgCrop,0,0,640,640)
destCtx.globalAlpha=.5
		if(bPrev==true){
			destCtx.drawImage(prevImg,0,0,640,640)
		}

		if(bNext==true){
			destCtx.drawImage(nextImg, 0,0,640,640)
		}

	}

else{
	if(flow==1) {
		destCtx.drawImage(prev2Img,0,0,640,640)
	}
	else if(flow==2) destCtx.drawImage(prevImg,0,0,640,640)
	else if(flow==3) destCtx.drawImage(imgCrop, 0,0,640,640)
	else if(flow==4) destCtx.drawImage(nextImg, 0,0,640,640)
	else if(flow==5) destCtx.drawImage(next2Img, 0,0,640,640)

}

	if(bCross==true){
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
			ctx.drawImage(img,0,0,960,640)
			ctx.restore()
	}

	function adjustPosition (x, y){
		currentSettings["x"]=parseFloat(currentSettings["x"])+x
		currentSettings["y"]=parseFloat(currentSettings["y"])+y
		// drawImage()
		renderCrop()
		drawOutput()
	}

	function adjustZoom (amt){
		currentSettings["x"]=parseFloat(currentSettings["x"])-amt/2
		currentSettings["y"]=parseFloat(currentSettings["y"])-amt/2
		currentSettings["w"]=parseFloat(currentSettings["w"])+amt
		currentSettings["h"]=parseFloat(currentSettings["h"])+amt
		renderCrop()
		drawOutput()
	}

	function adjustRotate (angle){
		currentSettings["rotate"]=parseFloat(currentSettings['rotate'])+angle
		renderCrop()
		drawOutput()
	}

	function renderCrop(){
		console.log("render-crop")
		$.ajax({
			type:"POST",
			url: '/render-cropped',
			data: {
				camera_id:currentCamera,
				rotate:currentSettings["rotate"],
				x:currentSettings["x"],
				y:currentSettings["y"],
				w:currentSettings["w"],
				h:currentSettings["h"]}
			}).done(function(){
				console.log("cropped!")
				imgCrop.onload = function() {
					drawOutput()
				}
				imgCrop.src = "http://"+DOWNLOAD_IP+":3001/post/cropped/"+currentCamera+".jpg"
		});
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
