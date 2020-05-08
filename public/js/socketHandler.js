"use strict";

let execute;
let serverData;

socket.on("result", function(result){
	switch(execute){
		case "login":
			if(result.rowCount == 1){
				ById("loginForm").style.display = "none";
				ById("loginErr").style.display = "none";
				ById("main").style.display = "block";
				ById("serverAction").style.display = "block";
				if(result.rows[0].data != null && result.rows[0].data != ""){
					serverData = JSON.parse(result.rows[0].data);
				}
				init();
				makeMatrix();
			}else{
				ById("loginErr").style.display = "block";
			}
			break;
		case "data":
			break;
	}
});

function callServer(key, data){
	execute = key;
	const socket = io.connect();
	socket.emit(key, data);
	socket.disconnect();
}