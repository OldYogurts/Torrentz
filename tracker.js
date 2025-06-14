"use strict";
import dgram from 'dgram'; 
import Buffer from 'buffer';
import * as URL from 'url';
import * as torrentParser from "./torrent-parser.js";
import * as util from './util.js';
import bignum from 'bignum';
import crypto from 'crypto';


const buffer = Buffer.Buffer;
const urlParse = URL.parse;

export const getPeers = (torrent,callback)=> {
	const socket = dgram.createSocket("udp4");
	//const url = torrent.announce.toString("utf8");
	/**
	const textDecoder = new TextDecoder("utf-8");
	const url2 = textDecoder.decode(torrent.announce);
	console.log('url2:',urlParse(url2));
	*/	
	if (torrent['announce-list']){
		for (let list of torrent['announce-list']){
			udpSend(socket,buildConnectionReq(),list.toString());
			socket.on("message",(response) => {
			   if (RespType(response) === 'connect'){
				console.log("CONNECTED:");
				const connResp = ParseConnResp(response);
				
				console.log("CONN RESP \n",connResp);
				const announceReq = buildAnnounceReq(connResp.connection_id ,torrent);	
				console.log("ANNOUNCE REQ \n", announceReq);
				udpSend(socket,announceReq,list.toString());
				
			  } else if (RespType(response) === 'announce') {
				const announceResp = parseAnnounceResp(response);
				// CALLBACK IS AN ASYNC RETURN :
				// when we get in this if , and anounce resp is done
				// then CALLBACK will return
				callback(announceResp.peers);
				
			  }
	
		});
		}	
}; 
	//udpSend(socket,buildConnectionReq(),url);
	
             
};


function udpSend(socket,message,rawUrl , callback=()=>{}) {
		function parseURL(urlToParse){
			let url=urlToParse.split('58');
			let host = ((url[0]+'58').concat(url[1]).slice(0,-1)).split(',');
			let port = url[2];
	
			try {
				port = (port.split('47')[0].slice(0,-1).substring(1)).split(',');
				}
			catch {
				() => {};
				}
			
			let fin_host = '';
			let fin_port = '';
			for (let i = 0 ; i<host.length;i++){
				fin_host+=String.fromCharCode(host[i]);
			}
			for (let i=0;i<port.length;i++){
				fin_port += String.fromCharCode(port[i]);	
			}
			if (fin_host.includes('http')){
				fin_host+='/announce';
			}
			return {	
				host : String(fin_host),
				port : Number(fin_port)
				};
		}
		const url = parseURL(rawUrl);
		console.log(url.host,'\n',url.port);
		//socket.connect(url.port,url.host,()=>{console.log('message');});
		socket.send(message,0,message.length,url.port,url.host,() => {});
		}



// CONNECTION METHODS:
	
// connection request : 64-bit int: PROTOCOL ID // 0x4172710980
//			32-bit int: action 
//			32-bit int: transaction id 
// total of 16 bytes 
const t_id = crypto.randomBytes(4);
function buildConnectionReq(){
	const buf = buffer.alloc(16);
	//PROTOCOL_ID:
	// syntax write(xx,offset) writes 32 bits
	buf.writeUInt32BE(0x417,0);
	buf.writeUInt32BE(0x27101980,4);
	//action:
	buf.writeUInt32BE(0,8);
	// transaction
	const transaction_id = t_id;
	transaction_id.copy(buf,12);
	return buf;
}

function RespType(resp){
	const action = resp.readUInt32BE(0);
	if (action === 0) return 'connect';
	if (action === 1) return 'announce';
};

function ParseConnResp(resp){
return { action : resp.readUInt32BE(0),
	 transaction_id : resp.readUInt32BE(4),
	 connection_id : resp.slice(8)
	}
};


function buildAnnounceReq(connId,torrent , port=6881){
	const buf = buffer.alloc(98);
	connId.copy(buf,0);//64bits
	buf.writeUInt32BE(1,8);//32bits  -- action
	
	const trans_id = t_id;//32bits
	
 	trans_id.copy(buf,12);

	//rest of request
	
	//info_hash 
	const info_hash = torrentParser.info_Hash(torrent)
	info_hash.copy(buf,16);
	
	// peer_id 
	const peer_id = util.getId();
	peer_id.copy(buf,32);
	//downloaded
	const dnld=buffer.alloc(8);
	dnld.copy(buf,56);

	//left
	const left = torrentParser.size(torrent)
	left.copy(buf,64);
	
	//upload
	const upld = buffer.alloc(8);
	upld.copy(buf,72);

	//event 
	buf.writeUInt32BE(0,80);
	//ip addres 
	buf.writeUInt32BE(0,84);
	//key
	const key= crypto.randomBytes(4);
	key.copy(buf,88);
	//num_want
	buf.writeInt32BE(-1,92);
	//port
	buf.writeUInt16BE(port,96);
	return buf
}
	


function parseAnnounceResp(resp){
	function group(slize , size){
		let groups = [];
		for(let i = 0;i<slize.length;i+=size){
			groups.push(slize.slice(i,i+size));
		}
		return groups;
	}
	return { 
		action: resp.readUInt32BE(0),
		transactionID: resp.readUInt32BE(4),
		leechers: resp.readUInt32BE(8),
		seeders: resp.readUInt32BE(12),
		peers: group(resp.slice(20),6).map(
			address =>{
				    return{ ip: address.slice(0,4).join('.'),
					    port: address.readUInt16BE(4)
					  }
				  })
		}

}




