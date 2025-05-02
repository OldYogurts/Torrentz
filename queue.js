
'use strict';

import * as tp from './torrent-parser.js';


export class Queue {
	constructor(torrent){
	this._torrent = torrent;
	this._queue   = [];
	this.chocke   = true;
	}
		
	queue(p_id) {
		const n_blk = tp.blockPerPiece(this._torrent , p_id);
		for (let i = 0; i<n_blk ; i++){
			const PIECE_BLOCK = {
				index : p_id,
				begin : i * tp.BLK_LEN,
				lenght: tp.blockLen(this._torrent , p_id,i)
			};
		this._queue.push(PIECE_BLOCK);
		}
				

	}

	deque() { return this._queue.shift(); }
	peek()  { return this._queue[0]; }
	length(){ return this._queue.length; }

};
	





