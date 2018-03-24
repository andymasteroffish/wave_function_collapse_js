function MoveInfo(){
	this.col = -1;
	this.row = -1;
	this.idChar = '?';

	this.set = function(_col, _row, _idChar){
		this.col = _col;
		this.row = _row;
		this.idChar = _idChar;
	}

	this.clear = function(){
		this.col = -1;
		this.row = -1;
		this.idChar = '?';
	}
}

function CheckPoint(_prevMove){
	
	this.prevPoint;
	this.nextPoint;

	this.thisMove = new MoveInfo();

	this.badMoves = new Array();


	this.setup = function(_prevMove){
		this.prevPoint = _prevMove;
		if (this.prevPoint != null){
			this.prevPoint.nextPovar = this;
		}

		this.nextPoint = null;
		this.thisMove.clear();
	}

	this.move = function(col, row, idChar){
		console.log("luv to move "+idChar);
		this.thisMove.set(col,row,idChar);
	}

	this.ruleOutMove = function(_bad){
		var bad = new MoveInfo();
		bad.set(_bad.col, _bad.row, _bad.idChar);
		console.log("rule out "+bad.col+","+bad.row+" : "+bad.idChar);
		this.badMoves.push(bad);
	}

	//do I have to do more than this? Am I leaking memoery?
	this.prune = function(){
		this.nextPoint = null;
	}

	this.getDepth = function(){
		if (this.prevPoint == null){
            return 0;
        }else{
            return this.prevPoint.getDepth()+1;
        }
	}

	//call setup
	this.setup(_prevMove);

}