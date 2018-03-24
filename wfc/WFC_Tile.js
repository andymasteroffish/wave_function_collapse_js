function NeighborInfo(_idChar){
	this.idChar = _idChar;
	this.freq = 1;
}

function WFC_Tile(_idChar){
	this.idChar = _idChar;

	//0-N, 1-E, 2-S, 3-W
	this.neighbors = new Array(4);
	for (var i=0; i<this.neighbors.length; i++){
		this.neighbors[i] = new Array();
	}
	
	this.resetNeighborInfo = function(){
		for (var i=0; i<this.neighbors.length; i++){
			this.neighbors[i].length = 0;
		}
	}

	this.noteNeighbor = function(dir, neighborID){
        //is this already in the list?
        for (var i=0; i<this.neighbors[dir].length; i++){
            if (this.neighbors[dir][i].idChar == neighborID){
                this.neighbors[dir][i].freq++;
                return;
            }
        }
        
        //if not, add it
        var newNeighbor = new NeighborInfo(neighborID);
        this.neighbors[dir].push(newNeighbor);
    }

    this.addNeighborFreq = function(dir,  choices){
        for (var i=0; i<choices.length; i++){
            for (var k=0; k<this.neighbors[dir].length; k++){
                if (choices[i].idChar == this.neighbors[dir][k].idChar){
                    choices[i].freq += this.neighbors[dir][k].freq;
                }
            }
        }
    }
	
}