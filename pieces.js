'use strict';
import * as tp from './torrent-parser.js';

export class Pieces {
	constructor(torrent) {
		function PieceArray() {
			const n_pieces = torrent.info.pieces.length/20;
			const arr = new Array(n_pieces).fill(null);
			// array of arrays all filled with false is the init array
			return arr.map((_,i)=>tp.blockPerPiece(torrent,i)).fill(false);	
		}
		this._requested = PieceArray()
		this._received  = PieceArray()

	}
	add_requested(piece_block){
		const blockID = piece_block.begin/tp.BLK_LEN;
		const p_id = piece_block.index;
		console.log("Requested pieceBlock",blockID, "from piece no..",p_id);
		this._requested[p_id][blockID] = true;
	}


	add_received(piece_block){
		const blockID = piece_block.begin/tp.BLK_LEN;
		const p_id = piece_block.index;
		console.log("Received piecerBblock",blockID,"from piece no..",p_id)
		this._received[p_id][blockID] = true;
	}
	
	
	need_still(piece_block){
	
		if(this._requested.every(blocks=>blocks.every(i=>i))){
			this._requested = this._received.map(blocks => blocks.slice());
		}
		const blockID = piece_block.begin/tp.BLK_LEN;
		const p_id = piece_block.index;
		if(!this._received[p_id][blockID]) {console.log("still need block",blockID,"from piece no..",p_id);};
		return !this._requested[p_id][blockID];
	}


	Done() {
		if (this._received.every(blocks=>blocks(i => i))){
			console.log("DOWNLOAD COMPLETE , ALL BLOCKS RECEIVED");
		}
		return this._received.every(blocks=>blocks(i => i));
	}
};
