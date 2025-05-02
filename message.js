'use strict';

import Buffer from 'buffer';
import * as torrentParser from './torrent-parser.js';



const buffer = Buffer.Buffer;


// HANDSAKE :
// SPECS :  <protoclo_strlen=19 (1 byte)><Protocol_str = "BitTorrent protocol"><reserved 8bytes of 0's><info_hash(20-bytes)><peer_id(20_bytes) total = 1 + 19 + 8 +20 + 20=68 bytes buf



export const parse = msg => {
	const id = msg.length >4 ? msg.readUint8(4) : null;
	let payload = msg.length >5 ? msg.slice(5) : null;
	
	if (id === 6 || id === 7 || id === 8){
		payload = {
			index : payload.readUint32BE(0),
			begin : payload.readUint32BE(4)
		}
		const rest = payload.slice(8);
		payload[id===7?'block':'length'] = rest;

	}
	
	return {
		size : msg.readUint32BE(0),
		id : id,
		payload : payload
	}

}


export const makeHandsake = torrent => {
	
	const buf = buffer.alloc(68);
	//write 1 byte pstrlen
	buf.writeUint8(19,0);
	//write 19 bytes pstr
	buf.write("BitTorrent protocol",1);
	// write 1 32 bit(4 bytes) reserved
	buf.writeUint32BE(0,20);
	// write 1 32 bit(4 bytes) rest of reserved
	buf.writeUint32BE(0,24);
	info_hash = torrentParser.infoHash(torrent)
	info_hash.copy(buf,28);
	buf.write(util.getId());
	return buf;
};

export const KeepAlive = () =>  buffer.alloc(4);

export const Chocke = () => {
	const buf = buffer.alloc(5);
	// 4 bytes  with number 1 ( 00000000 00000000 00000000 00000001)
	buf.writeUint32BE(1,0);
	// the <id= 0> in a byte ( 00000000);
	buf.writeUint8(0,4);
	return buf;
};


export const UnChocke = () =>{
	const buf= buffer.alloc(5);
	// 4 bytes of <len = 0001>
	buf.writeUint32BE(1,0);
	// 1 byte of <id = 1>
	buf.writeUint8(1,4);
	return buf;
};

export const Intrested = () =>{
	const buf = buffer.alloc(5);

	buf.writeUint32BE(1,0);
	buf.writeUint8(2,4);
	return buf;
};

export const NotIntrested = () => {
	const buf = buffer.alloc(5);
	buf.writeUint32Be(1,0);
	buf.wirteUint8(3,4);
	return buf;
};

export const Have = (payload) => {
	const buf = buffer.alloc(9);

	buf.writeUint32BE(5,0);
	buf.writeUint8(4,4);
	buf.writeUint32BE(payload,5);

	return buf;
};

export const Bitfield = bitfield =>{
	const buf = buffer.alloc(14);
	const x = bitfield.length
	console.log(x,bitfield)
	buf.writeUint32BE(1+x,0);
	buf.writeUint8(5,4);
	// TODO: HUH??
	bitfield.copy(buf,5);
	return buf;
};

export const Request = (payload) => {
	const buf = buffer.alloc(17);
	
	buf.writeUint32BE(13,0);
	buf.writeUint8(6,4);
	buf.writeUint32BE(payload.index,5);
	buf.writeUint32BE(payload.begin,9);
	buf.wtiteUint32BE(payload.len,13);
	return buf;
};

export const PieceBuild = (payload) =>{
	const x = payload.block.len;
	const buf = buffer.alloc(x+13);

	buf.writeUint32BE(x+9,0);
	buf.writeUint8(7,4);
	buf.writeUint32BE(payload.index,5);
	buf.writeUint32BE(payload.begin,9);
	payload.block.copy(buf,13);
	return buf;
};
	

export const Cancel = (payload) => {
	const buf = buffer.alloc(17);
	
	buf.writeUint32BE(13,0);
	buf.writeUint8(8,4);
	buf.writeUint32BE(payload.index,5);
	buf.writeUint32BE(payload.begin,9);
	buf.writeUint32BE(payload.len,13);
	return buf;
};

export const Port = (payload) => {
	const buf = buffer.alloc(7);
	
	buf.writeUint32BE(3,0);
	buf.writeUint8(9,4);
	buf.writeUint16BE(payload,5);
	return buf;
};



