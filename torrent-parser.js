'use strict';
import * as fs from 'fs';
import bencode from 'bencode';
import cyrpto from 'crypto';
import bignum from 'bignum';

export const open = (filepath) => {
		const data = fs.readFileSync(filepath)
		const res = bencode.decode( data,0,data.length,'utf8' ); 
		console.log(res);	
	 	return bencode.decode(fs.readFileSync(filepath));

};


export const size = (torrent) => { 
	const size = torrent.info.files ? torrent.info.files.map(file=>file.length).reduce((a,b)=>a+b): torrent.info.length;
	return bignum.toBuffer(size,{size:8});
};

export const infoHash = (torrent) => {
	const info = bencode.decode(torrent.info);
	const hash = crypto.createHash('SHA1').update(info).digest();
	console.log('INFO HASH ::',hash);
	return hash;
};



export const BLK_LEN = Math.pow(2,14); // LEN OF A BLOCK 2^14 bytes

export const pieceLen = (torrent , p_id) => {

	const total_len =bignum.fromBuffer(size(torrent)).toNumber();
	const piece_len =torrent.info['piece length'];

	const final_p_id = Math.floor(total_len/piece_len) ;
	const final_piece_len = total_len % piece_len;
	// if final_p_id then return final piece len (less than the const piece_len 
	// else just give the normal const piece_len;
	return (final_p_id === p_id) ? final_piece_len : piece_len;

};



export const blockPerPiece = (torrent, p_id) => {
	
	const piecelength = pieceLen(torrent,p_id);

	return Math.ceil(piecelength/BLK_LEN);
};

export const blockLen = (torrent,p_id, block_id) => {
	const piecelength = pieceLen(torrent,p_id);
	const final_block_id = Math.floor(piecelength / BLK_LEN);
	const final_block_len = piecelength % BLK_LEN;

	return (final_block_id === pieceLen.final_p_id) ? final_piece_len : BLK_LEN;
}





