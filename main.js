var wfc;

var frameInterval;

function init_andy(){
	wfc = new WFC();

	document.addEventListener("keydown", keyDownRegister, false);
	document.addEventListener("keyup", keyUpRegister, false);


	var gold_slider = document.getElementById("gold_slider");
	gold_slider.value = wfc.numGoldSeeds;
	document.getElementById("gold_slider_text").innerHTML = "min num Gold: "+wfc.numGoldSeeds;
	gold_slider.oninput = function() {
		wfc.numGoldSeeds = this.value;
		document.getElementById("gold_slider_text").innerHTML = "min num Gold: "+wfc.numGoldSeeds;
		wfc.resetOutputAndAdvance();
	}

	//LoderRunnerInit();
}


function noteTileImageLoaded(){
	if (wfc.setupComplete){
		return;
	}

	var allLoaded = true;
	for (var i=0; i<wfc.tileImages.length; i++){
		if (wfc.tileImages[i].image.width != wfc.tileW || !wfc.tileImages[i].image.complete){
			//console.log(i+" fucked it up");
			allLoaded = false;
		}
	}

	console.log("all loaded: "+allLoaded);

	if (allLoaded){
		wfc.setupComplete = true;
		wfc.start();

		frameInterval = setInterval(tick, 5); 
	}
}


function keyDownRegister(e) {
	var keyCode = e.keyCode;
	wfc.keyPress(keyCode);
}
function keyUpRegister(e) {
	var keyCode = e.keyCode;
	wfc.keyRelease(keyCode);
}


function tick() {
	wfc.update();
}

function clickedPenButton(newVal){
	console.log("pen: "+newVal);
	wfc.setPen(newVal);
}


function testo(){
	console.log("crenshaw");
}





// function randomRange(max){
// 	console.log("max "+max);
// 	return randomRange(0, max);
// }

function randomRange(min, max){
	var range = max-min;
	return Math.random()*range + min;
}

function randomInt(max){
	//console.log("max "+max);
	return randomIntWithMin(0, max);
}
function randomIntWithMin(min, max){
	//console.log("min "+min+"  max "+max);
	return Math.floor(randomRange(min,max));
}