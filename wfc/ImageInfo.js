function ImageInfo(_url, _chr){

	this.idChar = _chr;
	//this.ready = false;
	this.image = new Image();
  	this.image.src = _url;

  	//console.log("please make "+this.idChar);

  	this.image.onload = function(){
    	//this.ready = true;
    	//console.log("scream "+this.chr+" "+this.ready);
    	
    	noteTileImageLoaded(this);
  	}


}