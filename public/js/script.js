"use strict";

const socket = io.connect();
let execute;
let serverData;
socket.on("disconnect", function(){
	socket.disconnect();
	location.reload();
});
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
	socket.emit(key, data);
}
// レーダーチャート用
let chartObj;
// ストレージデータ
let sto = new Storage("ArkNights");
// ストレージデータが空
if(sto.isEmpty){
	// ストレージデータの初期化
	sto.init(function(){
		// 初期化データ
		let ret = {};
		// オペレータループ
		for(let operatorName in operator){
			// 各オペレータの初期ハッシュを生成
			ret[operatorName] = {
				have:operatorName == "アーミヤ" ? true : false,
				promotion:0,
				lv:1,
				potential:0,
				trust:0,
				slv:1,
				sp:new Array(0,0,0)
			};
		}
		// 初期化データの返却
		return ret;
	});
}
// オーバレイウィンドウを除去するためのイベント処理をwindowに追加
window.onclick = function(){
	hide();
}
/**
 * 値変換
 */
function ValueConverter(name, key, val){
	// 戻り値
	let ret;
	// 項目による振り分け
	switch(key){
		// レアリティ
		case "rare":
			// 数値を★に変換
			return star(val);
		case "job":
			return "<img class='icon' src='icon/" + val + ".png'/>";
		// ステータス
		case "stat":
			// 該当の昇進段階のステータスを取得する
			const stat = val[sto.data[name].promotion];
			// ステータスループ
			for(let subKey in stat){
				if(subKey == "min" || subKey == "max" || subKey == "hp" || subKey == "atk" || subKey == "def" || subKey == "cost"){
					continue;
				}
				// 対応する項目を取得
				const elem = ById(subKey);
				// 対応する項目がある場合
				if(elem){
					let subVal = stat[subKey];
					// 値を変換して反映
					elem.innerHTML = ValueConverter(name, subKey, subVal);
				}
			}
			// 現在設定LV時点のステータスを計算
			const sta = calcLvStat(name);
			// コスト取得
			let cost = stat.cost;
			// コストダウンの発生有無
			let isCostDown = false;
			let enhanceNature1 = false;
			let enhanceNature2 = false;
			// 潜在データループ
			for(let i = 1; i < sto.data[name].potential; i++){
				// 対象の潜在能力取得
				const pt = operator[name].potential[i - 1];
				// コストダウン定義がされている場合
				if(typeof pt["cost"] != "undefined"){
					// コストダウンあり
					isCostDown = true;
					// コストを減らす　※－で設定されているので加算
					cost += pt["cost"];
				}else if(typeof pt["nature"] != "undefined"){
					if(pt.nature == 1){
						enhanceNature1 = true;
					}else if(pt.nature == 2){
						enhanceNature2 = true;
					}
				}
			}
			
			const arg = {
				atk:sta.atk,
				hp:sta.hp,
				def:sta.def,
				lv:sto.data[name].lv,
				promotion:sto.data[name].promotion,
				enhanceNature1:enhanceNature1,
				enhanceNature2:enhanceNature2
			};
			let html = (sto.data[name].trust >= 1 && operator[name].trust.hp) ? span(sta.hp, {color:"red"}) : sta.hp;
			if(operator[name].hpUp && operator[name].hpUp(arg) != null){
				html += "/" + Math.round(operator[name].hpUp(arg));
			}
			ById("hp").innerHTML = html;
			html = (sto.data[name].trust >= 1 && operator[name].trust.atk) ? span(sta.atk, {color:"red"}) : sta.atk
			if(operator[name].atkUp && operator[name].atkUp(arg) != null){
				html += "/" + Math.round(operator[name].atkUp(arg));
			}
			ById("atk").innerHTML = html;
			html = (sto.data[name].trust >= 1 && operator[name].trust.def) ? span(sta.def, {color:"red"}) : sta.def;
			if(operator[name].defUp && operator[name].defUp(arg) != null){
				html += "/" + Math.round(operator[name].defUp(arg));
			}
			ById("def").innerHTML = html;
			html = isCostDown ? span(cost, {color:"red"}) : cost;
			if(operator[name].costDown && operator[name].costDown(arg) != null){
				html += "/" + (cost + operator[name].costDown(arg));
			}
			ById("cost").innerHTML = html;
			// 何も返却しない　※何か返却すると該当領域に反映されるが、再帰処理の結果反映が行われるため不要
			return null;
		// 素質
		case "nature":
			// 戻り値の初期化
			ret = "";
			// 素質ループ
			for(let subKey in val){
				if(ret != ""){
					ret += "<br/>";
				}
				// タグを生成して追加
				ret += div(subKey, {display:"inline-block"}, {class:"whitelabel"});
			}
			// 結果を返却
			return ret;
		// 攻撃範囲
		case "range":
			// テーブル生成
			const t = Elem("TABLE");
			t.setAttribute("class", "rangeTable");
			// 攻撃範囲表示用のテーブルを初期生成する
			for(let y = -2; y <= 2; y++){
				const r = Elem("TR");
				t.appendChild(r);
				for(let x = -2; x <= 5; x++){
					const c = Cell("");
					c.style.width = "10px";
					c.style.height = "10px";
					// 中央部分を黒塗りにする
					if(x == 0 && y == 0){
						c.setAttribute("class", "center");
					}
					r.append(c);
				}
			}
			// 設定されている攻撃範囲情報を元に攻撃範囲内のセルに線を付ける
			for(let i = 0; i < val.length; i++){
				const valX = val[i][0] + 2;
				const valY = val[i][1] + 2;
				t.getElementsByTagName("TR")[valY].getElementsByTagName("TD")[valX].setAttribute("class", "isRange");
			}
			// 結果を返却
			return t.outerHTML;
		// 募集タグ
		case "tag":
			// 戻り値初期化
			ret = "";
			// 募集タグが無い場合、何もしない　※基本的にはあり得ない
			if(val.length <= 0)return;
			// 0番目（近距離or遠距離）のタグを生成
			ret += div(val[0], null, {class:"card center"});
			// 他のタグが設定されていない場合、ここで終わり
			if(val.length <= 1){
				return ret;
			}
			// 残りのタグの生成
			ret += "<div class='card center'>";
			for(let i = 1; i < val.length; i++){
				if(i > 1){
					ret += "&nbsp;"
				}
				ret += val[i];
			}
			ret += "</div>";
			// 結果を返却
			return ret;
		// 再配置時間
		case "relocation":
			if(val >= 200){
				return "とても遅い";
			}else if(val >= 70){
				return "遅い";
			}else{
				return "速い";
			}
		// 攻撃速度
		case "speed":
			if(val <= 0.9){
				return "とても速い";
			}else if(val <= 1){
				return "速い";
			}else if(val <= 1.2){
				return "普通";
			}else if(val <= 1.6){
				return "やや遅い"
			}else{
				return "遅い";
			}
		// 潜在
		case "potential":
			ret = "";
			for(let i = 0; i < val.length; i++){
				if(ret != ""){
					ret += "<br/>";
				}
				if(sto.data[name].potential - 1 <= i){
					ret += "<span style='color:#C0C0C0;'>";
				}
				for(let key in val[i]){
					switch(key){
						case "atk":
							ret += "攻撃力+";
							break;
						case "def":
							ret += "防御力+";
							break;
						case "relocation":
							ret += "再配置時間";
							break;
						case "cost":
							ret += "コスト";
							break;
						case "nature":
							ret += "素質強化";
							break;
					}
					if(key != "nature"){
						ret += val[i][key];
					}
					if(key == "relocation"){
						ret += "秒";
					}
				}
				if(sto.data[name].potential - 1 <= i){
					ret += "</span>";
				}
			}
			return ret;
		// スキル
		case "skill":
			ret = "";
			for(let sname in val){
				/*
				if(ret != ""){
					ret += "<br/>";
				}
				*/
				ret += div(sname, {marginLeft:"1em"});
			}
			return ret;
		// その他
		default:
			// 無編集で返却
			return val;
	}
}

/**
 * 数値→★変換　※レアリティ表示用
 */
function star(num){
	let ret = "";
	for(let i = 0; i < num; i++){
		ret += "★";
	}
	return ret;
}
/**
 * チェックされている値をリストで取得
 */ 
function getCheckedValue(chkList){
	
	const ret = new Array();
	
	for(let i = 0; i < chkList.length; i++){
		if(chkList[i].checked){
			ret.push(chkList[i].value);
		}
	}
	
	return ret;
}

function compare(){
	// 詳細を表示する
	ById("detail").style.display = "block";
	
	const t1 = operator[ById("t1").value];
	const t2 = operator[ById("t2").value];
	const tpro = ById("tpro").value;
	
	let lbl;
	switch(tpro){
		case "1":
			lbl = "昇進１";
			break;
		case "2":
			lbl = "昇進２";
			break;
	}
	
	if(!t1.stat[tpro]){
		alert(ById("t1").value + "に" + lbl + "はありません。");
		return;
	}
	if(!t2.stat[tpro]){
		alert(ById("t2").value + "に" + lbl + "はありません。");
		return;
	}
	// キャンバス取得
	const ctx = ById("chart").getContext("2d");
	// データセット
	const datasets = new Array();
	// データセットに初期段階(Lv1)のデータ追加
	const data1 = [
		t1.stat[tpro].hp,
		t1.stat[tpro].atk * 5,
		t1.stat[tpro].def * 5,
		t1.stat[tpro].cost * 100,
		t1.stat[tpro].res * 50
	];
	// データセットに初期段階(LvMax)のデータ追加
	const data2 = [
		t2.stat[tpro].hp,
		t2.stat[tpro].atk * 5,
		t2.stat[tpro].def * 5,
		t2.stat[tpro].cost * 100,
		t2.stat[tpro].res * 50
	];
	datasets.push({
		label:ById("t1").value,
		data:data1,
		backgroundColor:'rgba(200,200,255,0.5)',
		borderWidth:1
	});
	datasets.push({
		label:ById("t2").value,
		data:data2,
		backgroundColor:'rgba(255,200,200,0.5)',
		borderWidth:1
	});
	// レーダーチャートを生成
	if(chartObj){
		chartObj.destroy();
	}
	chartObj = new Chart(ctx, {
		type:"radar",
		data:{
			labels:["HP","攻撃力","防御力","コスト","術耐性"],
			datasets:datasets
		},
		options:{
			scale:{
				ticks:{
					display:false,
					min:0,
					max:5000
				}
			}
		}
	});
}

function toggleRangeBar(){
	if(ById("setLv").checked){
		ById("rangeBar").disabled = false;
		ById("rangeBar").value = 1;
		ById("nowLv").value = 1;
	}else{
		ById("rangeBar").disabled = true;
		ById("rangeBar").value = 1;
		ById("nowLv").value = null;
	}
}
/**
 * rangeスライダーと選択値を表示するinputのセットを生成
 */
function makeRangeSet(opt){
	// divタグの生成
	const div = Elem("div");
	// CSSclass指定
	div.setAttribute("class", "rangeSet");
	// rangeスライダーを生成
	const slider = Elem("input");
	slider.setAttribute("type", "range");
	if(opt.promotion != null){
		slider.setAttribute("class", "prom" + opt.promotion);
	}
	// 幅が指定されている場合、幅を適用
	if(opt.sliderWidth){
		slider.style.width = opt.sliderWidth + "px";
	}
	// 最小値、最大値、現在値の設定
	slider.setAttribute("min", opt.min);
	slider.setAttribute("max", opt.max);
	slider.setAttribute("value", opt.value);
	// 連動させるためのイベント処理の追加
	slider.addEventListener("input", function(eve){
		eve.target.nextSibling.value = eve.target.value;
		if(opt.func){
			opt.func();
		}
		event.stopPropagation();
	});
	// divタグにrangeスライダーを追加
	div.appendChild(slider);
	// 選択値を表示するためのinput(数値)生成
	const numInput = Elem("input");
	numInput.setAttribute("type", "number");
	// 幅が指定されている場合、幅を適用
	if(opt.numInputWidth){
		numInput.style.width = opt.numInputWidth + "px";
	}else{
		numInput.style.width = "3.0em";
	}
	// 最小値、最大値、現在値の設定
	numInput.setAttribute("min", opt.min);
	numInput.setAttribute("max", opt.max);
	numInput.setAttribute("value", opt.value);
	// 連動させるためのイベント処理の追加
	numInput.addEventListener("change", function(eve){
		eve.target.previousSibling.value = eve.target.value;
		if(opt.func){
			opt.func();
		}
		event.stopPropagation();
	});
	numInput.style.color = "rgb(" + (opt.value / opt.max * 255) + ",0,0)";
	// divタグにinputを追加
	div.appendChild(numInput);
	// divタグを返却
	return div;
}
/**
 * ローカルストレージハンドラ
 */
function Storage(id){
	// ローカルストレージに退避されているデータの取得
	// （存在している場合JSONオブジェクトへの変換）
	this.data = localStorage.getItem(id) != null ? JSON.parse(localStorage.getItem(id)) : null;
	/**
	 * ストレージデータクリア
	 */
	this.clear = function(){
		localStorage.removeItem(id);
	}
	/**
	 * ストレージデータ有無判定
	 */
	this.isEmpty = (this.data == null);
	/**
	 * ストレージデータ初期化
	 */
	this.init = function(initFunc){
		this.data = initFunc();
	}
	/**
	 * ストレージデータの保存
	 */
	this.save = function(){
		localStorage.setItem(id, JSON.stringify(this.data));
	}
}
/**
 * レアリティ別のLV最大値の計算
 */
function calcLvMax(rare, promotion){
	// レアリティによる分岐
	switch(rare){
		// レアリティ２以下
		case 1:
		case 2:
			// LV最大=30
			return 30;
		// レアリティ3
		case 3:
			switch(promotion){
				// 初期
				case 0:
					// LV最大=40
					return 40;
				// 昇進1
				case 1:
					// LV最大=55
					return 55;
			}
		// レアリティ4
		case 4:
			switch(promotion){
				// 初期
				case 0:
					// LV最大=45
					return 45;
				// 昇進1
				case 1:
					// LV最大=60
					return 60;
				// 昇進2
				case 2:
					// LV最大=70
					return 70;
			}
		// レアリティ5
		case 5:
			switch(promotion){
				// 初期
				case 0:
					// LV最大=50
					return 50;
				// 昇進1
				case 1:
					// LV最大=70
					return 70;
				// 昇進2
				case 2:
					// LV最大=80
					return 80;
			}
		// レアリティ6
		case 6:
			switch(promotion){
				// 初期
				case 0:
					// LV最大=60
					return 60;
				// 昇進1
				case 1:
					// LV最大=80
					return 80;
				// 昇進2
				case 2:
					// LV最大=90
					return 90;
			}
	}
}
/**
 * 指定レベル時点のステータス計算
 */
function calcLvStat(name){
	// 各最大値、最小値の取得
	let hpMin;
	let atkMin;
	let defMin;
	let hpMax;
	let atkMax;
	let defMax;
	// 現在LVの取得
	let nowLv = sto.data[name].lv;
	// 該当のオペレータのデータ取得
	const data = operator[name];
	// 昇進度の取得
	const promotion  = sto.data[name].promotion;
	// 潜在能力の取得
	const potential = sto.data[name].potential;
	// 最大LVを割り出す
	let lvMax = calcLvMax(data.rare, promotion);
	// 初期
	if(promotion == 0){
		hpMin = data.stat[promotion].min.hp;
		hpMax = data.stat[promotion].max.hp;
		atkMin = data.stat[promotion].min.atk;
		atkMax = data.stat[promotion].max.atk;
		defMin = data.stat[promotion].min.def;
		defMax = data.stat[promotion].max.def;
	// 昇進１
	}else if(promotion == 1){
		hpMin = data.stat[promotion - 1].max.hp;
		hpMax = data.stat[promotion].hp;
		atkMin = data.stat[promotion - 1].max.atk;
		atkMax = data.stat[promotion].atk;
		defMin = data.stat[promotion - 1].max.def;
		defMax = data.stat[promotion].def;
	// 昇進２
	}else{
		hpMin = data.stat[promotion - 1].hp;
		hpMax = data.stat[promotion].hp;
		atkMin = data.stat[promotion - 1].atk;
		atkMax = data.stat[promotion].atk;
		defMin = data.stat[promotion - 1].def;
		defMax = data.stat[promotion].def;
	}
	// 信頼度の取得
	let per = sto.data[name].trust;
	// 100を超える場合ステータスに影響は無い
	if(per > 100){
		per = 100;
	}
	// 現在HP、攻撃力、防御力の割り出し
	let nowHp = hpMin + Math.round((hpMax - hpMin) * (nowLv - 1) / (lvMax - 1));
	let nowAtk = atkMin + Math.round((atkMax - atkMin) * (nowLv - 1) / (lvMax - 1));
	let nowDef = defMin + Math.round((defMax - defMin) * (nowLv - 1) / (lvMax - 1));
	// 信頼度100以上
	if(sto.data[name].trust >= 1){
		if(data.trust.hp){
			nowHp += Math.round(data.trust.hp * per / 100);
		}
		if(data.trust.atk){
			nowAtk += Math.round(data.trust.atk * per / 100);
		}
		if(data.trust.def){
			nowDef += Math.round(data.trust.def * per / 100);
		}
	}
	// 潜在能力による強化
	for(let i = 1; i < potential; i++){
		
		const pt = data.potential[i - 1];
		
		if(typeof pt["hp"] != "undefined"){
			nowHp += pt["hp"];
		}else if(typeof pt["atk"] != "undefined"){
			nowAtk += pt["atk"];
		}else if(typeof pt["def"] != "undefined"){
			nowDef += pt["def"];
		}
	}
	// 結果返却
	return {
		hp:nowHp,
		atk:nowAtk,
		def:nowDef
	};
}
/**
 * DPS計算
 */
function calcDPS(name){
	// 該当オペレータのデータ取得
	const data = operator[name];
	// 各最大値、最小値の取得
	const stat = calcLvStat(name);
	// 昇進状態の取得
	const promotion = sto.data[name].promotion;
	// 潜在能力の取得
	const potential = sto.data[name].potential;
	// LVの取得
	const lv = sto.data[name].lv;
	// 潜在能力による素質1or2強化
	let enhanceNature1 = false;
	let enhanceNature2 = false;
	// 潜在能力による強化
	for(let i = 1; i < potential; i++){
		const pt = data.potential[i - 1];
		if(typeof pt["nature"] != "undefined"){
			if(pt.nature == 1){
				enhanceNature1 = true;
			}else if(pt.nature == 2){
				enhanceNature2 = true;
			}
		}
	}
	// 敵物理防御を取得
	let eneDef = ById("eneDef").value;
	// 数値変換
	if(eneDef){
		eneDef = parseInt(eneDef);
	}else{
		eneDef = 0;
	}
	// 敵術耐性を取得
	let eneRes = ById("eneRes").value;
	// 数値変換
	if(eneRes){
		eneRes = parseInt(eneRes);
	}else{
		eneRes = 0;
	}
	// 範囲内の敵数取得
	let eneCnt = ById("eneCnt").value;
	if(eneCnt){
		eneCnt = parseInt(eneCnt);
	}else{
		eneCnt = 1;
	}
	// 引数を作成
	const arg = {
      	atk:stat.atk,
      	promotion:promotion,
      	lv:lv,
      	block:data.stat[promotion].block,
    	eneDef:eneDef,
      	eneRes:eneRes,
      	eneCnt:eneCnt,
		enhanceNature1:enhanceNature1,
		enhanceNature2:enhanceNature2
	};
	// 素質による攻撃力強化分の計上
	if(operator[name].atkUp && operator[name].atkUp(arg) != null){
		stat.atk = operator[name].atkUp(arg);
	}
	// 攻撃回数
	const atkCnt = (operator[name].cnt && operator[name].cnt(arg) != null)
	               ? operator[name].cnt(arg)
	               : 1;
	// ダメージ値
	let dmg;
	// 術攻撃オペレータの場合
	if(data.job == "術師" || data.job == "補助" || name == "ムース"){
		dmg = (operator[name].dmg && operator[name].dmg(arg) != null)
		      ? operator[name].dmg(arg)
		      : Math.round(stat.atk * (100 - eneRes) / 100);
	// 医療オペレータの場合
	}else if(data.job == "医療"){
		// 単純に攻撃力で計算
		dmg = stat.atk;
	// それ以外＝物理攻撃オペレータの場合
	}else{
		dmg = (operator[name].dmg && operator[name].dmg(arg) != null)
		      ? operator[name].dmg(arg)
		      : stat.atk - eneDef;
	}
	// 範囲内の同時攻撃数
	const target = (operator[name].target && operator[name].target(arg) != null)
	               ? operator[name].target(arg)
	               : 1;
	// 保証ダメージの計算
	const limit = (operator[name].limitUp && operator[name].limitUp(arg) != null)
	              ? operator[name].limitUp(arg)
	              : 0.05;
	// 攻撃時のダメージ値が保証ダメージ未満の場合
	if(dmg < stat.atk * limit){
		// 保証ダメージによる計算
		dmg = parseInt(stat.atk * limit);
	}
	// 攻撃速度上昇
	const speedUp = (operator[name].speedUp && operator[name].speedUp(arg) != null)
	                ? operator[name].speedUp(arg)
	                : 0;
	// 攻撃間隔延長
	let intervalUp = 0;
	// スリップダメージ
	const slipDmg = (operator[name].slipDmg && operator[name].slipDmg(arg) != null)
	                ? operator[name].slipDmg(arg)
	                : 0;
	// DPSを計算して返却
	return Math.round(dmg * (Math.round((100 + speedUp) / (data.speed - intervalUp)) / 100) * atkCnt * target) + slipDmg;
}
/**
 * マトリクスの生成
 */
function makeMatrix(){

	const css = {display:"inline-block",width:"19px",textAlign:"right",paddingRight:"2px"};
	// レアリティ別集計リスト生成
	const matrix = new Array();
	const haveMatrix = new Array();
	const prom1Matrix = new Array();
	const prom2Matrix = new Array();
	// リストの初期化
	for(let i = 0; i < 6; i++){
		matrix.push({"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0});
		haveMatrix.push({"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0});
		prom1Matrix.push({"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0});
		prom2Matrix.push({"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0});
	}
	// オペレータループ
	for(let name in operator){
		// 要素取得
		const data = operator[name];
		// レアリティ＋職業別に集計
		matrix[data.rare - 1][data.job]++;
		// 所持している場合
		if(sto.data[name].have){
			// レアリティ＋職業別に集計
			haveMatrix[data.rare - 1][data.job]++;
		}
		if(sto.data[name].promotion >= 1){
			prom1Matrix[data.rare - 1][data.job]++;
		}
		if(sto.data[name].promotion >= 2){
			prom2Matrix[data.rare - 1][data.job]++;
		}
	}
	// テーブル生成
	const t = new Table("matrix").removeAll(true).caption("オペレータ総数/所持数/昇進1済/昇進2済");
	// ヘッダ行生成
	const hrow = new Row();
	// レアリティヘッダ
	hrow.addHeader("★");
	// 職業ヘッダ追加
	for(let job in matrix[0]){
		hrow.addHeader(job);
	}
	// ヘッダ行追加
	t.addHeader(hrow);
	// 職業別集計値
	const summary = {"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0};
	const haveSum =  {"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0};
	const prom1Sum = {"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0};
	const prom2Sum = {"先鋒":0,"前衛":0,"重装":0,"狙撃":0,"術師":0,"医療":0,"特殊":0,"補助":0};
	// 集計データループ
	for(let i = 0; i < matrix.length; i++){
		// 行生成
		const brow = new Row();
		// レアリティ追加
		brow.add(i + 1, {textAlign:"center"});
		
		// 各職業の件数追加
		for(let job in matrix[i]){
			summary[job] += matrix[i][job];
			haveSum[job] += haveMatrix[i][job];
			prom1Sum[job] += prom1Matrix[i][job];
			prom2Sum[job] += prom2Matrix[i][job];
			
			let txt = "";
			if(matrix[i][job] != 0){
				txt =
				span(matrix[i][job], css) + "/" + 
				span(haveMatrix[i][job], css);
				if(i >= 2){
					 txt += "/" + span(prom1Matrix[i][job], css);
				}else{
					txt += "/" + span("-", css);
				}
				if(i >= 3){
					txt += "/" + span(prom2Matrix[i][job], css);
				}else{
					txt += "/" + span("-", css);
				}
			}
			brow.add(txt);
		}
		// 行追加
		t.add(brow);
	}
	// 合計行追加
	const sumrow = new Row();
	// レアリティ列追加
	sumrow.add("ALL");
	// 各職業の合計追加
	for(let job in summary){
		sumrow.add(
			span(summary[job], css) + "/" + 
			span(haveSum[job], css) + "/" +
			span(prom1Sum[job], css) + "/" +
			span(prom2Sum[job], css)
		);
	}
	// 合計行をテーブルに追加
	t.add(sumrow);
}