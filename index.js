#!/usr/bin/env node

'use strict';

import * as fs from 'fs';
import * as tracker from "./tracker.js";
import bencode from 'bencode';
import * as  torrentParser from "./torrent-parser.js";
import * as dnl from './download.js';
import * as  Pieces from './pieces.js';

const torrent = torrentParser.open(process.argv[2]);
dnl.download_torrent(torrent,torrent.info.name);

//var url_parse = parse_url(torrent.announce.toString('utf8'));
//console.log(url_parse)
//
//
//const socket = dgram.createSocket('udp4');
//
//var myMsg = buff.from(torrent.info.pieces.toString("utf8"));
//console.log(myMsg);
//
//socket.send(myMsg,0,myMsg.length,url_parse.port,url_parse.host , ()=> {console.log("done:",myMsg.length,"bytes")});
//socket.on("message:",msg => { console.log("message is : " msg);});




