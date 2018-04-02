function WFC(){

	this.sourceCanvas;
	this.sourceCanvasHolder;
	this.outputCanvas;

	this.autoPlay = false;
	this.fastForward = false;
	this.useFreq = true;
	this.freqWeight = 1.0;
	
	this.levelSourceYFirst = [
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

	this.sourceImage = new Array();

	//basic tile info
	this.tileImages = new Array();
	this.tileW = 16;
	this.tileH = 16;

	//the source
	this.sourceCols = 28;
	this.sourceRows = 16;
	this.sourceTiles = new Array();

	//the generated output
	this.outputCols = 28;
	this.outputRows = 16;
	this.outputImage = new Array(this.outputCols);

	//checkpointing in order ot undo moves
	this.rootMove;
	this.curMove;

	//states
	this.setupComplete = false;
	this.needFirstMove;
	this.needToGetNeighborInfo;
	this.isDone;

	//seeding
	this.numGoldSeeds = 5;
	this.seedEscapeLadder = true;

	//drawing onto source
	this.curPenChar = '?'
	this.mouseIsDown = false;


	this.setup = function(){
		this.sourceCanvasHolder = document.getElementById("source_canvas");
		this.sourceCanvas = this.sourceCanvasHolder.getContext("2d");
		this.outputCanvas = document.getElementById("output_canvas").getContext("2d");

		//some listeners
		var context = this;
		$(document).mousedown(function() {
		    context.mouseIsDown = true;
		}).mouseup(function() {
		    context.mouseIsDown = false;  
		});

		$("#source_canvas").mousedown(function(e){
			context.clickedSourceCanvas(e, context);
		});

		//faking drag events
		$("#source_canvas").mousemove(function(e){
			//console.log(e.pageX+","+e.pageY);
			if (context.mouseIsDown){
				context.clickedSourceCanvas(e, context);
			}
		});

		

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

		//flip the level source to be x first
		for (var x=0; x<this.sourceCols; x++){
			this.sourceImage[x] = new Array(this.sourceRows);
		}
		for (var y=0; y<this.sourceRows; y++){
			for (var x=0; x<this.sourceCols; x++){
				var thisChr = this.levelSourceYFirst[y][x];
				this.sourceImage[x][y] = thisChr;
			}
		}

		//setup the source tiles
		var potentialIDs = new Array();
		for (var i=0; i<this.tileImages.length; i++){
			//console.log("dang i love "+this.tileImages[i].idChar);
			this.sourceTiles.push( new WFC_Tile(this.tileImages[i].idChar) );
			potentialIDs.push( this.tileImages[i].idChar );
		}

		this.rootMove = new CheckPoint(null);


		//setup the output
		for (var x=0; x<this.outputCols; x++){
			this.outputImage[x] = new Array(this.outputRows);
			for (var y=0; y<this.outputRows; y++){
				this.outputImage[x][y] = new PotentialTile(x, y, potentialIDs);
			}
		}
	}


	this.start = function(){
		console.log("go go go");

		this.setPen(2);

		this.resetOutput();
    	this.needToGetNeighborInfo = true;
    	this.needFirstMove = true;

    	//this.validateBoard(); 
    	//testing
    	this.advance();

    	this.draw();
	}



	//--------------------------------------------------------------
	this.reset = function(){
	    this.setNeightborInfo();
	    this.resetOutput();
	}

	this.resetOutputAndAdvance = function(){
		this.resetOutput();
	    this.needFirstMove = true;
	    this.advance();
	}

	//--------------------------------------------------------------
	this.resetOutput = function(){
		var potentialIDs = new Array();
		for (var i=0; i<this.tileImages.length; i++){
			potentialIDs.push( this.tileImages[i].idChar );
		}

	    for (var x=0; x<this.outputCols; x++){
	        for (var y=0; y<this.outputRows; y++){
	            this.outputImage[x][y].reset(x, y, potentialIDs);
	        }
	    }
	    this.isDone = false;

	    
	    //show the changes
	    this.draw();
	}

	//--------------------------------------------------------------
	this.doFirstMove = function(){
	    console.log("do first move");
	    this.needFirstMove = false;

	    //restart the history
	    this.rootMove.prune();
	    this.curMove = this.rootMove;


	    //do some seeding

	    //escape escape_ladder (best if on top)
	   	if (this.seedEscapeLadder){
	   		var pos = new GridPos( randomInt(this.outputCols), 0);
	    	this.curMove = new CheckPoint(this.curMove);
	    	this.curMove.move(pos.x, pos.y, 'S');
	    	this.updateBoardFromMove(this.curMove);
	   	}

	   	//player
	   	var playerPos = this.getUnoccupiedPos();
    	this.curMove = new CheckPoint(this.curMove);
    	this.curMove.move(playerPos.x, playerPos.y, '&');
    	this.updateBoardFromMove(this.curMove);

	    //gold
	    for (var i=0; i<this.numGoldSeeds; i++){
	    	var pos = this.getUnoccupiedPos();
	    	this.curMove = new CheckPoint(this.curMove);
	    	this.curMove.move(pos.x, pos.y, '$');
	    	this.updateBoardFromMove(this.curMove);
	    }


	    //add no more player spawn points
	    for (var x=0; x<this.outputCols; x++){
	        for (var y=0; y<this.outputRows; y++){

	        	this.outputImage[x][y].ruleOutID('&');

	        }
	    } 



	    //start us off
	    // var randPos = this.getUnoccupiedPos();
	    // this.curMove = new CheckPoint(this.curMove);
	    // this.curMove.move(randPos.x, randPos.y, this.sourceTiles[randomInt(this.sourceTiles.length)].idChar) ;
	    // this.updateBoardFromMove(this.curMove);
	}

	//--------------------------------------------------------------
	//this will lock up if there are no unoccupied tiles, and will be slow if there are few
	this.getUnoccupiedPos = function(){
		while (true){
			var col = randomInt(this.outputCols);
	    	var row = randomInt(this.outputRows);
	    	if (this.outputImage[col][row].state == PotentialTileState.STATE_INACTIVE){
	    		return new GridPos(col, row);
	    	}
		}
	}


	//--------------------------------------------------------------
	this.setNeightborInfo = function(){
	    this.needToGetNeighborInfo = false;
	    
	    for (var i=0; i<this.sourceTiles.length; i++){
	        this.sourceTiles[i].resetNeighborInfo();
	    }
	    
	    for (var x=0; x<this.sourceCols; x++){
	        for (var y=0; y<this.sourceRows; y++){
	            var idChar = this.sourceImage[x][y];
	            
	            //check to the north
	            if (y>0){
	            	this.getSourceTileFromID(idChar).noteNeighbor(0, this.sourceImage[x][y-1]);
	            }
	            
	            //check to the east
	            if (x<this.sourceCols-1){
	                this.getSourceTileFromID(idChar).noteNeighbor(1, this.sourceImage[x+1][y]);
	            }
	            
	            //check to the south
	            if (y<this.sourceRows-1){
	                this.getSourceTileFromID(idChar).noteNeighbor(2, this.sourceImage[x][y+1]);
	            }
	            
	            //check to the west
	            if (x>0){
	                this.getSourceTileFromID(idChar).noteNeighbor(3, this.sourceImage[x-1][y]);
	            }
	        }
	    }
	    
	    
	    //testing info
	    /*
	    var labels = ["North", "East", "South", "West" ];
	    for (var i=0; i<this.sourceTiles.length; i++){
	        console.log("tile "+i);
	        for (var dir=0; dir<4; dir++){
	            console.log(" "+labels[dir]);
	            for (var k=0; k<this.sourceTiles[i].neighbors[dir].length; k++){
	                console.log("  "+this.sourceTiles[i].neighbors[dir][k].idChar+":"+this.sourceTiles[i].neighbors[dir][k].freq);
	            }
	        }
	    }
	    */
	}

	this.getSourceTileFromID = function(idChar){
		//console.log("hunt for:"+idChar);
		for (var i=0; i<this.sourceTiles.length; i++){
			//console.log(i+" is "+this.sourceTiles[i].idChar);
			if (this.sourceTiles[i].idChar == idChar){
				return this.sourceTiles[i];
			}
		}
		console.log("ID NOT FOUND:"+idChar);
		return null;
	}

	//--------------------------------------------------------------
	this.advance = function(){
	    if (this.isDone){
	        return;
	    }
	    
	    if (this.needToGetNeighborInfo){
	        this.setNeightborInfo();
	    }
	    if (this.needFirstMove){
	        this.doFirstMove();
	        return;
	    }
	    
	    //cout<<"advance"<<endl;
	    var oldMove = this.curMove;
	    this.curMove = new CheckPoint(oldMove);
	    
	    //cout<<"move "<<curMove->getDepth()<<endl;
	    
	    //make a list of the active potential tiels with the fewest posibilits
	    var lowVal = this.sourceTiles.length+1;
	    for (var x=0; x<this.outputCols; x++){
	        for (var y=0; y<this.outputRows; y++){
	            if (this.outputImage[x][y].state == PotentialTileState.STATE_ACTIVE && this.outputImage[x][y].potentialIDs.length < lowVal){
	                lowVal = this.outputImage[x][y].potentialIDs.length;
	            }
	        }
	    }
	    
	    var choices = new Array();
	    for (var x=0; x<this.outputCols; x++){
	        for (var y=0; y<this.outputRows; y++){
	            if (this.outputImage[x][y].state == PotentialTileState.STATE_ACTIVE && this.outputImage[x][y].potentialIDs.length == lowVal){
	                choices.push(this.outputImage[x][y]);
	            }
	        }
	    }
	    
	    if (choices.length == 0){
	        console.log("all done!");
	        this.isDone = true;
	        return;
	    }
	    
	    //select one at random
	    var thisChoice = randomInt(choices.length);
	    
	    //select a tile at random
	    var thisTileIDChar = '?';
	    if (!this.useFreq){
	    	var idNum = randomInt(choices[thisChoice].potentialIDs.length);
	        thisTileIDChar = choices[thisChoice].potentialIDs[ idNum ];
	    }
	    //get the frequency of each type of tile for each direction
	    else{
	        var tileChoices = this.getTileChoicesWithFreq( choices[thisChoice].x, choices[thisChoice].y );
	        
	        var totalFreq = 0;
	        for (var i=0; i<tileChoices.length; i++){
	        	totalFreq += tileChoices[i].freq;
	        }
	        var roll = randomRange(0,totalFreq);
	        
	        for (var i=0; i<tileChoices.length; i++){
	            roll -= tileChoices[i].freq;
	            if (roll <= 0){
	                //thisTile = i;
	                thisTileIDChar = tileChoices[i].idChar;
	                break;
	            }
	        }
	    }
	    
	    //make a move
	    //console.log("this id number "+thisTile);
	    this.curMove.move( choices[thisChoice].x, choices[thisChoice].y, thisTileIDChar);

	    //and do it
	    this.updateBoardFromMove(this.curMove);
	    
	}

	//--------------------------------------------------------------
	this.getTileChoicesWithFreq = function(col, row){
	    var tileChoices = new Array();
	    for (var i=0; i<this.outputImage[col][row].potentialIDs.length; i++){
	        var info = new NeighborInfo(this.outputImage[col][row].potentialIDs[i]);
	        info.freq = 0;
	        tileChoices.push(info);
	    }
	    
	    //check the tile to our north
	    if (row > 0){
	        if (this.outputImage[col][row-1].state == PotentialTileState.STATE_SET){
	            var thisID = this.outputImage[col][row-1].setID;
	            this.getSourceTileFromID(thisID).addNeighborFreq(2, tileChoices);	//this.sourceTiles[thisID].addNeighborFreq(2, tileChoices);
	        }
	    }
	    
	    //check the tile to our east
	    if (col < this.outputCols-1){
	        if (this.outputImage[col+1][row].state == PotentialTileState.STATE_SET){
	            var thisID = this.outputImage[col+1][row].setID;
	            this.getSourceTileFromID(thisID).addNeighborFreq(3, tileChoices);
	        }
	    }
	    
	    //check the tile to our south
	    if (row < this.outputRows-1){
	        if (this.outputImage[col][row+1].state == PotentialTileState.STATE_SET){
	            var thisID = this.outputImage[col][row+1].setID;
	            this.getSourceTileFromID(thisID).addNeighborFreq(0, tileChoices);
	        }
	    }
	    
	    //check the tile to our west
	    if (col > 0){
	        if (this.outputImage[col-1][row].state == PotentialTileState.STATE_SET){
	            var thisID = this.outputImage[col-1][row].setID;
	            this.getSourceTileFromID(thisID).addNeighborFreq(1, tileChoices);
	        }
	    }

	    //multiply them by the weight and then give them all at least 1 frequency
	     for (var i=0; i<tileChoices.length; i++){
	         tileChoices[i].freq *= this.freqWeight;
	         tileChoices[i].freq += 1;
	     }
	    
	    //testing
	//    cout<<"choices "<<tileChoices.length<<endl;
	//    for (var i=0; i<tileChoices.length; i++){
	//        cout<<" tile "<<tileChoices[i].idNum<<" "<<tileChoices[i].freq<<endl;
	//    }
	    
	    return tileChoices;
	    
	    
	}

	//--------------------------------------------------------------
	this.updateBoardFromMove = function(point){
	    if (this.isDone){
	        return;
	    }
	    
	    //console.log("update board point:"+point);

	    var move = point.thisMove;
	    if (move.col == -1){
	        console.log("empty move");
	        return;
	    }

	    //console.log("this move "+move.col+","+move.row+" : "+move.idChar);
	    
	    //set the given tiles
	    this.outputImage[move.col][move.row].set(move.idChar);
	    
	    //rule out anything we need to because it previously lead to dead ends
	    for (var i=0; i<point.badMoves.length; i++){
	        var badMove = point.badMoves[i];
	        this.outputImage[badMove.col][badMove.row].ruleOutID(badMove.idChar);
	        console.log("hey brah don't do "+badMove.col+","+badMove.row+": "+badMove.idNum);
	    }
	    
	    //go through the neighbors and update them
	    
	    var thisTile = this.getSourceTileFromID(move.idChar);// this.sourceTiles[this.outputImage[move.col][move.row].setID];
	    //console.log("this tile "+thisTile);
	    //north
	    if (move.row > 0){
	        this.outputImage[move.col][move.row-1].ruleOutBasedOnNeighbor( thisTile, 0);
	    }
	    
	    //east
	    if (move.col < this.outputCols-1){
	        this.outputImage[move.col+1][move.row].ruleOutBasedOnNeighbor( thisTile, 1);
	    }
	    
	    //south
	    if (move.row < this.outputRows-1){
	        this.outputImage[move.col][move.row+1].ruleOutBasedOnNeighbor( thisTile, 2);
	    }
	    
	    //west
	    if (move.col > 0){
	        this.outputImage[move.col-1][move.row].ruleOutBasedOnNeighbor( thisTile, 3);
	    }
	    
	    //validate
	    this.validateBoard();

	    this.draw();
	}

	//--------------------------------------------------------------
	//if any potential tiles have no options, this move is dirt!
	this.validateBoard = function(){
	    var boardIsValid = true;
	    for (var x=0; x<this.outputCols; x++){
	        for (var y=0; y<this.outputRows; y++){
	            if (this.outputImage[x][y].state == PotentialTileState.STATE_ACTIVE && this.outputImage[x][y].potentialIDs.length == 0){
	                console.log(x+","+y+" is no good!");
	                boardIsValid = false;
	            }
	        }
	    }
	    
	    if (!boardIsValid){
	        //autoPlay = false;
	        this.curMove.prevPoint.ruleOutMove(this.curMove.thisMove);
	        this.revertToCheckPoint(this.curMove.prevPoint);
	    }
	}



	//--------------------------------------------------------------
	this.revertToCheckPoint = function(point){
	    console.log("REVERT to "+point.getDepth());
	    this.resetOutput();
	    
	    if (point.getDepth() == 0){
	        this.needFirstMove = true;
	    }
	    
	    this.curMove = this.rootMove;
	    while(this.curMove != point){
	        //console.log("step: "+this.curMove.getDepth());
	        this.updateBoardFromMove(this.curMove);
	        //console.log("next: "+this.curMove.nextPoint);
	        this.curMove = this.curMove.nextPoint;
	    }
	    
	    this.updateBoardFromMove(this.curMove);
	    
	    this.curMove.prune();
	    
	}

	//--------------------------------------------------------------
	this.keyPress = function(keyCode){

		var key = String.fromCharCode(keyCode);
		//console.log(keyCode+" : "+key);
		
		if (key == ' '){
	        this.advance();
	    }
	    
	    if (key == 'Z'){
	        this.curMove.prevPoint.ruleOutMove(this.curMove.thisMove);
	        this.revertToCheckPoint(this.curMove.prevPoint);
	    }
	    
	    if (key == 'A'){
	        this.autoPlay = !this.autoPlay;
	    }
	    if (key == 'F'){
	        this.fastForward = !this.fastForward;
	    }
	    
	    
	    if (key == 'R'){
	        this.resetOutputAndAdvance();
	    }
	    
	    //frequency
	    if (key == 'Q'){
	        this.useFreq = !this.useFreq;
	    }
	    // if (key == '-' && this.freqWeight > 0){
	    //     this.freqWeight -= 0.1;
	    // }
	    // if (key == '+'){
	    //     this.freqWeight += 0.1;
	    // }
	}

	//--------------------------------------------------------------
	this.keyRelease = function(key){
	}


	//--------------------------------------------------------------
	this.setPen = function(newVal){
		this.curPenChar = this.sourceTiles[newVal].idChar;
		
		//set the class info
		for (var i=0; i<this.sourceTiles.length; i++){

			var idName = "#button_"+i;
			var thisbutton = $(idName);
			if (newVal == i){
				thisbutton.addClass("pen_button_on").removeClass("pen_button_off");
			}else{
				thisbutton.addClass("pen_button_off").removeClass("pen_button_on");
			}
		}

	}


	//--------------------------------------------------------------
	this.clickedSourceCanvas = function(e){
		var clickX = e.pageX - this.sourceCanvasHolder.offsetLeft;
		var clickY = e.pageY - this.sourceCanvasHolder.offsetTop;
		
		var col = Math.floor( clickX / this.tileW);
		var row = Math.floor( clickY / this.tileH);

		this.drawOnSourceImage(col, row, this.curPenChar);
	}

	

	//--------------------------------------------------------------
	this.drawOnSourceImage = function( x,  y, newID){
	    this.sourceImage[x][y] = newID;
	    this.needToGetNeighborInfo = true;
	    if (!this.needFirstMove){
	        this.resetOutputAndAdvance();
	    }

	    //console.log(x+","+y+" is now "+newID);
	    this.draw();
	}

	//--------------------------------------------------------------
	this.update = function(){

		if (this.autoPlay){
	        var cycles = 1;
	        if (this.fastForward){
	            cycles = 10;
	        }
	        for (var i=0; i<cycles; i++){
	            this.advance();
	        }
	    }
	}



	//DRAWING

	

	this.draw = function(){

		//draw the source
		this.sourceCanvas.clearRect(0, 0, this.sourceCols*this.tileW, this.outputRows*this.sourceRows);
		for (var x=0; x<this.sourceCols; x++){
			for (var y=0; y<this.sourceRows; y++){
				var img = this.getImgFromChar( this.sourceImage[x][y] );
				this.sourceCanvas.drawImage( img, x*this.tileW, y*this.tileH);
			}
		}

		//and the output
		this.outputCanvas.clearRect(0, 0, this.outputCols*this.tileW, this.outputRows*this.outputRows);
		for (var x=0; x<this.outputCols; x++){
			for (var y=0; y<this.outputRows; y++){
				if (this.outputImage[x][y].state == PotentialTileState.STATE_SET){
					var img = this.getImgFromChar( this.outputImage[x][y].setID );
					this.outputCanvas.drawImage( img, x*this.tileW, y*this.tileH);
				}

			}
		}
		// for (var x=0; x<this.levelSource[y].length; x++){
		// 	for (var y=0; y<this.levelSource.length; y++){
		// 		var thisChr = this.levelSource[y][x];
		// 		//console.log(thisChr);
		// 		var img = this.getImgFromChar( thisChr );
		// 		this.sourceCanvas.drawImage( img, x*this.tileW, y*this.tileH);
		// 	}
		// }

	}

	this.getImgFromChar = function(chr){
		//console.log("search for "+chr);
		for (var i=0; i<this.tileImages.length; i++){
			if (this.tileImages[i].idChar == chr){
				return this.tileImages[i].image;
			}
		}
		console.log("couldn't find image for:"+chr);
	}





	this.setup();	//run the setup function
}