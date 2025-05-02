'use strict';

import net from 'net'
import Buffer from 'buffer';
import fs from 'fs';
import * as tracker from './tracker.js';
import * as message from './message.js';
import { Pieces }  from './pieces.js';
import * as Queue   from './queue.js';

const buffer = Buffer.Buffer;
export const download_torrent= (torrent,path)  => { 
	tracker.getPeers(torrent,peers =>{
		// THE INFO PIECES IS A 20 BYTE sha-1 BUF and asking for 
		// pieces.length will provide pieces each beign 20 bytes
		// so to get real number we need to /20 (AKA FOR EVRY 20-bytes
		// OF THE PIECE BUFFER WE GET 1 PIECE ) 
		const pieces = new Pieces(torrent);
		const file = fs.openSync(path,'w');
		peers.forEach(peer => {
			download(peer,torrent,pieces,file);
			console.log('PEER: ',peer);
			})
		});
	};
	
export function download(peer,torrent,pieces,file){
	const socket = net.Socket();
	socket.on('error',console.log);
	socket.connect(peer.port,peer.ip, () => { 
		socket.write(message.makeHandsake(torrent));
	
	});
	const queue = new Queue.Queue(torrent);

	On_Message_Handle(socket,msg => msgHandler(msg,socket,pieces,queue));

};

function On_Message_Handle(socket,callback){
	let buf = buffer.alloc(0);
	let handsake = true;
	
	socket.on("Data",rcvedBuf =>{

		const msglen = () => handsake ? buf.readUint8(0)+49 : buf.readUint32BE(0)+4;
	
		buf =buffer.concat([buf,rcvedBuf]);
		while (buf.length >=4 && buf.length >=msglen()){
			callback(buf.slice(0,msglen()));
			buf =buf.slice(msglen());
			handsake = false;
		}
	});
};

function msgHandler(msg , socket, requested){
	if (isHandsake(msg)) {
		console.log('handsake done');
		socket.write(message.Intrested())
	}
	else { 
		const m = message.parse(msg);

		console.log('message',m);
		if (m.id === 0) chockeHandle();
		if (m.id === 1) unchockeHandle();
		if (m.id === 4) havehandle(m.payload,socket,requested,queue);
		if (m.id === 5)	bitfieldHandle(m.payload);
		if (m.id === 7) pieceHandle(m.payload,socket,requested,queue);
	}	
}

// MSGHANDLER HELPER METHODS:

function  chockeHandle(socket){
 	socket.end();
}


function unchockeHandle(socket,pieces,queue){
	// change the chocke of queue to false and start req
	queue.chocke = false;
	requestPiece(socket,pieces,queue)
}


// TODO :: MAKE YOUR OWN SOLUTION TO HAVEHANDLERS

function haveHandle(payload,socket,pieces,queue){
	const pieceIndex = payload.readUint32BE(0);
	const EmptyQueueChecker = queue.length === 0;
	queue.queue(pieceIndx);
	if (EmptyQueueChecker) requestPiece(socket,pieces,queue);

}
function bitfieldHandle(payload,socket,pieces,queue){

	const CheckQueueEmpty = queue.length === 0;
	payload.forEach( (byte,i) => {
		// 0%2 =0 1%2 =1;
		for (let j = 0 ; j<8;j++) {
			// this byte%2 will check if ****LAST**** bit of BYTE is 0 or 1 
			// if 1 meaning it has then i serves as offset by 1 byte
			// and then we add the piece index we are in (7-j) + the offset
			if (byte%2) queue.queue((i*8) + (7-j))
			byte = Math.floor(byte/2) // REMOVES THE LAST BIT FROM BYTE
		}
	});	
	if (CheckQueueEmpty) requestPiece(sockte,pieces,queue);
}



function pieceHandle(socket,pieces,queue,torrent ,PieceResp){
	console.log(PieceResp);
	pieces.add_received(PieceResp);


	const offset = PieceResp.index * torrent.info['piece length'] + PieceResp.begin;
	fs.write(file ,PieceResp,0,PieceResp.block.length,offset ,()=>{});

	if (pieces.Done()){
		socket.end();
		console.log("ARRR , YOU ARE A PIRATE");
	} else {
		requestPiece(soclet,pieces,queue);
	}

}



function requestPiece(socket,pieces,queue){

	if (queue.chocke) return null;

	while (queue.length()) {

		const Block = queue.deque();
		if (pieces.need_still(Block)){
			socket.write(message.Request(Block));
			pieces.add_requested(Block);
			break;	
		}
	}
}

function isHandsake(msg){

	return (msg.length === msg.readUint8(0) + 49) && (msg.toString('utf8',1)==='BitTorrent protocol')
}
