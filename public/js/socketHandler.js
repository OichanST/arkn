"use strict";

// サーバー処理名
let execute;
// サーバーデータ
let serverData;

// ソケット接続
const socket = io.connect();

/**
 * サーバー処理コール
 */
function callServer(key, data){
	// 再接続処理
	if(!socket.connected){
		socket.connect();
	}
	// サーバー処理名を退避
	execute = key;
	// ソケットに処理取得後のハンドラを紐付ける
	socket.on("result", handleResult);
	// ソケットに処理送信
	socket.emit(key, data);
}

/**
 * サーバー処理結果の取得後の処理
 */
function handleResult(result){
	// サーバー処理名による振り分け
	switch(execute){
		// ログイン
		case "login":
			// 取得結果件数が1件だった場合
			if(result.rowCount == 1){
				// ログインフォームを非表示にする
				ById("loginForm").style.display = "none";
				ById("loginErr").style.display = "none";
				// メイン画面を表示
				ById("main").style.display = "block";
				// サーバーアクション（データロード／セーブ）の表示
				ById("serverAction").style.display = "block";
				// サーバーデータがある場合
				if(result.rows[0].data != null && result.rows[0].data != ""){
					// サーバーデータをパースして退避
					serverData = JSON.parse(result.rows[0].data);
				}
				// 初期表示処理の実行
				init();
				// 集計データの作成
				makeMatrix();
			// 取得結果なしor複数件
			}else{
				// ログインエラー
				ById("loginErr").style.display = "block";
			}
			break;
		// 保存
		case "data":
			// Do Nothing
			break;
	}
}
