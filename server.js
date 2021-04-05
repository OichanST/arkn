"use strict";
// Express Package
const express = require("express");
const app = express();
// Server構築
const server = require("http").Server(app);
const PORT = process.env.PORT || 8080;
const pg = require("pg");
const conn = 
//"postgres://postgres:br9qs6wg@localhost:5432/postgres";
"postgres://rosndqtazwwzac:a066047b5ec4f8537219912347a5ef2155dc555c6475210d00593086a0800dde@ec2-184-72-235-80.compute-1.amazonaws.com:5432/d3ku61oage2jn9"
const pool = new pg.Pool({
	connectionString:conn,
	ssl:true
/*
	user:"rosndqtazwwzac",
	password:"a066047b5ec4f8537219912347a5ef2155dc555c6475210d00593086a0800dde",
	database:"d3ku61oage2jn9",
	port:5432,
	host:"ec2-184-72-235-80.compute-1.amazonaws.com",
*/
});
/*----------------------------------------------------------------------------*/
// IO Socket準備
const io = require("socket.io")(server);
// 接続時処理
io.on("connection", function(socket){
	socket.on("login", function(userId){
		pool.query("SELECT data FROM tooluser where id='" + userId + "'")
		.then(function(result){
			//console.log("query success id=" + userId);
			io.emit("result", result);
		})
		.catch(function(e){
			console.log("login error", e);
		});
	});
	socket.on("data", function(data){
		const userId = "ST";
		pool.query("UPDATE tooluser SET data='" + data + "' WHERE id='" + userId + "'")
		.then(function(result){
			//console.log("data update success id=" + userId);
			io.emit("result", result);
		})
		.catch(function(e){
			console.log("update error", e);
		});
	});
});
// 公開フォルダ設定
app.use(express.static(__dirname + '/public'));
// サーバー起動
server.listen(PORT,
	function(){
		console.log("Server Start (PORT=%d)", PORT);
	}
);
