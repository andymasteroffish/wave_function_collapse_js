function WFC(){

	this.canvas;
	
	this.levelSource = [
	"                  S         ",
	"    $             S         ",
	"#######H#######   S         ",
	"       H----------S    $    ",
	"       H    ##H   #######H##",
	"       H    ##H          H  ",
	"     0 H    ##H       $0 H  ",
	"##H#####    ########H#######",
	"  H                 H       ",
	"  H           0     H       ",
	"#########H##########H       ",
	"         H          H       ",
	"       $ H----------H   $   ",
	"    H######         #######H",
	"    H         &  $         H",
	"############################"];

	this.tileImages = new Array();
	this.tileSize = 16;

	this.setupComplete = false;

	this.setup = function(){
		this.canvas = document.getElementById("canvas").getContext("2d");

		//load some pics
		this.tileImages.push( new ImageInfo("tile_pics/blank.png", 	' ') );
		this.tileImages.push( new ImageInfo("tile_pics/block.png", 	'@') );
		this.tileImages.push( new ImageInfo("tile_pics/brick.png", 	'#') );
		this.tileImages.push( new ImageInfo("tile_pics/escape_ladder.png", 	'S') );
		this.tileImages.push( new ImageInfo("tile_pics/foe.png", 	'0') );
		this.tileImages.push( new ImageInfo("tile_pics/gold.png", 	'$') );
		this.tileImages.push( new ImageInfo("tile_pics/ladder.png", 	'H') );
		this.tileImages.push( new ImageInfo("tile_pics/player.png", 	'&') );
		this.tileImages.push( new ImageInfo("tile_pics/rope.png", 	'-') );


	}


	this.start = function(){
		console.log("go go go");

		//draw the damn thing
		for (var y=0; y<this.levelSource.length; y++){
			for (var x=0; x<this.levelSource[y].length; x++){
				var thisChr = this.levelSource[y][x];
				//console.log(thisChr);
				var img = this.getImgFromChar( thisChr );
				this.canvas.drawImage( img, x*this.tileSize, y*this.tileSize);
			}
		}

	}



	this.getImgFromChar = function(chr){
		//console.log("search for "+chr);
		for (var i=0; i<this.tileImages.length; i++){
			if (this.tileImages[i].chr == chr){
				return this.tileImages[i].image;
			}
		}
	}

	this.setup();	//run the setup function
}