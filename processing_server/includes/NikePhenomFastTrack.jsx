﻿//Automate After Effects



		var frameRate = takeAwayComp.layer(7).source.frameRate
		var duration = takeAwayComp.layer(7).source.duration

		var frameCount = Math.abs(frameRate*duration)

		var desiredTotalFrameCount = 263;

		var vidPercentage = (desiredTotalFrameCount/frameCount) * 100
		//alert(vidPercentage +"%")
		var lastOutPoint;
		for(var i = 10; i>=7; i--){
			takeAwayComp.layer(i).source.replace(new File(bulletVideo))
			takeAwayComp.layer(i).stretch = vidPercentage
			lastOutPoint = takeAwayComp.layer(i).outPoint
			//alert(i+' :: Out Point '+lastOutPoint+' Start Time '+takeAwayComp.layer(i).startTime)
			if(i != 10){
				//takeAwayComp.layer(i).inPoint = lastOutPoint
			}


		}

		//var optimalLayerFrameCount = 76;




		//alert("Frame Rate: "+frameRate+" Duration: "+duration+" \n Total Frames: "+frameCount)
		//saveProject('/Users/chris/IncredibleMachines/Nike_Phenom/processing_server/images/'+folder+'/'+folder+'.aep')
	 if(typeof file === 'string') file = new File(file)
	 app.project.save(file)
 }