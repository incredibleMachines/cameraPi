//Automate After Effects//run({firstName: 'George', lastName:'Costanza'},'~/Desktop/AE\ NIKE/53144850191f11911529af10.mov','~/Desktop/AE\ NIKE/93L33_53a44850a9afaa911529af10.mov')function run(username,bulletVideo,liveCapture,folder){
		openProject('~/Desktop/AE\ NIKE\ 2/takeaway.aep')		var comps = new AEHelper('Composition')		var files = new AEHelper('Files')		var nameSource = comps.byName('name_source')		var takeAwayComp = comps.byName('takeAway_previs_B')		//alert(JSON.stringify(username))		var userString		if(username.firstName !='' && username.lastName !=''){			userString = username.firstName.toUpperCase() +' '+ username.lastName.toUpperCase()		}else if(username.firstName !='' && username.lastName ==''){			userString = username.firstName.toUpperCase()		}else if(username.firstName =='' && username.lastName != ''){			userString = username.lastName.toUpperCase()		}else if(username.firstName =='' && username.lastName == ''){			userString = ''		}		//alert(userString)		nameSource.layer(1).property("Source Text").setValue(userString)		takeAwayComp.layer(6).source.replace(new File(liveCapture))


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




		//alert("Frame Rate: "+frameRate+" Duration: "+duration+" \n Total Frames: "+frameCount)		clearRenderQueue()		//closeCurrentProject(true);
		//saveProject('/Users/chris/IncredibleMachines/Nike_Phenom/processing_server/images/'+folder+'/'+folder+'.aep')		saveProject('~/Desktop/AE\ NIKE\ 2/'+folder+'.aep')		closeCurrentProject(true)}function AEHelper(_type){        //set up our vars        var type =_type        //varialize our methods        this.setup = function(){                for(var i =1; i<=app.project.numItems; i++){                    if(app.project.items[i].typeName === type )                        this.add(app.project.items[i])                }            }        //Array for Project Items        this.all = [];        this.length= function(){ return this.all.length }        // Push Custom Item into Compositions Collection        this.add = function(_CustomItem){            this.all.push(_CustomItem)        }        this.byName=function(name){            //name exists            for(var i =0; i< this.all.length; i++) if(this.all[i].name === name) return this.all[i]            //name doesn't exist            return null;        }        //run setup on creation        this.setup()    } function closeCurrentProject(bSave){    if(!bSave){        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES)        }else{            app.project.close(CloseOptions.SAVE_CHANGES)            }    } function clearRenderQueue(){    for(var i =1; i<=app.project.renderQueue.numItems; i++){            //remove each item in the queue            app.project.renderQueue.item(i).remove()        } } function saveProject(file){
	 if(typeof file === 'string') file = new File(file)
	 app.project.save(file)
 } function openProject(file){  //$.writeln(typeof file)  if(typeof file ==="string") file = new File(file)  app.open(file)}