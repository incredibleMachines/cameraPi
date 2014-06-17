var editPoints, prevPoints, nextPoints
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
	editPoints=vars[current-1].warp
	if(current!=0){
		prevPoints=vars[prev-1].warp
	}
	if(current!=totalCam-1){
		nextPoints=vars[next-1].warp
	}



	console.log(editPoints)

}

$(document).ready(function(){

	var method="psr"

	var mouseThreshold=20

	var imgPoints = [{x:0,y:0},{x:960,y:0},{x:960,y:640},{x:0,y:640} ]

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
			initTransform(c, prevC, nextC, editPoints, prevPoints, nextPoints)

		}

		img.crossOrigin = ''
		img.src = "http://"+DOWNLOAD_IP+":3001/post/"+currentCamera+".jpg"

		if(current!=0){
				prevImg.onload = function(){
					prevCtx.clearRect(0,0,c.width, c.height)
					prevCtx.globalAlpha=.5
					prevCtx.drawImage(prevImg,imgPoints[0]["x"],imgPoints[0]["y"],imgPoints[2]["x"],imgPoints[2]["y"])
				}
				prevImg.crossOrigin = ''
				prevImg.src="http://"+DOWNLOAD_IP+":3001/post/"+nextCamera+".jpg"
			}

		if(current!=totalCam){
			nextImg.onload = function(){
				nextCtx.clearRect(0,0,c.width, c.height)
				nextCtx.globalAlpha=.5
				nextCtx.drawImage(nextImg,imgPoints[0]["x"],imgPoints[0]["y"],imgPoints[2]["x"],imgPoints[2]["y"])
			}
			nextImg.crossOrigin=''
			nextImg.src="http://"+DOWNLOAD_IP+":3001/post/"+prevCamera+".jpg"
		}


		$(document).click(function(event){
		if(method=="quad"){
			var x=event.clientX-c.offsetLeft+$(window).scrollLeft()
			var y=event.clientY-c.offsetTop+$(window).scrollTop()
			var clicked=false
			for(var i=0; i<editPoints.length;i++){
				if(y<0&&x>c.width/2) {
					selected=1
					drawImage()
					clicked=true
				}
				else if(y<0&&x<c.width/2) {
				 selected=0
				drawImage()
				clicked=true
				}
				else if(y>c.height&&x<c.width/2) {
					selected=3
					drawImage()
					clicked=true
				}
				else if(y>c.height&&x>c.width/2) {
					selected=2
					drawImage()
				clicked=true
				}
				else if(x>editPoints[i]["x"]-mouseThreshold&&x<editPoints[i]["x"]+mouseThreshold){
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
				adjustRotate(-moveModifier/10)
			}
			else if(event.which==190){
				adjustRotate(moveModifier/10)
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

function initTransform(c,prevC, nextC, editPoints,prevPoints,nextPoints){

	var trans = transformCanvas(c,editPoints,true)
	var prevTrans, nextTrans

	if(bPrev==true){
		prevTrans=transformCanvas(prevC,prevPoints,false)
	}

	if(bNext==true){
		nextTrans=transformCanvas(nextC,nextPoints,false)
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

function transformCanvas(c,editPoints,bCurrent) {


	var p1 = {x:parseFloat(editPoints[0]["x"]),y:parseFloat(editPoints[0]["y"])} // upper left corner
	var p2 = {x:parseFloat(editPoints[3]["x"]),y:parseFloat(editPoints[3]["y"])} // lower left corner
	var p3 = {x:parseFloat(editPoints[2]["x"]),y:parseFloat(editPoints[2]["y"])} // lower right corner
	var p4 = {x:parseFloat(editPoints[1]["x"]),y:parseFloat(editPoints[1]["y"])} // upper right corner

	var q1 = {x: 0, y: 0} // upper left corner
	var q2 = {x: 0, y: outHeight}; // lower left corner
	var q3 = {x: outWidth, y: outHeight}; // lower right corner
	var q4 = {x: outWidth, y: 0}; // upper right corner

	//////////////////////////////////////////////////////////
	// get the dimensions of the transformed image
	var min = {};
	var max = {};

	min.x = Math.min(q1.x, q2.x, q3.x, q4.x);
	min.y = Math.min(q1.y, q2.y, q3.y, q4.y);
	max.x = Math.max(q1.x, q2.x, q3.x, q4.x);
	max.y = Math.max(q1.y, q2.y, q3.y, q4.y);
	//alert('min.x: '+min.x+'\nmin.y: '+min.y+'\nmax.x: '+max.x+'\nmax.y: '+max.y)

	var offsetX = -Math.floor(min.x);
	var offsetY = -Math.floor(min.y);
	//alert('offset\n'+offsetX+'   '+offsetY)

	var destWidth = Math.ceil(Math.abs(max.x - min.x));
	var destHeight = Math.ceil(Math.abs(max.y - min.y));

	var destArea = destWidth*destHeight;
	// if (destArea > 1e5) {
	// 	alert('Warning: Transformation is too big: '+destWidth+'x'+destHeight+', Area: '+destArea);
	// 	return -1;
	// }
	//////////////////////////////////////////////////////////
	// calculate the perspective transformation matrix

	// the order of the points does not matter as long as it is the same in both calculateMatrix() calls
	var ps = adjoint33(calculateMatrix(p1, p2, p3, p4));
	var sq = calculateMatrix(q1, q2, q3, q4);


	var mTranslation = [[1, 0, offsetX], [0, 1, offsetY], [0, 0, 1]];
	transpose33(mTranslation);

	var mPerspective = matrix33();

	mult33(ps, sq, mPerspective);

	var fw_trafo = matrix33();
	mult33(mPerspective, mTranslation, fw_trafo);

	var bw_trafo = adjoint33(fw_trafo);

	// displayMatrix(bw_trafo, 'matrixdump');

	//////////////////////////////////////////////////////////
	// convert the imagedata arrays of src and dest into a two-dimensional matrix

	// create two-dimensional array for storing the destination data
	var destPixelData = new Array(destWidth);
	for (var x=0; x<destWidth; x++) {
		destPixelData[x] = new Array(destHeight);
	}

	// create two-dimensional array for storing the source data
	var srcCtx = c.getContext('2d');
	srcData = srcCtx.getImageData(0, 0, c.width, c.height);

	var srcPixelData = new Array(srcData.width);
	for (var x=0; x<srcData.width; x++) {
		srcPixelData[x] = new Array(srcData.height);
	}

	// filling the source array
	var i = 0;
	for (var y=0; y<srcData.height; y++) {
		for (var x=0; x<srcData.width; x++) {
			if(bCurrent==false){
				var brightness = 0.34 * srcData.data[i] + 0.5 * srcData.data[i + 1] + 0.16 * srcData.data[i + 2];
				i+=3
				srcPixelData[x][y] = {
					r: brightness,
					g: brightness,
					b: brightness,
					a: srcData.data[i++]
				};
			}
			else{
				srcPixelData[x][y] = {
					r: srcData.data[i++],
					g: srcData.data[i++],
					b: srcData.data[i++],
					a: srcData.data[i++]
				};
			}
		}
	}
	// append width and height for later use
	srcPixelData[srcPixelData.length] = srcData.width;
	srcPixelData[srcPixelData.length] = srcData.height;

	var destCanvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
	destCanvas.width = destWidth;
	destCanvas.height = destHeight;
	var destCtx = destCanvas.getContext('2d');

	destCtx.beginPath();
	destCtx.moveTo(q1.x+offsetX-1, q1.y+offsetY-1);
	destCtx.lineTo(q2.x+offsetX-1, q2.y+offsetY+1);
	destCtx.lineTo(q3.x+offsetX+1, q3.y+offsetY+1);
	destCtx.lineTo(q4.x+offsetX+1, q4.y+offsetY-1);
	destCtx.closePath();
	//destCtx.strokeStyle = 'green';
	//destCtx.stroke();

	// loop over to-be-warped image and apply the transformation
	for (var x=0; x<destWidth; x++) {
		for (var y=0; y<destHeight; y++) {
			// if dest pixel is not inside the to-be-warped area, skip the transformation and assign transparent black
				var srcCoord = applyTrafo(x, y, bw_trafo);
					destPixelData[x][y] = interpolateNN(srcCoord, srcPixelData)
		}
	}


	var destData = destCtx.createImageData(destCanvas.width, destCanvas.height);

	// write the data back to the imagedata array
	var i = 0;
	for (var y=0; y<destHeight; y++) {
		for (var x=0; x<destWidth; x++) {

			destData.data[i++] = destPixelData[x][y].r;
			destData.data[i++] = destPixelData[x][y].g;
			destData.data[i++] = destPixelData[x][y].b;
			destData.data[i++] = destPixelData[x][y].a;
		}
	}

	destCtx.putImageData(destData, 0, 0);

	return destCanvas;
}






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
		initTransform(c, prevC, nextC, editPoints, prevPoints, nextPoints)
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
		initTransform(c, prevC, nextC, editPoints, prevPoints, nextPoints)
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
		initTransform(c, prevC, nextC, editPoints, prevPoints, nextPoints)
	}

	function rotate_point(pointX, pointY, originX, originY, angle) {
	    angle = angle * Math.PI / 180.0;
	    return {
	        x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
	        y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
	    };
	}

	function interpolateNN(srcCoord, srcPixelData) {
	var w = srcPixelData[srcPixelData.length-2];
	var h = srcPixelData[srcPixelData.length-1];

	// set the dest pixel to transparent black if it is outside the source area
	if (srcCoord.x < 0 || srcCoord.x > w-1 || srcCoord.y < 0 || srcCoord.y > h-1) {
		return {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		};
	}

	var x0 = Math.round(srcCoord.x);
	var y0 = Math.round(srcCoord.y);

	return srcPixelData[x0][y0];
}

function interpolateBL(srcCoord, srcPixelData) {
	var w = srcPixelData[srcPixelData.length-2];
	var h = srcPixelData[srcPixelData.length-1];

	var x0 = Math.floor(srcCoord.x);
	var x1 = x0+1;
	var y0 = Math.floor(srcCoord.y);
	var y1 = y0+1;

	// set the dest pixel to transparent black if it is outside the source area
	if (x0 < -1 || x1 > w || y0 < -1 || y1 > h) {
		return {
			r: 0,
			g: 0,
			b: 0,
			a: 0
		};
	}

	var f00 = (x1-srcCoord.x)*(y1-srcCoord.y);
	var f10 = (srcCoord.x-x0)*(y1-srcCoord.y);
	var f01 = (x1-srcCoord.x)*(srcCoord.y-y0);
	var f11 = (srcCoord.x-x0)*(srcCoord.y-y0);

	var alpha = [[-1, -1], [-1, -1]];

	if (x0 < 0) {
		x0 = 0;
		alpha[0][0] = 0;
		alpha[0][1] = 0;
	}

	if (y0 < 0) {
		y0 = 0;
		alpha[0][0] = 0;
		alpha[1][0] = 0;
	}

	if (x1 > w-1) {
		x1 = w-1;
		alpha[1][0] = 0;
		alpha[1][1] = 0;
	}

	if (y1 > h-1) {
		y1 = h-1;
		alpha[0][1] = 0;
		alpha[1][1] = 0;
	}


	//alert('srcx: '+srcCoord.x+'   srcy: '+srcCoord.y)
	//alert('x0: '+x0+'   y0: '+y0)

	// if alpha[x][x] has not been modified, then the pixel exists --> set alpha
	if (alpha[0][0] == -1) alpha[0][0] = srcPixelData[x0][y0].a;
	if (alpha[1][0] == -1) alpha[1][0] = srcPixelData[x1][y0].a;
	if (alpha[0][1] == -1) alpha[0][1] = srcPixelData[x0][y1].a;
	if (alpha[1][1] == -1) alpha[1][1] = srcPixelData[x1][y1].a;

	var pixel = {
		r: Math.round(srcPixelData[x0][y0].r*f00 + srcPixelData[x1][y0].r*f10 + srcPixelData[x0][y1].r*f01 + srcPixelData[x1][y1].r*f11),
		g: Math.round(srcPixelData[x0][y0].g*f00 + srcPixelData[x1][y0].g*f10 + srcPixelData[x0][y1].g*f01 + srcPixelData[x1][y1].g*f11),
		b: Math.round(srcPixelData[x0][y0].b*f00 + srcPixelData[x1][y0].b*f10 + srcPixelData[x0][y1].b*f01 + srcPixelData[x1][y1].b*f11),
		a: Math.round(alpha[0][0]*f00 + alpha[1][0]*f10 + alpha[0][1]*f01 + alpha[1][1]*f11)
	}

	if (pixel.r < 0) pixel.r = 0;
	if (pixel.g < 0) pixel.g = 0;
	if (pixel.b < 0) pixel.b = 0;
	if (pixel.a < 0) pixel.a = 0;

	if (pixel.r > 255) pixel.r = 255;
	if (pixel.g > 255) pixel.g = 255;
	if (pixel.b > 255) pixel.b = 255;
	if (pixel.a > 255) pixel.a = 255;

	return pixel;
}

function applyTrafo(x, y, trafo) {
	var w = trafo[0][2]*x + trafo[1][2]*y + trafo[2][2];
	if (w == 0) w = 1;

	return {x: (trafo[0][0]*x + trafo[1][0]*y + trafo[2][0])/w,
			y: (trafo[0][1]*x + trafo[1][1]*y + trafo[2][1])/w};
}

function mult33(m1, m2, result) {
	for (var i=0; i<3; i++) {
		for (var j=0; j<3; j++) {
			for (var k=0; k<3; k++) {
				result[i][j] += m1[i][k]*m2[k][j];
			}
		}
	}
}

function det22(m11, m12, m21, m22) {
	/*
	m11  m12
	m21  m22
	*/
	return m11*m22 - m12*m21;
}

function transpose33(matrix) {
	tmp = matrix[0][1];
	matrix[0][1] = matrix[1][0];
	matrix[1][0] = tmp;

	tmp = matrix[0][2];
	matrix[0][2] = matrix[2][0];
	matrix[2][0] = tmp;

	tmp = matrix[1][2];
	matrix[1][2] = matrix[2][1];
	matrix[2][1] = tmp;
}

function calculateMatrix(p0, p1, p2, p3) {
	/*
	a	d	g
	b	e	h
	c	f	i

	i = 1
	*/
	var a, b, c, d, e, f, g, h;


	var sx = p0.x - p1.x + p2.x - p3.x;
	var sy = p0.y - p1.y + p2.y - p3.y;

	if (sx == 0 && sy == 0) {
		a = p1.x - p0.x;
		b = p2.x - p1.x;
		c = p0.x;
		d = p1.y - p0.y;
		e = p2.y - p1.y;
		f = p0.y;
		g = 0;
		h = 0;
	} else {
		var dx1 = p1.x - p2.x;
		var dx2 = p3.x - p2.x;
		var dy1 = p1.y - p2.y;
		var dy2 = p3.y - p2.y;

		var det = det22(dx1, dx2, dy1, dy2);

		if (det == 0) {
			alert('det=0');
			return;
		}

		g = det22(sx, dx2, sy, dy2)/det;
		h = det22(dx1, sx, dy1, sy)/det;

		a = p1.x - p0.x + g*p1.x;
		b = p3.x - p0.x + h*p3.x;
		c = p0.x;
		d = p1.y - p0.y + g*p1.y;
		e = p3.y - p0.y + h*p3.y;
		f = p0.y;
	}

	var out = [[a, d, g], [b, e, h], [c, f, 1]];
	//transpose33(out)

	return out;
}

function matrix33() {
	return [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
}

function det33(matrix) {
	a1 = matrix[0][0]*matrix[1][1]*matrix[2][2];
	a2 = matrix[1][0]*matrix[2][1]*matrix[0][2];
	a3 = matrix[2][0]*matrix[0][1]*matrix[1][2];

	s1 = matrix[0][0]*matrix[2][1]*matrix[1][2];
	s2 = matrix[1][0]*matrix[0][1]*matrix[2][2];
	s3 = matrix[2][0]*matrix[1][1]*matrix[0][2];
	return  a1+a2+a3-s1-s2-s3;
}

function adjoint33(matrix) {
	/* using homogeneous coordinates, the adjoint can be used instead of the inverse of a matrix
	[[a, b, c], [d, e, f], [g, h, i]]
	m11 = e*i - h*f;
	m12 = c*h - b*i;
	m13 = b*f - c*e;

	m21 = f*g - d*i;
	m22 = a*i - c*g;
	m23 = c*d - a*f;

	m31 = d*h - e*g;
	m32 = b*g - a*h;
	m33 = a*e - b*d;
	*/



	m11 = matrix[1][1]*matrix[2][2] - matrix[2][1]*matrix[1][2];
	m12 = matrix[0][2]*matrix[2][1] - matrix[0][1]*matrix[2][2];
	m13 = matrix[0][1]*matrix[1][2] - matrix[0][2]*matrix[1][1];

	m21 = matrix[1][2]*matrix[2][0] - matrix[1][0]*matrix[2][2];
	m22 = matrix[0][0]*matrix[2][2] - matrix[0][2]*matrix[2][0];
	m23 = matrix[0][2]*matrix[1][0] - matrix[0][0]*matrix[1][2];

	m31 = matrix[1][0]*matrix[2][1] - matrix[1][1]*matrix[2][0];
	m32 = matrix[0][1]*matrix[2][0] - matrix[0][0]*matrix[2][1];
	m33 = matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0];



	return [[m11, m12, m13], [m21, m22, m23], [m31, m32, m33]];
}

function matrdump(trafo) {
	alert((trafo[0][0]/trafo[2][2]).toFixed(3)+'    '+(trafo[0][1]/trafo[2][2]).toFixed(3)+'    '+(trafo[0][2]/trafo[2][2]).toFixed(3)+'\n'+(trafo[1][0]/trafo[2][2])
.toFixed(3)+'    '+(trafo[1][1]/trafo[2][2]).toFixed(3)+'    '+(trafo[1][2]/trafo[2][2]).toFixed(3)+'\n'+(trafo[2][0]/trafo[2][2]).toFixed(3)+'    '+(trafo[2][1]/trafo[2][2]).toFixed(3)+'    '+(trafo[2][2]/trafo[2][2]).toFixed(3))
}

function displayMatrix(matrix, table) {
	var td = document.getElementById(table).getElementsByTagName('td');

	td[0].innerHTML = (matrix[0][0]/matrix[2][2]).toFixed(4);
	td[1].innerHTML = (matrix[1][0]/matrix[2][2]).toFixed(4);
	td[2].innerHTML = (matrix[2][0]/matrix[2][2]).toFixed(4);
	td[3].innerHTML = (matrix[0][1]/matrix[2][2]).toFixed(4);
	td[4].innerHTML = (matrix[1][1]/matrix[2][2]).toFixed(4);
	td[5].innerHTML = (matrix[2][1]/matrix[2][2]).toFixed(4);
	td[6].innerHTML = (matrix[0][2]/matrix[2][2]).toFixed(4);
	td[7].innerHTML = (matrix[1][2]/matrix[2][2]).toFixed(4);
	td[8].innerHTML = (matrix[2][2]/matrix[2][2]).toFixed(4);
}


})
