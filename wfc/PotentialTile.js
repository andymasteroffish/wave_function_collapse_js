//state enum
var PotentialTileState = Object.freeze( { 
	STATE_INACTIVE : 1,
	STATE_ACTIVE : 2,
	STATE_SET : 3
});


function PotentialTile(_x, _y, _potentialIDs){

	this.state;
    this.potentialIDs = new Array();
    this.setID;
    
    this.x;
    this.y;


	this.reset = function(_x, _y, _potentialIDs){
		this.x = _x;
		this.y = _y;

		//console.log("ste up for "+this.x+","+this.y);

		this.state = PotentialTileState.STATE_INACTIVE;

		this.setID = '?';

		this.potentialIDs.length = 0;
		for (var i=0; i<_potentialIDs.length; i++){
			var thisChar = _potentialIDs[i];
			this.potentialIDs.push(thisChar);
		}
	}

	this.set = function(idChar){
	    this.state = PotentialTileState.STATE_SET;
	    this.setID = idChar;
	    this. potentialIDs.length = 0;
	}

	this.getRandPotentialID = function(){
	    return potentialIDs[ Math.floor( Math.random()*potentialIDs.length) ];
	}

	this.ruleOutBasedOnNeighbor = function(other, dirToCheck){
		//console.log("rule out for tile "+this.x+","+this.y+"  against "+other.idChar+" in dir "+dirToCheck);
	    //ignore this if we've already been set
	    if (this.state == PotentialTileState.STATE_SET){
	        return;
	    }
	    
	    //if this is having this removed, it must have a neighbor
	    this.state = PotentialTileState.STATE_ACTIVE;
	    
	    var goodIDs = new Array();
	    for (var i=0; i<other.neighbors[dirToCheck].length; i++){
	        goodIDs.push(other.neighbors[dirToCheck][i].idChar);
	    }

	    //console.log("goodID size: "+goodIDs.length);
	    
	    //go though and remove any IDs of mine that are not good IDs
	    for (var i=this.potentialIDs.length-1; i>=0; i--){
	        var isGood = false;
	        for (var k=0; k<goodIDs.length; k++){
	            if (this.potentialIDs[i] == goodIDs[k]){
	                isGood = true;
	            }
	        }
	        
	        if (!isGood){
	            this.potentialIDs.splice(i,1);
	        }
	    }
	}


	this.ruleOutID = function(idChar){
	    for (var i= this.potentialIDs.length-1; i>=0; i--){
	        if (this.potentialIDs[i] == idChar){
	            this.potentialIDs.splice(i,1);
	        }
	    }
	}

	//reset this thing
	this.reset(_x, _y, _potentialIDs);

}
