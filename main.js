var wfc;

function init(){
	wfc = new WFC();
}


function noteTileImageLoaded(){
	if (wfc.setupComplete){
		return;
	}

	var allLoaded = true;
	for (var i=0; i<wfc.tileImages.length; i++){
		if (wfc.tileImages[i].image.width != wfc.tileSize || !wfc.tileImages[i].image.complete){
			console.log(i+" fucked it up");
			allLoaded = false;
		}
	}

	console.log("all loaded: "+allLoaded);

	if (allLoaded){
		wfc.setupComplete = true;
		wfc.start();
	}
	
	
}



function testo(){
	console.log("crenshaw");
}