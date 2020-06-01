"use strict";
// モバイル判定
let isMobile = false;
// 画像のスライド処理中にアクションを制御するためのフラグ
let slideFlg = false;
// 求人募集対象オペレーター
let recluteOperator = {};
// オペレーターの中から求人募集対象のオペレーターのみを抽出する
for(let name in operator){
	if(operator[name].recruitment){
		recluteOperator[name] = JSON.parse(JSON.stringify(operator[name]));
	}
}

/**
 * 初期表示処理
 */
function init(){
	// windowサイズによりPCかスマホかを判別
    if (window.matchMedia("(max-width:480px)").matches) {
        //スマホ処理
        isMobile = true;
    }
	// 入力フォームの取得
	const f = document.forms[0];
	// チェックされている表示形式の取得
	const type = f.type.value;
	// チェックされているレアリティの取得
	const rareChk = getCheckedValue(f.rare);
	// チェックされている職業の取得
	const jobChk = getCheckedValue(f.job);
	// リストヘッダを初期化して取得
	const thead = new Table("listHeader").removeAll(true);
	// オペレーター一覧を初期化して取得
	const t = new Table("operator").removeAll();
	// リストヘッダ行生成
	const hrow = new Row();
	// オペレーター管理
	if(type == "1"){
		// 設定ボタン表示
		ById("btnSetting").style.display = "block";
		// オペレーター一覧表示
		ById('operatorList').style.display = 'block';
		// モバイルの場合
		if(!isMobile){
			// 集計結果の表示
			ById('matrixArea').style.display = 'block';
		}
		// 求人募集検索の非表示
		ById('tagSearch').style.display = 'none';
		// モバイルの場合
		if(isMobile){
			// サイズを画面フルに設定
			thead.size("100%");
			ById("wrapper").style.width = "calc(100% - 1px)";
		// PCの場合
		}else{
			// サイズ調整
			thead.size("70.0em");
			ById("wrapper").style.width = "calc(70em - 1px)";
		}
		ById("dmgGraphArea").style.display = "none";
		// ヘッダ生成
		hrow.addHeader("所持", {width:"2.9em"});
		if(isMobile){
			hrow.addHeader("ﾚｱ", {width:"1.5em"});
		}else{
			hrow.addHeader("レア度", {width:"6.0em"});
		}
		hrow.addHeader("コードネーム", {width:"9.5em"});
		hrow.addHeader("職業", {width:isMobile ? "" : "2.5em"});
		if(!isMobile){
			hrow.addHeader("昇進", {width:"3.8em"});
			hrow.addHeader("レベル", {width:"11.1em"});
			hrow.addHeader("潜在", {width:"2.5em"});
			hrow.addHeader("信頼度", {width:"11.7em"});
			hrow.addHeader("スキルRANK");
		}
	// 一覧
	}else if(type == "2"){
		// 設定ボタン表示
		ById("btnSetting").style.display = "block";
		// オペレーター一覧表示
		ById('operatorList').style.display = 'block';
		// モバイルの場合
		if(!isMobile){
			// 集計結果の表示
			ById('matrixArea').style.display = 'block';
		}
		// 求人募集検索の非表示
		ById('tagSearch').style.display = 'none';
		// モバイルの場合
		if(isMobile){
			// サイズを画面フルに設定
			thead.size("100%");
			ById("wrapper").style.width = "calc(100% - 1px)";
		// PCの場合
		}else{
			// サイズ調整
			thead.size("51.3em");
			ById("wrapper").style.width = "calc(51.3em - 1px)";
		}
		ById("dmgGraphArea").style.display = "none";
		// ヘッダ生成
		hrow.addHeader("レア度", {width:"6.0em"});
		hrow.addHeader("コードネーム", {width:"9.5em"});
		hrow.addHeader("職業", {width:"2.5em"});
		hrow.addHeader("昇進", {width:"5.5em"});
		hrow.addHeader("HP", {width:"3.0em"});
		hrow.addHeader("攻撃力", {width:"3.0em"});
		hrow.addHeader("防御力", {width:"3.0em"});
		hrow.addHeader("術耐性", {width:"3.0em"});
		hrow.addHeader("ｺｽﾄ", {width:"2.0em"});
		hrow.addHeader("ﾌﾞﾛｯｸ");
	// 求人募集検索
	}else if(type == "3"){
		// 設定ボタンの非表示
		ById("btnSetting").style.display = "none";
		// オペレーター一覧の非表示
		ById('operatorList').style.display = 'none';
		// 集計情報の非表示
		ById('matrixArea').style.display = 'none';
		// 求人募集検索の表示
		ById('tagSearch').style.display = 'block';
		
		ById("dmgGraphArea").style.display = "none";
		// 処理終了
		return;
	}else if(type == "4"){
	
		const opeSel = ById("graphOperator");

		opeSel.innerHTML = "";

		for(let name in operator){
			opeSel.appendChild(new Option(name, name));
		}
		
		setGraphSkill();
		// 設定ボタンの表示
		ById("btnSetting").style.display = "block";
		// オペレーター一覧の非表示
		ById('operatorList').style.display = 'none';
		// 集計情報の非表示
		ById('matrixArea').style.display = 'none';
		// 求人募集検索の非表示
		ById('tagSearch').style.display = 'none';
		
		ById("dmgGraphArea").style.display = "block";
	}
	// リストヘッダに行追加
	thead.addHeader(hrow);
	// 戦力比較用　※今は非表示
	const t1 = ById("t1");
	t1.innerHTML = "";
	// 戦力比較用　※今は非表示
	const t2 = ById("t2");
	t2.innerHTML = "";
	// ソート用の配列準備
	const sortedOperator = new Array();
	// オペレーターループ
	for(let name in operator){
		// キーをnameとして埋め込みソート用の配列にコピーしたデータを退避する
		const data = JSON.parse(JSON.stringify(operator[name]));
		data["name"] = name;
		// オペレータが追加された場合のストレージデータの追加
		if(!sto.data[name]){
			sto.data[name] = {
				have:false,
				promotion:0,
				lv:1,
				potential:1,
				trust:0,
				slv:1,
				sp:new Array(0,0,0),
				img:0
			};
		}
		sortedOperator.push(data);
	}
	// ソートキーの取得
	const sortKey = ById("f").sort.value;
	// ソート実行
	sortedOperator.sort(function(a,b){
		const aName = a.name;
		const bName = b.name;
		const astat = calcLvStat(aName);
		const bstat = calcLvStat(bName);
		// ソート条件による分岐
		switch(sortKey){
			// レアリティ
			case "rare":
				if(b.rare != a.rare){
					return b.rare - a.rare;
				}else{
					if(sto.data[bName].promotion != sto.data[aName].promotion){
						return sto.data[bName].promotion - sto.data[aName].promotion;
					}
					return sto.data[bName].lv - sto.data[aName].lv;
				}
			// 攻撃力
			case "atk":
				return bstat.atk - astat.atk;
			// 防御力
			case "def":
				return bstat.def - astat.def;
			// HP
			case "hp":
				return bstat.hp - astat.hp;
			// DPS
			case "dps":
				return calcDPS(bName, false) - calcDPS(aName, false);
			// 物理耐久
			case "pend":
				return (bstat.hp + bstat.def) - (astat.hp + astat.def);
			// 術耐久
			case "aend":
				return Math.round(bstat.hp * (100 / (100 - operator[bName].stat[sto.data[bName].promotion].res))) - Math.round(astat.hp * (100 / (100 - operator[aName].stat[sto.data[aName].promotion].res)));
			// LV
			case "lv":
				if(sto.data[bName].promotion != sto.data[aName].promotion){
					return sto.data[bName].promotion - sto.data[aName].promotion;
				}
				return sto.data[bName].lv - sto.data[aName].lv;
			// 信頼度
			case "trust":
				return sto.data[bName].trust - sto.data[aName].trust;
		}
		// 上記条件に該当しない場合、データまま
		return 0;
	});
	// オペレーターループ
	for(let i = 0; i < sortedOperator.length; i++){
		// 要素取得
		const operatorName = sortedOperator[i].name;
		// 対象オペレーター情報の取得
		const data = operator[operatorName];
		// チェックされていないレアリティの場合
		if(rareChk.indexOf(String(data.rare)) < 0){
			// 次のオペレーターへ
			continue;
		}
		// チェックされていない職業の場合
		if(jobChk.indexOf(data.job) < 0){
			// 次のオペレーターへ
			continue;
		}
		// 行生成（処理用に属性としてオペレーター名を付与）
		const r = new Row().attr("name", operatorName);
		// オペレーター管理
		if(type == "1"){
			// 所持状態取得
			const haveOperator = sto.data[operatorName].have;
			// 所持していない場合
			if(!haveOperator){
				// 行を非活性化
				r.attr("class", "notHave");
			}
			// アーミヤ
			if(operatorName == "アーミヤ"){
				// 絶対持っているので所持ボタンを無効化
				r.add("<label><input type='checkbox' disabled='disabled' " + (haveOperator ? "checked": "") + "><span>所持</span></label>", {width:"2.9em"});
			// アーミヤ以外
			}else{
				// 所持ボタン生成
				r.add("<label><input type='checkbox' " + (haveOperator ? "checked": "") + " onchange='changeHave();'><span>所持</span></label>", {width:"2.9em"});
			}
			// レアリティセル追加
			if(isMobile){
				r.add(data.rare, {textAlign:"center", width:"1.5em"});
			}else{
				r.add(star(data.rare), {width:"6.0em"});
			}
			// オペレーター名セル追加
			let nameCss = {cursor:"pointer"};
			nameCss["width"] = "9.5em";
			r.add(operatorName, nameCss, null, function(){
				// オペレーター一覧のクラス定義のリセット
				new Table("operator").clear();
				// 選択行の設定
				event.target.setAttribute("class", "selected");
				// モバイル
				if(isMobile){
					// 選択行のオペレーターのコードネーム退避
					ById("name").innerText = findRow(event.target).getAttribute("name");
					// モバイル用メニュー表示
					ById("selectorForMobile").style.display = "block";
				// PC
				}else{
					// 詳細画面表示
					showDetail(findRow(event.target).getAttribute("name"));
				}
			});
			// 職業セル追加
			r.add(data.job, {textAlign:"center", width:isMobile ? "" : "2.5em"});
			// モバイル端末ならここまで
			if(isMobile){
				// オペレーター一覧に行追加
				t.add(r);
				continue;
			}
			// 昇進選択リスト
			let sel = Elem("select");
			let optList = [
				{label:"", value:"0"},
			];
			// レアリティ３以上
			if(data.rare >= 3){
				// 昇進１を追加
				optList.push({label:"昇進１", value:"1"});
			}
			// レアリティ４以上
			if(data.rare >= 4){
				// 昇進２を追加
				optList.push({label:"昇進２", value:"2"});
			};
			// レアリティ３以上の場合
			if(data.rare >= 3){
				// 昇進選択リストを生成
				for(let i = 0; i < optList.length; i++){
					const opt = new Option(optList[i].label, optList[i].value);
					if(sto.data[operatorName].promotion == optList[i].value){
						opt.selected = true;
					}
					sel.appendChild(opt);
				}
				sel.setAttribute("value", sto.data[operatorName].promotion);
				// レアリティ4以上
				if(data.rare >= 4){
					sel.style.color = "rgb(" + Math.round(sto.data[operatorName].promotion / 2 * 255) + ",0,0)";
				// レアリティ3以下
				}else{
					sel.style.color = "rgb(" + Math.round(sto.data[operatorName].promotion * 255) + ",0,0)";
				}
				// 変更時処理の追加
				sel.addEventListener("change", changePromotion);
				// セル追加
				r.add(sel, {textAlign:"center", width:"3.8em"});
			// レアリティ２以下
			}else{
				// 昇進選択不可
				r.add("&nbsp;", {width:"3.8em"});
			}
			// LVスライダーセット
			r.add(
				makeRangeSet({
					value:sto.data[operatorName].lv,
					min:1,
					max:calcLvMax(data.rare, sto.data[operatorName].promotion),
					func:changeLv,
					numInputWidth:38,
					promotion:sto.data[operatorName].promotion
				}),
				{width:"11.1em"}
			);
			// 潜在選択リスト生成
			sel = Elem("select");
			// リスト選択値
			optList = [
				{label:"1",value:1},
				{label:"2",value:2},
				{label:"3",value:3},
				{label:"4",value:4},
				{label:"5",value:5},
				{label:"6",value:6}
			];
			// 潜在リスト選択生成
			for(let i = 0; i < optList.length; i++){
				const opt = new Option(optList[i].label, optList[i].value);
				if(sto.data[operatorName].potential == optList[i].value){
					opt.selected = true;
				}
				sel.appendChild(opt);
			}
			sel.setAttribute("value", sto.data[operatorName].potential);
			sel.style.color = "rgb(" + Math.round(sto.data[operatorName].potential / 6 * 255) + ",0,0)";
			sel.addEventListener("change", changePotential);
			r.add(sel, {textAlign:"center",width:"2.5em"});
			// 信頼度スライダーセット生成
			r.add(
				makeRangeSet({
					value:sto.data[operatorName].trust,
					min:1,
					max:200,
					func:changeTrust
				}),
				{width:"11.7em"}
			);
			// レアリティ3以上
			if(data.rare > 2){
				// スキルレベルコンボ生成
				sel = Elem("select");
				optList = [
					{label:1,value:1},
					{label:2,value:2},
					{label:3,value:3},
					{label:4,value:4}
				];
				if(sto.data[operatorName].promotion >= 1){
					optList.push({label:5,value:5});
					optList.push({label:6,value:6});
					optList.push({label:7,value:7});
				}
				for(let i = 0; i < optList.length; i++){
					const opt = new Option(optList[i].label, optList[i].value);
					if(sto.data[operatorName].slv == optList[i].value){
						opt.selected = true;
					}
					sel.appendChild(opt);
				}
				sel.setAttribute("value", sto.data[operatorName].slv);
				// 配色設定
				sel.style.color = "rgb(" + Math.round(sto.data[operatorName].slv / 7 * 255) + ",0,0)";
				// 変更時イベント登録
				sel.addEventListener("change", changeSlv);
				// セル追加
				r.add(sel, {textAlign:"center",width:"2.5em"});
				// スキルレベル7且つ昇進2の場合
				if(sto.data[operatorName].slv == 7 && sto.data[operatorName].promotion == 2){
					// スキル特化機能の有効化
					r.add("<button onclick='showSkillSp();'>スキル特化</button>");
				// 上記以外
				}else{
					// スキル特化機能の無効化
					r.add("<button onclick='showSkillSp();' disabled>スキル特化</button>");
				}
			// レアリティ2以下
			}else{
				// スキルなし＋スキル特化なし
				r.add("");
				r.add("");
			}
			// オペレーター一覧に行追加
			t.add(r);
		// 一覧
		}else if(type == "2"){
			// 行数の計算
			let rsp = 2;
			if(data.rare >= 4){
				rsp = 4;
			}else if(data.rare >= 3){
				rsp = 3;
			}
			// レアリティセル追加
			r.add(star(data.rare), {width:"6.0em"}, {rowSpan:rsp});
			// オペレーター名セル追加
			r.add(operatorName, {cursor:"pointer", width:"9.5em"}, {rowSpan:rsp}, function(){
				new Table("operator").clear();
				event.target.setAttribute("class", "selected");
				showDetail(findRow(event.target).getAttribute("name"));
			});
			// 職業セル追加
			r.add(data.job, {textAlign:"center", width:"2.5em"}, {rowSpan:rsp});
			
			t.add(detailSet(r, "初期Lv1", data.stat[0], "min"));
			
			t.add(detailSet(new Row(), "初期LvMax", data.stat[0], "max"));
			// レアリティ3以上
			if(data.rare >= 3){
				t.add(detailSet(new Row(), "昇進１", data.stat[1]));
			}
			// レアリティ4以上
			if(data.rare >= 4){
				t.add(detailSet(new Row(), "昇進２", data.stat[2]));
			}
		}
		// 戦力比較用コンボにコードネーム追加　※現在本機能は非表示
		t1.appendChild(new Option(operatorName, operatorName));
		t2.appendChild(new Option(operatorName, operatorName));
	}
	/**
	 * 一覧形式での詳細行作成
	 */
	function detailSet(r, label, data, subKey){
		r.add(label, {width:"5.5em"});
		if(subKey){
			r.add(data[subKey].hp, {textAlign:"right", width:"3.0em"});
			r.add(data[subKey].atk, {textAlign:"right", width:"3.0em"});
			r.add(data[subKey].def, {textAlign:"right", width:"3.0em"});
		}else{
			r.add(data.hp, {textAlign:"right", width:"3.0em"});
			r.add(data.atk, {textAlign:"right", width:"3.0em"});
			r.add(data.def, {textAlign:"right", width:"3.0em"});
		}
		if(subKey == "min" || !subKey){
			r.add(data.res, {textAlign:"right", width:"3.0em"}, subKey == "min" ? {rowSpan:2} : null);
			r.add(data.cost, {textAlign:"right", width:"2.0em"}, subKey == "min" ? {rowSpan:2} : null);
			r.add(data.block, {textAlign:"right"}, subKey == "min" ? {rowSpan:2} : null);
		}
		return r;
	}
}

let imgList;
let dispNum;
/**
 * 詳細表示
 */
function showDetail(name){
	hide();
	ById("skillSp").style.display = "none";
	slideFlg = false;
	// 該当のオペレーターのデータ取得
	const data = operator[name];

	
	imgList = new Array();
	let img = Elem("img");
	img.setAttribute("src", "image/" + data.en + ".png");
	imgList.push(img);
	if(name == "アーミヤ"){
		// イメージタグ生成
		img = Elem("img");
		img.setAttribute("src", "image/" + data.en + "_1.png");
		imgList.push(img);
	}
	img = Elem("img");
	img.setAttribute("src", "image/" + data.en + "_2.png");
	imgList.push(img);
	
	if(data.outfit){
		for(let i = 0; i < data.outfit.length; i++){
			img = Elem("img");
			img.setAttribute("src", "image/" + data.en + "_" + data.outfit[i] + ".png");
			imgList.push(img);
		}
	}
	
	if(!sto.data[name].img){
		sto.data[name].img = 0;
	}
	
	ById("img").innerHTML = "";
	ById("img").appendChild(imgList[sto.data[name].img]);
	// イメージのオーバレイの色彩設定
	ById("imageBack").setAttribute("class", "rare" + data.rare);
	// オペレーター名反映
	ById("name").innerText = name;
	// 素質、スキルをクリア　※素質なしの場合、クリアしておかないと前に選択されているオペレーターの素質が残る
	ById("nature").innerHTML = "";
	ById("skill").innerHTML = "";
	ById("cond").innerHTML = "";
	ById("effect").innerHTML = "-";
	ById("lv").innerText = sto.data[name].lv;
	if(sto.data[name].promotion == 1){
		ById("promotion").style.display = "block";
		ById("promotion").setAttribute("src", "icon/promotion1.png");
	}else if(sto.data[name].promotion == 2){
		ById("promotion").style.display = "block";
		ById("promotion").setAttribute("src", "icon/promotion2.png");
	}else{
		ById("promotion").style.display = "none";
	}
	ById("maxLv").innerText = calcLvMax(operator[name].rare, sto.data[name].promotion);
	ById("rank").innerText = sto.data[name].slv;
	// オペレーターデータループ
	for(let key in data){
		// 対応する項目を取得
		const elem = ById(key);
		// 対応する項目がある場合
		if(elem){
			// 値を変換する
			const html = ValueConverter(name, key, data[key]);
			// 変換結果がある場合
			if(html != null){
				// 変換結果を対応する項目に反映する
				elem.innerHTML = html;
			}
		}
	}
	// 各最大値、最小値の取得
	const stat = calcLvStat(name);
	// 潜在能力による素質1or2強化
	let enhanceNature1 = false;
	let enhanceNature2 = false;
	let resAdd = 0;
	// 潜在能力による強化
	for(let i = 1; i < sto.data[name].potential; i++){
		const pt = data.potential[i - 1];
		if(typeof pt["res"] != "undefined"){
			resAdd += pt.res;
		}
		if(typeof pt["nature"] != "undefined"){
			if(pt.nature == 1){
				enhanceNature1 = true;
			}else if(pt.nature == 2){
				enhanceNature2 = true;
			}
		}
	}
	// 処理に渡す引数を生成
	const arg = {
		hp:stat.hp,
		atk:stat.atk,
		def:stat.def,
		lv:sto.data[name].lv,
		promotion:sto.data[name].promotion,
		enhanceNature1:enhanceNature1,
		enhanceNature2:enhanceNature2
	};
	let html;
	// 物理耐久
	if(data.defUp && data.defUp(arg) != null){
		html = (stat.hp + stat.def) + "/<span class='merit'>" + Math.round(stat.hp + data.defUp(arg));
		if(data.cond && data.cond(arg)){
			html += "<sup>※</sup>";
		}
		html += "</span>";
	}else{
		html = stat.hp + stat.def;
	}
	
	ById("pEndurance").innerHTML = html;
	// 術耐久
	let res = data.stat[sto.data[name].promotion].res + resAdd;
	arg["res"] = res;
	if(data.resUp && data.resUp(arg) != null){
		res = data.resUp(arg);
	}
	ById("aEndurance").innerHTML = Math.round(stat.hp * (100 / (100 - res)));
	// DPS
	if(data.cond && data.cond(arg)){
		const nonCondDPS = calcDPS(name, false);
		const condDPS = calcDPS(name, true);
		if(nonCondDPS != condDPS){
			ById("dps").innerHTML = nonCondDPS + "/<span class='merit'>" + condDPS + "<sup>※</sup></span>";
		}else{
			ById("dps").innerHTML = nonCondDPS;
		}
	}else{
		ById("dps").innerHTML = calcDPS(name, false);
	}
	if(data.guardUp && data.guardUp(arg) != null){
		ById("guardDisp").style.display = "flex";
		ById("guard").innerHTML = data.guardUp(arg) + "%";
	}else{
		ById("guardDisp").style.display = "none";
	}
	if((data.pDodgeUp && data.pDodgeUp(arg) != null) || (data.aDodgeUp && data.aDodgeUp(arg) != null)){
		ById("dodgeDisp").style.display = "flex";
		if(
			(data.pDodgeUp && data.pDodgeUp(arg) != null) ||
			(data.npDodgeUp && data.npDodgeUp(arg) != null)
		){
			if(data.pDodgeUp && data.pDodgeUp(arg) != null){
				ById("pDodge").innerHTML = data.pDodgeUp(arg) + "%";
			}else if(data.npDodgeUp && data.npDodgeUp(arg) != null){
				ById("pDodge").innerHTML = data.npDodgeUp(arg) + "%(近接攻撃のみ)";
			}
		}else{
			ById("pDodge").innerHTML = "0%";
		}
		if(data.aDodgeUp && data.aDodgeUp(arg) != null){
			ById("aDodge").innerHTML = data.aDodgeUp(arg) + "%";
		}else{
			ById("aDodge").innerHTML = "0%";
		}
	}else{
		ById("dodgeDisp").style.display = "none";
	}
	// 詳細を表示する
	ById("detail").style.display = "block";
	// モバイルの場合
	if(isMobile){
		// イベント伝播の停止
		event.stopPropagation();
		// 処理中断
		return;
	}
	/*------------------------------------------------*/
	
	// キャンバス取得
	const ctx = ById("chart").getContext("2d");
	// 信頼度取得
	let per = sto.data[name].trust;
	// 信頼度100以上は全適用になる
	if(per > 100){
		per = 100;
	}
	// データセット
	const datasets = new Array();
	// 初期段階(Lv1)のデータ生成
	const data0 = [
		data.stat[0].min.hp,
		data.stat[0].min.atk * 5,
		data.stat[0].min.def * 5,
		data.stat[0].cost * 100,
		data.stat[0].res * 50
	];
	// 信頼度MAXが押されている場合
	if(sto.data[name].trust >= 1){
		// 信頼度データ取得
		const trust = data.trust;
		// 各パラメータに信頼度の増分を加える
		for(let key in trust){
			switch(key){
				case "hp":
					data0[0] = data0[0] + Math.round(trust[key] * per / 100);
					break;
				case "atk":
					data0[1] = data0[1] + Math.round(trust[key] * per / 100) * 5;
					break;
				case "def":
					data0[2] = data0[2] + Math.round(trust[key] * per / 100) * 5;
					break;
			}
		}
	}
	// データセットに初期段階(Lv1)のデータ追加
	datasets.push({
		label:"Lv1",
		data:data0,
		backgroundColor:'rgba(170,170,225,0.5)',
		borderWidth:1
	});
	// 初期段階(LvMax)のデータ生成
	const data1 = [
		data.stat[0].max.hp,
		data.stat[0].max.atk * 5,
		data.stat[0].max.def * 5,
		data.stat[0].cost * 100,
		data.stat[0].res * 50
	];
	// 信頼度100以上の場合
	if(sto.data[name].trust >= 1){
		// 信頼度による補正を加える
		const trust = data.trust;
		for(let key in trust){
			switch(key){
				case "hp":
					data1[0] = data1[0] + Math.round(trust[key] * per / 100);
					break;
				case "atk":
					data1[1] = data1[1] + Math.round(trust[key] * per / 100) * 5;
					break;
				case "def":
					data1[2] = data1[2] + Math.round(trust[key] * per / 100) * 5;
					break;
			}
		}
	}
	// データセットに初期段階(LvMax)のデータ追加
	datasets.push({
		label:(data.rare >= 3 ? "LvMax/昇進1Lv1" : "LvMax"),
		data:data1,
		backgroundColor:'rgba(200,200,255,0.5)',
		borderWidth:1
	});
	// レアリティが3以上の場合　※2以下は昇進なし
	if(data.rare >= 3){
		// 昇進１段階(LvMax)のデータ生成
		const data2 = [
			data.stat[1].hp,
			data.stat[1].atk * 5,
			data.stat[1].def * 5,
			data.stat[1].cost * 100,
			data.stat[1].res * 50
		];
		// 信頼度による補正
		if(sto.data[name].trust >= 1){
			const trust = data.trust;
			for(let key in trust){
				switch(key){
					case "hp":
						data2[0] = data2[0] + Math.round(trust[key] * per / 100);
						break;
					case "atk":
						data2[1] = data2[1] + Math.round(trust[key] * per / 100) * 5;
						break;
					case "def":
						data2[2] = data2[2] + Math.round(trust[key] * per / 100) * 5;
						break;
				}
			}
		}
		// データセットに昇進１段階(LvMax)のデータ追加
		datasets.push({
			label:(data.rare >= 4 ? "昇進1LvMax/昇進2Lv1" : "昇進1LvMax"),
			data:data2,
			backgroundColor:'rgba(200,255,200,0.5)',
			borderWidth:1
		});
	}
	// レアリティが4以上の場合　※3以下は昇進２なし
	if(data.rare >= 4){
		// 昇進２段階(LvMax)
		const data3 = [
			data.stat[2].hp,
			data.stat[2].atk * 5,
			data.stat[2].def * 5,
			data.stat[2].cost * 100,
			data.stat[2].res * 50
		];
		// 信頼度による補正
		if(sto.data[name].trust >= 1){
			const trust = data.trust;
			for(let key in trust){
				switch(key){
					case "hp":
						data3[0] = data3[0] + Math.round(trust[key] * per / 100);
						break;
					case "atk":
						data3[1] = data3[1] + Math.round(trust[key] * per / 100) * 5;
						break;
					case "def":
						data3[2] = data3[2] + Math.round(trust[key] * per / 100) * 5;
						break;
				}
			}
		}
		// データセットに昇進２段階(LvMax)のデータ追加
		datasets.push({
			label:"昇進２LvMax",
			data:data3,
			backgroundColor:'rgba(255,200,200,0.5)',
			borderWidth:1
		});
	}
	// 既にチャートが生成されている場合、破棄
	// ※これをやらないと前の描画分が残る
	if(chartObj){
		chartObj.destroy();
	}
	// レーダーチャートを生成
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
	// イベント伝播の停止
	event.stopPropagation();
}

/**
 * 素質詳細の表示
 */
function showNature(){
	// スキル詳細が表示されている場合、非表示
	if(ById("skillDetailOverlay").style.display == "block"){
		ById("skillDetailOverlay").style.display = "none";
	}
	// 対象オペレータ名の取得
	const name = ById("name").innerText;
	// 表示領域取得
	const detail = ById("natureDetail");
	// 対象オペレータの素質を取得
	let nature = operator[name].stat[sto.data[name].promotion].nature;
	let next1Natures = null;
	if(operator[name].rare == 2 && sto.data[name].lv < 30){
		next1Natures = Object.keys(nature);
		nature = {};
	}else if(operator[name].rare >= 3 && sto.data[name].promotion == 0){
		next1Natures = Object.keys(operator[name].stat[1].nature);
	}else if(operator[name].rare > 3 && sto.data[name].promotion == 1){
		next1Natures = Object.keys(operator[name].stat[2].nature);
	}
	let next2Natures = null;
	if(operator[name].rare > 3 && sto.data[name].promotion == 0){
		next2Natures = Object.keys(operator[name].stat[2].nature);
	}
	// 潜在能力による素質1or2強化
	let enhanceNature1 = false;
	let enhanceNature2 = false;
	// 潜在能力による強化
	for(let i = 1; i < sto.data[name].potential; i++){
		const pt = operator[name].potential[i - 1];
		if(typeof pt["nature"] != "undefined"){
			if(pt.nature == 1){
				enhanceNature1 = true;
			}else if(pt.nature == 2){
				enhanceNature2 = true;
			}
		}
	}
	// HTML
	let html = div("素質詳細", {fontSize:"1.8em", marginBottom:"0.2em", color:"gray"});
	let idx = 1;
	// 素質ループ
	for(let natureName in nature){
		// 改行の追加
		if(idx > 1){
			html += "<br/><br/>";
		}
		// 素質の追加
		html += div(natureName, {display:"inline-block"}, {class:"whitelabel"});
		if(operator[name].rare >= 3 && sto.data[name].promotion == 0){
			html += "<span class='merit' style='margin-left:0.5em;'>昇進段階1強化</span>";
		}else if(operator[name].rare > 3 && sto.data[name].promotion == 1){
			html += "<span class='merit' style='margin-left:0.5em;'>昇進段階2強化</span>";
		}else if(operator[name].rare == 3 && sto.data[name].promotion == 1 && sto.data[name].lv < 55){
			html += "<span class='merit' style='margin-left:0.5em;'>昇進段階1レベル55強化</span>";
		}
		html += "<br/>";
		let exp = nature[natureName].exp;
		if(
			(idx == 1 && enhanceNature1) ||
			(idx == 2 && enhanceNature2)
		){
			if(nature[natureName].base && nature[natureName].base.length){
				for(let i = 0; i < nature[natureName].base.length; i++){
					let base = nature[natureName].base[i];
					if(operator[name].rare == 3 && sto.data[name].lv == 55){
						base += nature[natureName].lv55[i];
					}
					while(exp.indexOf("@base" + i) >= 0){
						exp = exp.replace("@base" + i, base + nature[natureName].padd[i]);
					}
					while(exp.indexOf("@pexp" + i) >= 0){
						exp = exp.replace("@pexp" + i, "<span class='charge'>" + nature[natureName].pexp[i].replace("@padd", nature[natureName].padd[i]) + "</span>");
					}
				}
			}else{
				let base = nature[natureName].base;
				if(operator[name].rare == 3 && sto.data[name].lv == 55){
					base += nature[natureName].lv55;
				}
				while(exp.indexOf("@base") >= 0){
					exp = exp.replace("@base", base + nature[natureName].padd);
				}
				while(exp.indexOf("@pexp") >= 0){
					exp = exp.replace("@pexp", "<span class='charge'>" + nature[natureName].pexp.replace("@padd", nature[natureName].padd) + "</span>");
				}
			}
		}else{
			if(nature[natureName].base && nature[natureName].base.length){
				for(let i = 0; i < nature[natureName].base.length; i++){
					let base = nature[natureName].base[i];
					if(operator[name].rare == 3 && sto.data[name].lv == 55){
						base += nature[natureName].lv55[i];
					}
					while(exp.indexOf("@base" + i) >= 0){
						exp = exp.replace("@base" + i, base);
					}
					while(exp.indexOf("@pexp" + i) >= 0){
						exp = exp.replace("@pexp" + i, "");
					}
				}
			}else{
				let base = nature[natureName].base;
				if(operator[name].rare == 3 && sto.data[name].lv == 55){
					base += nature[natureName].lv55;
				}
				while(exp.indexOf("@base") >= 0){
					exp = exp.replace("@base", base);
				}
				while(exp.indexOf("@pexp") >= 0){
					exp = exp.replace("@pexp", "");
				}
			}
		}
		html += exp;
		idx++;
	}
	if(next1Natures){
		for(let i = idx - 1; i < next1Natures.length; i++){
			// 改行の追加
			if(idx > 1){
				html += "<br/><br/>";
			}
			html += div(next1Natures[i], {display:"inline-block"}, {class:"graylabel"});
			if(operator[name].rare >= 3){
				if(sto.data[name].promotion == 0){
					html += "<span style='margin-left:0.5em;color:gray;'>昇進段階1開放</span>";
				}else if(sto.data[name].promotion == 1){
					html += "<span style='margin-left:0.5em;color:gray;'>昇進段階2開放</span>";
				}
			}else{
				html += "<span style='margin-left:0.5em;color:gray;'>レベル30開放</span>";
			}
			idx++;
		}
	}
	if(next2Natures){
		for(let i = idx - 1; i < next2Natures.length; i++){
			// 改行の追加
			if(idx > 1){
				html += "<br/><br/>";
			}
			html += div(next2Natures[i], {display:"inline-block"}, {class:"graylabel"});
			html += "<span style='margin-left:0.5em;color:gray;'>昇進段階2開放</span>";
			idx++;
		}
	}
	// HTML反映
	detail.innerHTML = html;
	if(isMobile){
		detail.style.top = (window.scrollY + 100) + "px";
	}
	// 素質詳細の表示
	detail.style.display = "block";
	// イベント伝播の停止
	event.stopPropagation();
}
/**
 * スキル詳細の表示
 */
function showSkill(){
	// 素質詳細が表示されている場合、非表示
	if(ById("natureDetail").style.display == "block"){
		ById("natureDetail").style.display = "none";
	}
	// オペレータ名取得
	const name = ById("name").innerText;
	// オペレータデータ取得
	const data = operator[name];
	// スキルデータ取得
	const sdata = data.skill;
	if(Object.keys(sdata).length <= 0){
		// イベント伝播の停止
		event.stopPropagation();
		return;
	}
	// スキルレベル取得
	const slv = sto.data[name].slv;
	ById("skillRank").innerText = slv;
	// スキル特化取得
	let sp = sto.data[name].sp;
	// スキル特化データのnullpo防止
	if(!sp){
		sp = new Array(0,0,0);
	}
	// 潜在能力による素質1or2強化
	let enhanceNature1 = false;
	let enhanceNature2 = false;
	// 潜在能力による強化
	for(let i = 1; i < sto.data[name].potential; i++){
		const pt = operator[name].potential[i - 1];
		if(typeof pt["nature"] != "undefined"){
			if(pt.nature == 1){
				enhanceNature1 = true;
			}else if(pt.nature == 2){
				enhanceNature2 = true;
			}
		}
	}
	let eneDef = ById("eneDef").value;
	if(eneDef){
		eneDef = parseInt(eneDef, 10);
	}else{
		eneDef = 0;
	}
	let eneRes = ById("eneRes").value;
	if(eneRes){
		eneRes = parseInt(eneRes, 10);
	}else{
		eneRes = 0;
	}
	// HTML
	let html = "";
	// ループカウンタ
	let i = 0;
	// スキルデータループ
	for(let sname in sdata){
		// タグ生成
		html += "<div class='flex' style='margin-bottom:0.5em;'>";
		// スキル特化の設定がされている場合
		if(slv == 7){
			html += "<div style='background-color:rgba(160,160,160,0.9);text-align:center;'>";
			switch(sp[i]){
				case 0:
					html += "<div style='margin-left:30px;margin-right:30px;margin-top:30px;'>";
					html += "<svg width='55' height='55'>";
					html += "<path d='M25 10 L20 20 L25 30 L35 30 L40 20 L35 10 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M15 30 L10 40 L15 50 L25 50 L30 40 L25 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M35 30 L30 40 L35 50 L45 50 L50 40 L45 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M30  0 L25 10 L35 10 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M20 20 L15 30 L25 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M10 40 L5  50 L15 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M40 20 L35 30 L45 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M50 40 L45 50 L55 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M25 30 L35 30 L30 40 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M30 40 L25 50 L35 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "</svg>";
					html += "</div>";
					html += "<div style='font-size:11px;font-family:Courier'>MASTER RANK<br/><span style='font-size:16px;'>０</span></div>";
					break;
				case 1:
					html += "<div style='margin-left:30px;margin-right:30px;margin-top:30px;'>";
					html += "<svg width='55' height='55'>";
					html += "<path d='M25 10 L20 20 L25 30 L35 30 L40 20 L35 10 Z' style='fill:rgba(255,255,255,1);stroke:white;'></path>";
					html += "<path d='M15 30 L10 40 L15 50 L25 50 L30 40 L25 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M35 30 L30 40 L35 50 L45 50 L50 40 L45 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M30  0 L25 10 L35 10 Z' style='fill:rgba(255,0,0,1);stroke:white;'></path>";
					html += "<path d='M20 20 L15 30 L25 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M10 40 L5  50 L15 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M40 20 L35 30 L45 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M50 40 L45 50 L55 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M25 30 L35 30 L30 40 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M30 40 L25 50 L35 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "</svg>";
					html += "</div>";
					html += "<div style='font-size:11px;font-family:Courier'>MASTER RANK<br/><span style='font-size:16px;'>Ⅰ</span></div>";
					break;
				case 2:
					html += "<div>";
					html += "<svg width='55' height='55'>";
					html += "<path d='M25 10 L20 20 L25 30 L35 30 L40 20 L35 10 Z' style='fill:rgba(255,255,255,1);stroke:white;'></path>";
					html += "<path d='M15 30 L10 40 L15 50 L25 50 L30 40 L25 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M35 30 L30 40 L35 50 L45 50 L50 40 L45 30 Z' style='fill:rgba(255,255,255,1);stroke:white;'></path>";
					html += "<path d='M30  0 L25 10 L35 10 Z' style='fill:rgba(255,0,0,1);stroke:white;'></path>";
					html += "<path d='M20 20 L15 30 L25 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M10 40 L5  50 L15 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M40 20 L35 30 L45 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M50 40 L45 50 L55 50 Z' style='fill:rgba(255,0,0,1);stroke:white;'></path>";
					html += "<path d='M25 30 L35 30 L30 40 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M30 40 L25 50 L35 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "</svg>";
					html += "</div>";
					html += "<div style='font-size:11px;font-family:Courier'>MASTER RANK<br/><span style='font-size:16px;'>Ⅱ</span></div>";
					break;
				case 3:
					html += "<div>";
					html += "<svg width='55' height='55'>";
					html += "<path d='M25 10 L20 20 L25 30 L35 30 L40 20 L35 10 Z' style='fill:rgba(255,255,255,1);stroke:white;'></path>";
					html += "<path d='M15 30 L10 40 L15 50 L25 50 L30 40 L25 30 Z' style='fill:rgba(255,255,255,1);stroke:white;'></path>";
					html += "<path d='M35 30 L30 40 L35 50 L45 50 L50 40 L45 30 Z' style='fill:rgba(255,255,255,1);stroke:white;'></path>";
					html += "<path d='M30  0 L25 10 L35 10 Z' style='fill:rgba(255,0,0,1);stroke:white;'></path>";
					html += "<path d='M20 20 L15 30 L25 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M10 40 L5  50 L15 50 Z' style='fill:rgba(255,0,0,1);stroke:white;'></path>";
					html += "<path d='M40 20 L35 30 L45 30 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M50 40 L45 50 L55 50 Z' style='fill:rgba(255,0,0,1);stroke:white;'></path>";
					html += "<path d='M25 30 L35 30 L30 40 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "<path d='M30 40 L25 50 L35 50 Z' style='fill:rgba(0,0,0,0);stroke:white;'></path>";
					html += "</svg>";
					html += "</div>";
					html += "<div style='font-size:11px;font-family:Courier'>MASTER RANK<br/><span style='font-size:16px;'>Ⅲ</span></div>";
					break;
			}
			html += "</div>";
		}
		html += "<div class='flex' style='width:38em;background-color:rgba(0,0,0,0.6);box-shadow:2px 2px 4px black;'>";
		html += "<div style='position:relative;text-align:center;'>";
		html += "<img src='skill/" + sname + ".png' style='width:90px;margin-top:1em;'/>";
		if(sdata[sname].effect[slv - 1 + sp[i]]){
			if(sdata[sname].effect[slv - 1 + sp[i]].start){
				html += "<div class='flex' style='width:30px;position:absolute;background-color:rgba(0,0,0,1);font-size:11px;color:white;margin-left:72px;margin-top:-14px;box-shadow:-1px -1px 2px black;";
				html += "z-index:55'>";
				html += "<div><svg width='10' height='10' style='display:inline-block;margin-left:0.3em;'><path d='M0 0 L10 5 L0 10 Z' style='fill:white'></path></svg></div>";
				html += "<div style='margin-left:0.1em;margin-right:0.1em;'>" + sdata[sname].effect[slv - 1 + sp[i]].start + "</div>";
				html += "</div>";
			}
			if(sdata[sname].effect[slv - 1 + sp[i]].need){
				html += "<div class='flex' style='width:30px;position:absolute;background-color:rgba(0,0,0,1);font-size:11px;color:white;margin-left:106px;margin-top:-14px;box-shadow:-1px -1px 2px black;";
				html += "z-index:55'>";
				html += "<div><img src='icon/lightning.png' width='12'></div>";
				html += "<div style='margin-left:0.1em;margin-right:0.1em;'>" + sdata[sname].effect[slv - 1 + sp[i]].need + "</div>";
				html += "</div>";
			}
		}
		html += div(sname, {textAlign:"center",margin:"3px",width:"150px"});
		html += "</div>";
		html += "<div>";
		html += "<div class='flex' style='margin-top:1em;'>";
		// パッシブスキルの場合
		if(sdata[sname].passive){
			html += card("パッシブ");
		}else{
			// スキルの回復方法の文字変換
			switch(sdata[sname].recover){
				case "auto":
					html += card("自動回復", {backgroundColor:"rgb(160,205,64)"});
					break;
				case "attack":
					html += card("攻撃回復", {backgroundColor:"rgb(255,128,64)"});
					break;
				case "damage":
					html += card("被撃回復", {backgroundColor:"#FFCC00"});
					break;
			}
			// スキルの発動方法の文字変換
			switch(sdata[sname].activate){
				case "auto":
					html += card("自動発動");
					break;
				case "manual":
					html += card("手動発動");
					break;
			}
		}
		if(sdata[sname].effect[slv - 1] && sdata[sname].effect[slv - 1].pers > 0){
			html += "<div class='flex' style='border-radius:5px;background-color:gray;color:white;margin:0.15em;padding-top:2px;padding-bottom:0;height:26px;'>"
			html += "<div><img src='icon/clock.png' width='24'></div>";
			html += "<div style='margin-left:5px;margin-right:2px;'>" + sdata[sname].effect[slv - 1 + sp[i]].pers + "秒</div>";
			html += "</div>";
		}
		const arg = calcLvStat(name);
		arg["speed"] = operator[name].speed;
		if(!operator[name].cond){
			const subArg = {
				atk:arg.atk,
				def:arg.def,
				hp:arg.hp,
				promotion:sto.data[name].promotion,
				enhanceNature1:enhanceNature1,
				enhanceNature2:enhanceNature2
			};
			if(operator[name].atkUp && operator[name].atkUp(subArg)){
				arg.atk = operator[name].atkUp(subArg);
			}
			if(operator[name].defUp && operator[name].defUp(subArg)){
				arg.def = operator[name].defUp(subArg);
			}
			if(operator[name].hpUp && operator[name].hpUp(subArg)){
				arg.hp = operator[name].hpUp(subArg);
			}
			if(operator[name].speedUp && operator[name].speedUp(subArg)){
				arg.speed = arg.speed * 100 / (100 + operator[name].speedUp(subArg));
			}
		}
		
		let inner = "";
		let dpsFlg = false;
		let skillAtk = arg.atk;
		let skillSpd = arg.speed;
		const eff = sdata[sname].effect[slv - 1 + sp[i]];
		if(eff.atk){
			skillAtk = Math.round(arg.atk * eff.atk / 100);
			inner += "&nbsp;ATK:" + skillAtk;
			dpsFlg = true;
		}
		if(eff.atkadd){
			skillAtk = Math.round(arg.atk * (1 + eff.atkadd / 100));
			inner += "&nbsp;ATK:" + skillAtk;
			dpsFlg = true;
		}
		if(eff.def){
			inner += "&nbsp;DEF:" + Math.round(arg.def * eff.def / 100);
		}
		if(eff.defadd){
			inner += "&nbsp;DEF:" + Math.round(arg.def * (1 + eff.defadd / 100));
		}
		if(eff.hp){
			inner += "&nbsp;HP:" + Math.round(arg.hp * eff.hp / 100);
		}
		if(eff.hpadd){
			inner += "&nbsp;HP:" + Math.round(arg.hp * (1 + eff.hpadd / 100));
		}
		if(eff.speed || eff.interval || eff.intervaladd){
			let spd = eff.speed ? eff.speed : 0;
			let intervaladd = eff.intervaladd ? eff.intervaladd : 0;
			let interval = eff.interval ? eff.interval : 1;
			skillSpd = Math.round((arg.speed + intervaladd) * interval * (100 / (100 + spd)) * 100) / 100;
			inner += "&nbsp;SPD:" + skillSpd + "sec";
			dpsFlg = true;
		}
		if(dpsFlg && (eff.pers || sdata[sname].passive || sdata[sname].infinity)){
			let cnt = 1;
			if(eff.cnt){
				cnt = eff.cnt;
			}
			if(data.job == "術師" || data.job == "補助" || name == "ムース" || name == "アステシア" || sdata[sname].res){
				inner += "&nbsp;DPS:" + Math.round((skillAtk / skillSpd) * cnt * ((100 - eneRes) / 100));
			}else if(data.job == "医療" || sdata[sname].heal){
				inner += "&nbsp;DPS:" + (Math.round(skillAtk / skillSpd) * cnt);
			}else if(sdata[sname].multi){
				inner += "&nbsp;DPS:" + (Math.round(skillAtk / skillSpd - eneDef) * cnt + Math.round((skillAtk / skillSpd) * cnt * ((100 - eneRes) / 100)));
			}else{
				inner += "&nbsp;DPS:" + (Math.round(skillAtk / skillSpd - eneDef) * cnt);
			}
		}else if(dpsFlg){
			let cnt = 1;
			if(eff.cnt){
				cnt = eff.cnt;
			}
			if(data.job == "術師" || data.job == "補助" || name == "ムース" || name == "アステシア" || sdata[sname].res){
				inner += "&nbsp;DMG:" + (Math.round(skillAtk * cnt * ((100 - eneRes) / 100)));
			}else if(data.job == "医療" || sdata[sname].heal){
				inner += "&nbsp;DMG:" + (Math.round(skillAtk) * cnt);
			}else if(sdata[sname].multi){
				inner += "&nbsp;DMG:" + (Math.round(skillAtk - eneDef) * cnt + Math.round(skillAtk * cnt * ((100 - eneRes) / 100)));
			}else{
				inner += "&nbsp;DMG:" + (Math.round(skillAtk - eneDef) * cnt);
			}
		}
		if(inner != ""){
			html += "<div style='padding-top:0.5em;font-size:0.8em;'>" + inner + "</div>";
		}
		html += "</div>";
		// スキルの説明取得
		let exp = sdata[sname].exp;
		for(var key in eff){
			if(exp.indexOf("@" + key) >= 0){
			　　while(exp.indexOf("@" + key) >= 0){
					exp = exp.replace("@" + key, eff[key]);
				}
			}
		}
		// スキル説明の反映
		html += div(exp, {height:"5em"});
		html += "</div>";
		html += "</div>";
		html += "</div>";
		// ループカウンタのインクリメント
		i++;
	}
	// HTML反映
	ById("skillDetail").innerHTML = html;
	// スキル詳細の表示
	ById("skillDetailOverlay").style.display = "block";
	// イベント伝播の停止
	event.stopPropagation();
}
/**
 * オーバレイの非表示処理
 */
function hide(){
	// フラグ
	let flg = false;
	// 素質詳細が表示されている場合、非表示
	if(ById("natureDetail").style.display != "none"){
		ById("natureDetail").style.display = "none";
		flg = true;
	}
	// スキル詳細が表示されている場合、非表示
	if(ById("skillDetailOverlay").style.display != "none"){
		ById("skillDetailOverlay").style.display = "none";
		flg = true;
	}
	if(ById("materialArea").style.display != "none"){
		ById("materialArea").style.display = "none";
		flg = true;
	}
	// 上記いずれも表示されていなかった場合
	if(!flg){
		// オペレータ詳細を非表示
		ById("detail").style.display = "none";
		// リストの選択状態をリセット
		new Table("operator").clear();
	}
}
/**
 * 所持変更
 */
function changeHave(){
	change('have');
	makeMatrix();
}
/**
 * 昇進変更
 */
function changePromotion(){
	change('promotion');
	makeMatrix();
}
/**
 * LV変更
 */
function changeLv(){
	change('lv');
}
/**
 * 潜在変更
 */
function changePotential(){
	change('potential');
}
/**
 * 信頼度変更
 */
function changeTrust(){
	change('trust');
}
/**
 * スキルレベル変更
 */
function changeSlv(){
	change('slv');
}
/**
 * 汎用変更処理
 */
function change(key){
	let operatorName;
	let r;
	if(isMobile){
		operatorName = ById("name").innerText;
	}else{
		// アクション対象の行を特定
		r = findRow(event.target);
		// 行に設定されているオペレータ名の取得
		operatorName = r.getAttribute("name");
	}
	// 値
	let targetValue;
	// キーによる分岐
	switch(key){
		// 所持
		case "have":
			// チェックボックスなのでcheckedを取得
			targetValue = event.target.checked;
			if(r){
				// チェックされている場合
				if(event.target.checked){
					// クラス定義を消して未所持状態を解除
					r.removeAttribute("class");
				// チェックされていない場合
				}else{
					// 未所持状態のクラス定義を追加
					r.setAttribute("class", "notHave");
				}
			}
			break;
		case "promotion":
			// 入力されている値を数値変換して取得
			targetValue = parseInt(event.target.value);
			if(operatorName == "アーミヤ"){
				sto.data[operatorName]["img"] = targetValue;
			}else{
				sto.data[operatorName]["img"] = (targetValue != 2 ? 0 : 1);
			}
			break;
		// 所持以外
		default:
			// 入力されている値を数値変換して取得
			targetValue = parseInt(event.target.value);
			break;
	}
	// ストレージへ反映
	sto.data[operatorName][key] = targetValue;
	// ストレージデータの保存
	sto.save();
	// 昇進の変更の場合
	if(isMobile){
		if(key == "promotion"){
			let divide = 1;
			if(operator[operatorName].rare >= 4){
				divide = 2;
			}
			const selects = ById("s_promotion").getElementsByTagName("select");
			selects[0].style.color = "rgb(" + Math.round(selects[0].value / divide * 255) + ",0,0)";
			
			ById("s_slv").getElementsByTagName("select")[0].innerHTML = "";
			let max = 4;
			if(targetValue >= 1){
				max = 7;
			}
			for(let i = 1; i <= max; i++){
				let opt = new Option(i, i);
				if(sto.data[operatorName].slv == i){
					opt.selected = true;
				}
				ById("s_slv").getElementsByTagName("select")[0].appendChild(opt);
			}
			// 該当レアリティ、昇進状態による最大Lvを取得
			const lvMax = calcLvMax(operator[operatorName].rare, sto.data[operatorName].promotion);
			// Lvの最大値を更新
			let inputs = ById("s_lv").getElementsByTagName("input");
			inputs[0].max = lvMax;
			inputs[0].setAttribute("class", "prom" + sto.data[operatorName].promotion);
			inputs[1].max = lvMax;
			inputs[1].style.color = "rgb(" + Math.round((inputs[1].value / inputs[1].max) * 255) + ",0,0)";
			
			if(targetValue == 2 && sto.data[operatorName].slv == 7){
				ById("s_ssp").style.display = "block";
			}else{
				ById("s_ssp").style.display = "none";
			}
		}else if(key == "lv"){
			// 行にある入力を取得
			const inputs = ById("s_lv").getElementsByTagName("input");
			inputs[1].style.color = "rgb(" + Math.round((inputs[1].value / inputs[1].max) * 255) + ",0,0)";
		}else if(key == "potential"){
			const selects = ById("s_potential").getElementsByTagName("select");
			selects[0].style.color = "rgb(" + Math.round(selects[0].value / 6 * 255) + ",0,0)";
		}else if(key == "trust"){
			const inputs = ById("s_trust").getElementsByTagName("input");
			inputs[1].style.color = "rgb(" + Math.round((inputs[1].value / inputs[1].max) * 255) + ",0,0)";
		}else if(key == "slv"){
			const selects = ById("s_slv").getElementsByTagName("select");
			selects[0].style.color = "rgb(" + Math.round(selects[0].value / 7 * 255) + ",0,0)";

			if(targetValue == 7 && sto.data[operatorName].promotion == 2){
				ById("s_ssp").style.display = "block";
			}else{
				ById("s_ssp").style.display = "none";
			}
		}
	}else{
		if(key == "promotion"){
			const selects = r.getElementsByTagName("select");
			let divide = 1;
			if(operator[operatorName].rare >= 4){
				divide = 2;
			}
			selects[0].style.color = "rgb(" + Math.round(selects[0].value / divide * 255) + ",0,0)";
			
			selects[2].innerHTML = "";
			let max = 4;
			if(targetValue >= 1){
				max = 7;
			}
			for(let i = 1; i <= max; i++){
				let opt = new Option(i, i);
				if(sto.data[operatorName].slv == i){
					opt.selected = true;
				}
				selects[2].appendChild(opt);
			}
			// 行にある入力を取得
			const inputs = r.getElementsByTagName("input");
			// 該当レアリティ、昇進状態による最大Lvを取得
			const lvMax = calcLvMax(operator[operatorName].rare, sto.data[operatorName].promotion);
			// Lvの最大値を更新
			inputs[1].max = lvMax;
			inputs[1].setAttribute("class", "prom" + sto.data[operatorName].promotion);
			inputs[2].max = lvMax;
			inputs[2].style.color = "rgb(" + Math.round((inputs[2].value / inputs[2].max) * 255) + ",0,0)";
			
			const btn = r.getElementsByTagName("button")[0];
			
			if(targetValue == 2 && sto.data[operatorName].slv == 7){
				btn.disabled = false;
			}else{
				btn.disabled = true;
			}
		}else if(key == "lv"){
			// 行にある入力を取得
			const inputs = r.getElementsByTagName("input");
			inputs[2].style.color = "rgb(" + Math.round((inputs[2].value / inputs[2].max) * 255) + ",0,0)";
		}else if(key == "potential"){
			const selects = r.getElementsByTagName("select");
			selects[1].style.color = "rgb(" + Math.round(selects[1].value / 6 * 255) + ",0,0)";
		}else if(key == "trust"){
			const inputs = r.getElementsByTagName("input");
			inputs[4].style.color = "rgb(" + Math.round((inputs[4].value / inputs[4].max) * 255) + ",0,0)";
		}else if(key == "slv"){
			const selects = r.getElementsByTagName("select");
			selects[2].style.color = "rgb(" + Math.round(selects[2].value / 7 * 255) + ",0,0)";
			const btn = r.getElementsByTagName("button")[0];
			
			if(targetValue == 7 && sto.data[operatorName].promotion == 2){
				btn.disabled = false;
			}else{
				btn.disabled = true;
			}
		}
	}
}
/**
 * スキル特化オーバレイ表示
 */
function showSkillSp(){
	// 行特定
	const r = findRow(event.target);
	// オペレータ名取得
	const name = r.getAttribute("name");
	// スキルデータ取得
	const sdata = operator[name].skill;
	// スキルデータ未設定の場合、何もしない
	if(!sdata || sdata.length <= 0){
		return;
	}
	// ストレージからスキル特化データ取得
	let spData = sto.data[name].sp;
	// 未設定の場合の初期化
	if(!spData){
		spData = new Array(0,0,0);
	}
	// 表示内容リセット
	ById("skillSpBody").innerHTML = null;
	// ループカウンタ
	let i = 0;
	// スキルデータループ
	for(let sname in sdata){
		// divタグ生成
		const div = Elem("div");
		div.setAttribute("class", "flex");
		const nameArea = Elem("div");
		nameArea.style.width = "10em";
		nameArea.style.marginTop = "0.6em";
		nameArea.innerText = sname;
		div.appendChild(nameArea);
		// 選択スライダーを生成
		div.appendChild(makeRangeSet({
			value:spData[i],
			min:0,
			max:3,
			func:changeSkillSp.bind(null, name),
			sliderWidth:35,
			numInputWidth:30
		}));
		ById("skillSpBody").appendChild(div);
		i++;
	}
	// ボタン表示情報取得
	const rect = event.target.getBoundingClientRect();
	// スキル特化オーバレイ表示
	ById("skillSp").style.display = "block";
	// スキル特化オーバレイ表示情報取得
	const spRect = ById("skillSp").getBoundingClientRect();
	// スキル特化オーバレイの表示位置調整
	ById("skillSp").style.top = rect.top + "px";
	ById("skillSp").style.left = (rect.left + spRect.width) + "px";
}
/**
 * スキル特化変更
 */
function changeSkillSp(name){
	// 対象のスキル名を取得
	const targetSname = event.target.parentNode.previousSibling.innerText;
	// ループカウンタ
	let i = 0;
	// スキルデータループ
	for(let sname in operator[name].skill){
		// 対象のスキル名と合致している場合
		if(sname == targetSname){
			// ストレージからスキル特化データ取得
			let spData = sto.data[name].sp;
			// 未設定の場合のヌルポ防止
			if(!spData){
				spData = new Array(0,0,0);
			}
			// 入力値を数値変換して反映
			spData[i] = parseInt(event.target.value);
			// ストレージに書き戻す
			sto.data[name].sp = spData;
			// ストレージの保存
			sto.save();
		}
		i++;
	}
}
function checkNum(){
	const val = event.target.value;
	if(isNaN(parseInt(val, 10))){
		ById("errMessage").innerText = "数値で入力して下さい";
		ById("errMessage").style.display = "block";
		return false;
	}
	const iVal = parseInt(val, 10);
	const min = event.target.min;
	const max = event.target.max;
	if(iVal < min || max < iVal){
		ById("errMessage").innerText = min + "～" + max + "の間で指定して下さい";
		ById("errMessage").style.display = "block";
		return false;
	}
	ById("errMessage").style.display = "none";
	return true;
}
function enterLogin(){
	if(event.keyCode == 13){
		login();
	}
}
function login(){
	callServer("login", ById("userId").value);
}
function guestLogin(){
	ById("loginForm").style.display = "none";
	ById("loginErr").style.display = "none";
	ById("main").style.display = "block";
	init();
	makeMatrix();
}
function loadServer(){
	if(serverData){
		sto.data = serverData;
		sto.save();
		init();
		makeMatrix();
		alert("サーバーデータをロードしました。");
	}else{
		alert("サーバーにデータがありません。");
	}
}
function saveServer(){
	serverData = sto.data;
	callServer("data", JSON.stringify(serverData));
	alert("サーバーにデータをセーブしました。");
}

function slide(val){
	if(slideFlg){
		event.stopPropagation();
		return;
	}
	slideFlg = true;
	// オペレータ名取得
	const name = ById("name").innerText;
	const f = ById("img");
	if(val > 0){
		let nextNum = sto.data[name].img + 1;
		if(name == "アーミヤ"){
			if(sto.data[name].promotion < nextNum){
				nextNum = 3;
			}
		}else{
			if(sto.data[name].promotion < 2 && nextNum == 1){
				nextNum = 2;
			}
		}
		if(nextNum >= imgList.length){
			nextNum = 0;
		}
		if(sto.data[name].img == nextNum){
			event.stopPropagation();
			return;
		}
		const imgPrev = imgList[nextNum].cloneNode();
		imgPrev.setAttribute("class", "prevToIn");
		imgPrev.addEventListener("animationend", function(){
			this.style.left = "0px";
		});
		f.appendChild(imgPrev);
		const imgDisp = f.getElementsByTagName("img")[0];
		imgDisp.setAttribute("class", "inToNext");
		imgDisp.addEventListener("animationend", function(){
			this.style.left = "9.5em";
			ById("img").removeChild(this);
			slideFlg = false;
		});
		sto.data[name].img = nextNum;
	}else if(val < 0){
		let prevNum = sto.data[name].img - 1;
		if(prevNum < 0){
			prevNum = imgList.length - 1;
		}
		if(name == "アーミヤ"){
			if(sto.data[name].promotion < prevNum){
				prevNum = sto.data[name].promotion;
			}
		}else{
			if(sto.data[name].promotion < 2 && prevNum == 1){
				prevNum = 0;
			}
		}
		if(sto.data[name].img == prevNum){
			event.stopPropagation();
			return;
		}
		const imgNext = imgList[prevNum].cloneNode();
		imgNext.setAttribute("class", "nextToIn");
		imgNext.addEventListener("animationend", function(){
			this.style.left = "0px";
		});
		f.appendChild(imgNext);
		const imgDisp = f.getElementsByTagName("img")[0];
		imgDisp.setAttribute("class", "inToPrev");
		imgDisp.addEventListener("animationend", function(){
			this.style.left = "-9.5em";
			ById("img").removeChild(this);
			slideFlg = false;
		});
		sto.data[name].img = prevNum;
	}
	sto.save();
	event.stopPropagation();
}

function showSettingForMoble(){
	const operatorName = ById("name").innerText;
	ById("handleName").innerText = operatorName;
	const data = operator[operatorName];
	const f = ById("settingForMobile");
	// 昇進選択リスト
	let sel = Elem("select");
	let optList = [
		{label:"", value:"0"},
	];
	// レアリティ３以上
	if(data.rare >= 3){
		// 昇進１を追加
		optList.push({label:"昇進１", value:"1"});
	}
	// レアリティ４以上
	if(data.rare >= 4){
		// 昇進２を追加
		optList.push({label:"昇進２", value:"2"});
	};
	// レアリティ３以上の場合
	if(data.rare >= 3){
		// 昇進選択リストを生成
		for(let i = 0; i < optList.length; i++){
			const opt = new Option(optList[i].label, optList[i].value);
			if(sto.data[operatorName].promotion == optList[i].value){
				opt.selected = true;
			}
			sel.appendChild(opt);
		}
		sel.setAttribute("value", sto.data[operatorName].promotion);
		if(data.rare >= 4){
			sel.style.color = "rgb(" + Math.round(sto.data[operatorName].promotion / 2 * 255) + ",0,0)";
		}else{
			sel.style.color = "rgb(" + Math.round(sto.data[operatorName].promotion * 255) + ",0,0)";
		}
		sel.addEventListener("change", changePromotion);
		ById("s_promotionArea").style.display = "";
		ById("s_promotion").innerHTML = "";
		ById("s_promotion").appendChild(sel);
	// レアリティ２以下
	}else{
		// 昇進選択不可
		ById("s_promotionArea").style.display = "none";
	}
	// LVスライダーセット
	ById("s_lv").innerHTML = "";
	ById("s_lv").appendChild(
		makeRangeSet({
			value:sto.data[operatorName].lv,
			min:1,
			max:calcLvMax(data.rare, sto.data[operatorName].promotion),
			func:changeLv,
			numInputWidth:38,
			promotion:sto.data[operatorName].promotion
		})
	);
	// 潜在選択リスト生成
	sel = Elem("select");
	// リスト選択値
	optList = [
		{label:"1",value:1},
		{label:"2",value:2},
		{label:"3",value:3},
		{label:"4",value:4},
		{label:"5",value:5},
		{label:"6",value:6}
	];
	// 潜在リスト選択生成
	for(let i = 0; i < optList.length; i++){
		const opt = new Option(optList[i].label, optList[i].value);
		if(sto.data[operatorName].potential == optList[i].value){
			opt.selected = true;
		}
		sel.appendChild(opt);
	}
	sel.setAttribute("value", sto.data[operatorName].potential);
	sel.style.color = "rgb(" + Math.round(sto.data[operatorName].potential / 6 * 255) + ",0,0)";
	sel.addEventListener("change", changePotential);
	ById("s_potential").innerHTML = "";
	ById("s_potential").appendChild(sel);
	// 信頼度スライダーセット生成
	ById("s_trust").innerHTML = "";
	ById("s_trust").appendChild(
		makeRangeSet({
			value:sto.data[operatorName].trust,
			min:1,
			max:200,
			func:changeTrust
		})
	);
	if(data.rare > 2){
		// スキルレベルコンボ生成
		sel = Elem("select");
		optList = [
			{label:1,value:1},
			{label:2,value:2},
			{label:3,value:3},
			{label:4,value:4}
		];
		if(sto.data[operatorName].promotion >= 1){
			optList.push({label:5,value:5});
			optList.push({label:6,value:6});
			optList.push({label:7,value:7});
		}
		for(let i = 0; i < optList.length; i++){
			const opt = new Option(optList[i].label, optList[i].value);
			if(sto.data[operatorName].slv == optList[i].value){
				opt.selected = true;
			}
			sel.appendChild(opt);
		}
		sel.setAttribute("value", sto.data[operatorName].slv);
		sel.style.color = "rgb(" + Math.round(sto.data[operatorName].slv / 7 * 255) + ",0,0)";
		sel.addEventListener("change", changeSlv);
		ById("s_slvArea").style.display = "";
		ById("s_slv").innerHTML = "";
		ById("s_slv").appendChild(sel);
		if(sto.data[operatorName].slv == 7 && sto.data[operatorName].promotion == 2){
			// スキルデータ取得
			const sdata = operator[operatorName].skill;
			// スキルデータ未設定の場合、何もしない
			if(!sdata || sdata.length <= 0){
				return;
			}
			// ストレージからスキル特化データ取得
			let spData = sto.data[operatorName].sp;
			// 未設定の場合の初期化
			if(!spData){
				spData = new Array(0,0,0);
			}
			// 表示内容リセット
			ById("s_ssp").innerHTML = "<div>スキル特化</div>";
			// ループカウンタ
			let i = 0;
			// スキルデータループ
			for(let sname in sdata){
				// divタグ生成
				const div = Elem("div");
				div.setAttribute("class", "flex");
				const nameArea = Elem("div");
				nameArea.style.width = "10em";
				nameArea.style.marginLeft = "1.0em";
				nameArea.style.marginTop = "1.0em";
				nameArea.innerText = sname;
				div.appendChild(nameArea);
				// 選択スライダーを生成
				div.appendChild(makeRangeSet({
					value:spData[i],
					min:0,
					max:3,
					func:changeSkillSp.bind(null, operatorName),
					sliderWidth:35,
					numInputWidth:30
				}));
				ById("s_ssp").appendChild(div);
				i++;
			}
		}else{
			ById("s_ssp").innerHTML = null;
		}
	}else{
		ById("s_slvArea").style.display = "block";
	}
	f.style.display = "flex";
}
function showMaterial(){
	const name = ById("name").innerText;
	const m = ById("materialArea");
	const rare = operator[name].rare;
	const promotion = sto.data[name].promotion;
	let gold;
	let canPromote = false;
	const soc = {
		src:"",
		num:0
	};
	switch(rare){
		case 3:
			switch(promotion){
				case 1:
					break;
				default:
					gold = 10000;
					canPromote = true;
					break;
			}
			break;
		case 4:
			switch(promotion){
				case 0:
					gold = 15000;
					soc.src = "初級" + operator[name].job + "SoC";
					soc.num = 3;
					canPromote = true;
					break;
				case 1:
					gold = 60000;
					soc.src = "中級" + operator[name].job + "SoC";
					soc.num = 5;
					canPromote = true;
					break;
				default:
					break;
			}
			break;
		case 5:
			switch(promotion){
				case 0:
					gold = 20000;
					soc.src = "初級" + operator[name].job + "SoC";
					soc.num = 4;
					canPromote = true;
					break;
				case 1:
					gold = 120000;
					soc.src = "上級" + operator[name].job + "SoC";
					soc.num = 3;
					canPromote = true;
					break;
				default:
					break;
			}
			break;
		case 6:
			switch(promotion){
				case 0:
					gold = 30000;
					soc.src = "初級" + operator[name].job + "SoC";
					soc.num = 5;
					canPromote = true;
					break;
				case 1:
					gold = 180000;
					soc.src = "上級" + operator[name].job + "SoC";
					soc.num = 4;
					canPromote = true;
					break;
				default:
					break;
			}
			break;
	}
	if(!canPromote){
		m.innerHTML = "<div style='display:flex;justify-content:center;'><div><img src='icon/info.png' style='width:50px;margin-right:1em;'></div><div>これ以上<br/>昇進できません</div></div>";
		m.removeAttribute("class");
		m.setAttribute("class", "popup");
		m.style.display = "block";
		m.addEventListener("animationend", function(){
			this.style.display = "none";
		});
		event.stopPropagation();
		return;
	}
	let html = "<div style='display:flex;justify-content:center;'>";
	html += "<div><div style='text-align:center'>龍門幣</div><div style='background:black;width:80px;height:80px;'><img src='material/龍門幣.png' style='width:auto;height:auto;max-width:100%;max-height:100%;'></div><div style='text-align:center;'>" + gold + "</div></div>";
	html += "<div style='margin-left:1.5em;'><div style='text-align:center'>" + soc.src + "</div><div style='background:black;width:80px;height:80px;'><img src='material/" + soc.src + ".png' style='width:auto;height:auto;max-width:100%;max-height:100%;'></div><div style='text-align:center;'>" + soc.num + "</div></div>";
	
	const materials = operator[name].stat[promotion + 1].material;
	
	for(let material in materials){
		html += "<div style='margin-left:1.5em;'><div style='text-align:center'>" + material + "</div><div style='background:black;width:80px;height:80px;'><img src='material/" + material + ".png' style='width:auto;height:auto;max-width:100%;max-height:100%;'></div><div style='text-align:center;'>" + materials[material] + "</div></div>";
	}
	html += "</div>";
	
	let nextMaterial = materials
	
	while(true){
		nextMaterial = processMaterial(nextMaterial);
		
		if(nextMaterial){
			html += "<div style='display:flex;justify-content:center;'>";
			for(let next in nextMaterial){
				html += "<div style='margin-left:1.5em;'><div style='text-align:center'>" + next + "</div><div style='background:black;width:80px;height:80px;'><img src='material/" + next + ".png' style='width:auto;height:auto;max-width:100%;max-height:100%;'></div><div style='text-align:center;'>" + nextMaterial[next] + "</div></div>";
			}
			html += "</div>"
		}else{
			break;
		}
	}
	
	m.innerHTML = html;
	m.removeAttribute("class");
	m.style.display = "block";
	event.stopPropagation();
}

function processMaterial(materials){

	const nextMaterial = {};
	let hasNext = false;
	
	for(let material in materials){

		if(materialProcess[material]){
			hasNext = true;
			for(let next in materialProcess[material]){
				if(nextMaterial[next]){
					nextMaterial[next] = nextMaterial[next] + materials[material] * materialProcess[material][next];
				}else{
					nextMaterial[next] = materials[material] * materialProcess[material][next];
				}
			}
		}else{
			if(nextMaterial[material]){
				nextMaterial[material] += materials[material];
			}else{
				nextMaterial[material] = materials[material];
			}
		}
	}
	if(!hasNext){
		return null;
	}
	return nextMaterial;
}
/**
 * 公開求人検索
 */
function recruitment(){
	// タグ取得
	const chk = ById("tagSearch").getElementsByTagName("input");
	// 検索結果表示欄取得
	const out = ById("searchResult");
	// 募集条件（単一）
	const searchCond = new Array();
	// 募集条件（２条件）
	const searchCond2 = new Array();
	// 募集条件（３条件）
	const searchCond3 = new Array();
	// 検索結果のクリア
	out.innerHTML = "";
	// タグループ
	for(let i = 0; i < chk.length; i++){
		// 選択されている場合
		if(chk[i].checked){
			// 検索条件ハッシュ生成
			const cond = {};
			// レアリティ条件（初期／エリート／上級エリート）の場合
			if(chk[i].getAttribute("attr") == "rare"){
				// 数値変換して退避
				cond[chk[i].getAttribute("attr")] = parseInt(chk[i].value, 10);
			// それ以外
			}else{
				// 条件を退避
				cond[chk[i].getAttribute("attr")] = chk[i].value;
			}
			// 募集条件（単一）に追加
			searchCond.push({
				label:[chk[i].nextSibling.innerText],
				cond:[cond],
				hasElite:(cond.rare == 6)
			});
		}
	}
	// 募集条件ループ（２条件組み合わせ）
	for(let i = 0; i < searchCond.length; i++){
		for(let j = i + 1; j < searchCond.length; j++){
			// 募集条件（２条件）に追加
			searchCond2.push({
				label:[searchCond[i].label, searchCond[j].label],
				cond:[
					JSON.parse(JSON.stringify(searchCond[i].cond[0])),
					JSON.parse(JSON.stringify(searchCond[j].cond[0]))
				],
				hasElite:(searchCond[i].cond[0].rare == 6 || searchCond[j].cond[0].rare == 6)
			});
		}
	}
	// 募集条件ループ（３条件組み合わせ）
	for(let i = 0; i < searchCond.length; i++){
		for(let j = i + 1; j < searchCond.length; j++){
			for(let k = j + 1; k < searchCond.length; k++){
				// 募集条件（３条件）に追加
				searchCond3.push({
					label:[searchCond[i].label, searchCond[j].label, searchCond[k].label],
					cond:[
						JSON.parse(JSON.stringify(searchCond[i].cond[0])),
						JSON.parse(JSON.stringify(searchCond[j].cond[0])),
						JSON.parse(JSON.stringify(searchCond[k].cond[0]))
					],
					hasElite:(searchCond[i].cond[0].rare == 6 || searchCond[j].cond[0].rare == 6 || searchCond[k].cond[0].rare == 6)
				});
			}
		}
	}
	// 募集条件（単一）ループ
	for(let i = 0; i < searchCond.length; i++){
		// 行生成
		let row = Elem("tr");
		// セル生成
		let elem = Elem("td");
		elem.innerHTML = "<div class='flex'><div class='card center'>" + searchCond[i].label[0] + "</div></div>";
		row.appendChild(elem);
		// 行生成
		let row2 = Elem("tr");
		let html = "";
		// 求人募集対象のオペレーターに対してループ
		for(let name in recluteOperator){
			// 追加判定
			let add = true;
			// レアリティ6で上級エリートが含まれていない場合
			if(recluteOperator[name].rare == 6 && !searchCond[i].hasElite){
				// 追加しない
				add = false;
			// レアリティ不一致
			}else if(searchCond[i].cond[0].rare && recluteOperator[name].rare != searchCond[i].cond[0].rare){
				// 追加しない
				add = false;
			// 職業不一致
			}else if(searchCond[i].cond[0].job && recluteOperator[name].job != searchCond[i].cond[0].job){
				// 追加しない
				add = false;
			// タグ条件
			}else if(searchCond[i].cond[0].tag){
				// タグに含まれるかの判定
				let tagContain = false;
				// 該当オペレーターのタグ情報をループ
				for(let j = 0; j < recluteOperator[name].tag.length; j++){
					// 合致しているタグがある
					if(recluteOperator[name].tag[j] == searchCond[i].cond[0].tag){
						// タグに含まれる
						tagContain = true;
					}
				}
				// タグに含まれない
				if(!tagContain){
					// 追加しない
					add = false;
				}
			}
			if(add){
				html += "<div style='position:relative;width:75px;height:100px;overflow:hidden;border:3px solid "
				switch(recluteOperator[name].rare){
					case 1:
						html += "rgb(220,220,220)";
						break;
					case 2:
						html += "rgb(200,255,  0)";
						break;
					case 3:
						html += "rgb(  0,200,255)";
						break;
					case 4:
						html += "rgb(200,160,255)";
						break;
					case 5:
						html += "rgb(255,255,  0)";
						break;
					case 6:
						html += "rgb(255,196,  0)";
						break;
				}
				html += ";'>"
				html += "<img src='image/" + recluteOperator[name].en + ".png' style='position:absolute;width:75px'>"
				html += "</div>"
			}
		}
		if(html == "")continue;
		let elem2 = Elem("td");
		elem2.innerHTML = "<div class='flex' style='flex-wrap:wrap;'>" + html + "</div>";
		row2.appendChild(elem2);
		out.appendChild(row);
		out.appendChild(row2);
	}
	for(let i = 0; i < searchCond2.length; i++){
		let row = Elem("tr");
		let elem = Elem("td");
		let html = "<div class='flex'>";
		for(let j = 0; j < searchCond2[i].label.length; j++){
			html += "<div class='card center'>" + searchCond2[i].label[j] + "</div>";
		}
		html += "</div>";
		elem.innerHTML = html;
		row.appendChild(elem);
		let row2 = Elem("tr");
		html = "";
		for(let name in recluteOperator){
			let add = true;
			
			for(let x = 0; x < searchCond2[i].cond.length; x++){
				if(recluteOperator[name].rare == 6 && !searchCond2[i].hasElite){
					add = false;
				}else if(searchCond2[i].cond[x].rare && recluteOperator[name].rare != searchCond2[i].cond[x].rare){
					add = false;
				}else if(searchCond2[i].cond[x].job && recluteOperator[name].job != searchCond2[i].cond[x].job){
					add = false;
				}else if(searchCond2[i].cond[x].tag){
					let tagContain = false;
					for(let j = 0; j < recluteOperator[name].tag.length; j++){
						if(recluteOperator[name].tag[j] == searchCond2[i].cond[x].tag){
							tagContain = true;
						}
					}
					if(!tagContain){
						add = false;
					}
				}
			}
			if(add){
				html += "<div style='position:relative;width:75px;height:100px;overflow:hidden;border:3px solid "
				switch(recluteOperator[name].rare){
					case 1:
						html += "rgb(220,220,220)";
						break;
					case 2:
						html += "rgb(200,255,  0)";
						break;
					case 3:
						html += "rgb(  0,200,255)";
						break;
					case 4:
						html += "rgb(200,160,255)";
						break;
					case 5:
						html += "rgb(255,255,  0)";
						break;
					case 6:
						html += "rgb(255,196,  0)";
						break;
				}
				html += ";'>"
				html += "<img src='image/" + recluteOperator[name].en + ".png' style='position:absolute;width:75px'>"
				html += "</div>"
			}
		}
		if(html == "")continue;
		let elem2 = Elem("td");
		elem2.innerHTML = "<div class='flex' style='flex-wrap:wrap;'>" + html + "</div>";
		row2.appendChild(elem2);
		out.appendChild(row);
		out.appendChild(row2);
	}
	for(let i = 0; i < searchCond3.length; i++){
		let row = Elem("tr");
		let elem = Elem("td");
		let html = "<div class='flex'>";
		for(let j = 0; j < searchCond3[i].label.length; j++){
			html += "<div class='card center'>" + searchCond3[i].label[j] + "</div>";
		}
		html += "</div>"
		elem.innerHTML = html;
		row.appendChild(elem);
		let row2 = Elem("tr");
		html = "";
		for(let name in recluteOperator){
			let add = true;
			for(let x = 0; x < searchCond3[i].cond.length; x++){
				if(recluteOperator[name].rare == 6 && !searchCond3[i].hasElite){
					add = false;
				}else if(searchCond3[i].cond[x].rare && recluteOperator[name].rare != searchCond3[i].cond[x].rare){
					add = false;
				}else if(searchCond3[i].cond[x].job && recluteOperator[name].job != searchCond3[i].cond[x].job){
					add = false;
				}else if(searchCond3[i].cond[x].tag){
					let tagContain = false;
					for(let j = 0; j < recluteOperator[name].tag.length; j++){
						if(recluteOperator[name].tag[j] == searchCond3[i].cond[x].tag){
							tagContain = true;
						}
					}
					if(!tagContain){
						add = false;
					}
				}
			}
			if(add){
				html += "<div style='position:relative;width:75px;height:100px;overflow:hidden;border:3px solid "
				switch(recluteOperator[name].rare){
					case 1:
						html += "rgb(220,220,220)";
						break;
					case 2:
						html += "rgb(200,255,  0)";
						break;
					case 3:
						html += "rgb(  0,200,255)";
						break;
					case 4:
						html += "rgb(200,160,255)";
						break;
					case 5:
						html += "rgb(255,255,  0)";
						break;
					case 6:
						html += "rgb(255,196,  0)";
						break;
				}
				html += ";'>"
				html += "<img src='image/" + recluteOperator[name].en + ".png' style='position:absolute;width:75px'>"
				html += "</div>"
			}
		}
		if(html == "")continue;
		let elem2 = Elem("td");
		elem2.innerHTML = "<div class='flex' style='flex-wrap:wrap;'>" + html + "</div>";
		row2.appendChild(elem2);
		out.appendChild(row);
		out.appendChild(row2);
	}
}
function setGraphSkill(){
	
	const name = ById("graphOperator").value;
	
	const sel = ById("graphSkill");
	
	sel.innerHTML = "";
	
	for(let sname in operator[name].skill){
		sel.appendChild(new Option(sname, sname));
	}
	if(Object.keys(operator[name].skill).length > 0){
		sel.style.display = "inline-block";
	}else{
		sel.style.display = "none";
	}
	
	changeSkill();
}

function changeSkill(){
	ById("skillActivate").checked = false;
	graphDPS();
}

function graphDPS(){
	const canvasWidth = 1200;
	const canvasHeight = 800;
	const basePos = {
		x:50,
		y:750
	};
	const mesureY = parseInt(ById("mesure").value);
	const mesure = {
		x:30,
		y:mesureY
	};
	// グラフの目盛幅
	const baseScale = {
		x:1.2,
		y:mesureY * 1.4
	};
	const frameRatio = 30;
	
	const dmgRatio = 1000;
	
	const graph = ById("dmgGraph");
	graph.setAttribute("width", canvasWidth);
	graph.setAttribute("height", canvasHeight);
	graph.style.width = canvasWidth + "px";
	graph.style.height = canvasHeight + "px";
	// コンテキスト取得
	const ctx = graph.getContext("2d");
	// 描画領域のクリア
	ctx.clearRect(0 , 0, canvasWidth, canvasHeight);
	// 線色設定
	ctx.strokeStyle = "#000000";
	// 線種設定
	ctx.setLineDash([0,0,0,0]);
	// 描画開始
	ctx.beginPath();
	// 基点に移動
	ctx.moveTo(basePos.x, basePos.y);
	// X軸線追加
	ctx.lineTo(basePos.x + baseScale.x * frameRatio * mesure.x, basePos.y);
	// 基点に移動
	ctx.moveTo(basePos.x, basePos.y);
	// Y軸線追加
	ctx.lineTo(basePos.x, 5);
	// X軸目盛追加
	for(let i = 1; i <= mesure.x ;i++){
		// 目盛位置に移動
		ctx.moveTo(basePos.x + i * frameRatio * baseScale.x, basePos.y);
		// 目盛描画
		ctx.lineTo(basePos.x + i * frameRatio * baseScale.x, basePos.y + 5);
		// テキスト追加
		ctx.strokeText(i + "s", basePos.x - 5 + i * frameRatio * baseScale.x, basePos.y + 16);
	}
	// Y軸目盛追加
	for(let i = 1; i <= mesure.y; i++){
		// 目盛位置に移動
		ctx.moveTo(basePos.x, basePos.y - (dmgRatio * i) / baseScale.y);
		// 目盛描画
		ctx.lineTo(basePos.x - 10, basePos.y - (dmgRatio * i) / baseScale.y);
		// テキスト追加
		ctx.strokeText(dmgRatio * i, 6, basePos.y + 4 - (dmgRatio * i) / baseScale.y);
	}
	// 描画
	ctx.stroke();
	// 描画終了
	ctx.closePath();
	
	const name = ById("graphOperator").value;
	
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
	// 敵物理防御を取得
	const eneDef = ById("eneDef").value ? parseInt(ById("eneDef").value) : 0;
	// 敵術耐性を取得
	const eneRes = ById("eneRes").value ? parseInt(ById("eneRes").value) : 0;
	// 範囲内の敵数取得
	const eneCnt = ById("eneCnt").value ? parseInt(ById("eneCnt").value) : 0;
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
	// 条件付き計算可否
	let isCalc = true;
	// 条件付きの場合
	if(operator[name].cond && operator[name].cond(arg)){
		// フラグOFFの場合は条件付きの計算は含まない
		isCalc = false;
	}
	// 素質による攻撃力強化分の計上 ※条件付きの場合考慮しない
	if(isCalc && operator[name].atkUp && operator[name].atkUp(arg) != null){
		stat.atk = operator[name].atkUp(arg);
	}
	// 攻撃回数
	let atkCnt = (operator[name].cnt && operator[name].cnt(arg) != null)
	               ? operator[name].cnt(arg)
	               : 1;
	// ダメージ値
	let dmg;
	// 術攻撃オペレータの場合
	if(data.job == "術師" || data.job == "補助" || name == "ムース" || name == "アステシア"){
		/*
		dmg = (isCalc && operator[name].dmgUp && operator[name].dmgUp(arg) != null)
		      ? operator[name].dmgUp(arg)
		      : (
		        (operator[name].dmgDefault && operator[name].dmgDefault(arg) != null)
		        ? operator[name].dmgDefault(arg)
		        : Math.round(stat.atk * (100 - eneRes) / 100)
		      );
		*/
		dmg = Math.round(stat.atk * (100 - eneRes) / 100);
	// 医療オペレータの場合
	}else if(data.job == "医療"){
		// 単純に攻撃力で計算
		dmg = stat.atk;
		ctx.strokeStyle = "#00c000";
	// それ以外＝物理攻撃オペレータの場合
	}else{
		/*
		dmg = (isCalc && operator[name].dmgUp && operator[name].dmgUp(arg) != null)
		      ? operator[name].dmgUp(arg)
		      : (
		        (operator[name].dmgDefault && operator[name].dmgDefault(arg) != null)
		        ? operator[name].dmgDefault(arg)
		        : stat.atk - eneDef
		      );
		*/
		dmg = stat.atk - eneDef;
	}
	// 範囲内の同時攻撃数
	const target = (operator[name].target && operator[name].target(arg) != null)
	               ? operator[name].target(arg)
	               : 1;
	// 保証ダメージの計算
	const limit = (isCalc && operator[name].limitUp && operator[name].limitUp(arg) != null)
	              ? operator[name].limitUp(arg)
	              : 0.05;
	// 攻撃時のダメージ値が保証ダメージ未満の場合
	if(dmg < stat.atk * limit){
		// 保証ダメージによる計算
		dmg = parseInt(stat.atk * limit);
	}
	// 攻撃速度上昇
	let speedUp = (isCalc && operator[name].speedUp && operator[name].speedUp(arg) != null)
	                ? operator[name].speedUp(arg)
	                : 0;
	
	// 攻撃間隔延長
	let intervalUp = (isCalc && operator[name].intervalUp && operator[name].intervalUp(arg) != null)
	                ? operator[name].intervalUp(arg)
	                : 0;
	
	// スリップダメージ
	const slipDmg = (isCalc && operator[name].slipDmg && operator[name].slipDmg(arg) != null)
	                ? operator[name].slipDmg(arg)
	                : 0;
	
	const sname = ById("graphSkill").value;
	
	if(name == "アンジェリーナ" && sname != "秘杖・急収束"){
		dmg = 0;
	}
	
	let splv = 0;
	let spidx = 0;
	
	for(let lpname in operator[name].skill){
		if(lpname == sname){
			break;
		}
		spidx++;
	}
	if(spidx < Object.keys(operator[name].skill).length){
		splv = sto.data[name].sp[spidx];
	}
	
	let skillData = {};
	let skillEffect = [];
	if(sname != "" && operator[name].skill){
		skillData = JSON.parse(JSON.stringify(operator[name].skill[sname]));
		skillEffect = skillData.effect[sto.data[name].slv - 1 + splv];
	}
	if(skillData.passive){
		ById("recoverText").style.display = "none";
		ById("activateText").innerText = "パッシブ";
	}else if(skillData.recover){
		const recoverConv = {
			"auto":{
				txt:"自動回復",
				color:"rgb(160,205,64)"
			},
			"attack":{
				txt:"攻撃回復",
				color:"rgb(255,128,64)"
			},
			"damage":{
				txt:"被撃回復",
				color:"#FFCC00"
			}
		};

		const activateConv = {
			"auto":"自動発動",
			"manual":"手動発動"
		};
		ById("recoverText").innerText = recoverConv[skillData.recover].txt;
		ById("recoverText").style.background = recoverConv[skillData.recover].color;
		ById("activateText").innerText = activateConv[skillData.activate];
		ById("recoverText").style.display = "block";
		ById("activateText").style.display = "block";
	}else{
		ById("recoverText").style.display = "none";
		ById("activateText").style.display = "none";
	}

	if(skillEffect.pers){
		ById("skillPers").innerText = skillEffect.pers + "秒";
		ById("skillPersArea").style.display = "flex";
	}else{
		ById("skillPers").innerText = "";
		ById("skillPersArea").style.display = "none";
	}
	
	let exp = skillData.exp;
	
	if(exp){
		for(let key in skillEffect){
			if(exp.indexOf("@" + key) >= 0){
				while(exp.indexOf("@" + key) >= 0){
					exp = exp.replace("@" + key, skillEffect[key]);
				}
			}
		}

		ById("skillExp").innerHTML = exp;
		ById("skillExp").style.display = "block";
	}else{
		ById("skillExp").style.display = "none";
	}
	if(!skillData.activate || (skillData.activate == "auto" && !skillData.infinity)){
		ById("skillActivate").disabled = true;
	}else{
		ById("skillActivate").disabled = false;
	}
	
	const baseNeed = skillEffect.need;

	if(typeof skillEffect.start != "undefined" && typeof skillEffect.need != "undefined"){
		skillEffect.need = skillEffect.need - skillEffect.start;
	}
	
	let interval = 1;	

	let speed = Math.round((data.speed + intervalUp) * interval * (100 / (100 + speedUp)) * frameRatio);
	
	const skillInfo = {
		activate:false,
		dmg:dmg,
		cnt:1,
		speed:speed,
		pers:0
	};
	
	if(
		(
			ById("skillActivate").checked && 
			(
				(skillData.activate == "manual" && skillEffect.pers > 0) ||
				skillData.infinity
			)
		) ||
		(skillData.passive && (skillEffect.pers > 0 || skillEffect.time > 0))
	){
		skillInfo.activate = true;
		
		if(skillEffect.atk){
			skillInfo.dmg = stat.atk * skillEffect.atk / 100;
		}else if(skillEffect.atkadd){
			skillInfo.dmg = stat.atk * (1 + skillEffect.atkadd / 100);
		}
		// 攻撃時のダメージ値が保証ダメージ未満の場合
		if(skillInfo.dmg < stat.atk * limit){
			// 保証ダメージによる計算
			skillInfo.dmg = parseInt(stat.atk * limit);
		}
		if(skillData.noAttack){
			skillInfo.dmg = 0;
		}
		
		if(skillEffect.speed){
			speedUp += skillEffect.speed;
		}
		if(skillEffect.interval){
			interval = skillEffect.interval;
		}
		if(skillEffect.intervaladd){
			intervalUp += skillEffect.intervaladd;
		}
		if(skillEffect.cnt){
			skillInfo.cnt = skillEffect.cnt;
		}
		
		skillInfo.speed = Math.round((data.speed + intervalUp) * interval * (100 / (100 + speedUp)) * frameRatio);
		
		skillInfo.pers = skillEffect.pers;
		
		if(skillData.passive && !skillEffect.pers && skillEffect.time > 0){
			skillInfo.pers = skillEffect.time;
		}
		
		ctx.strokeStyle = "#ff3000";
	}
	
	// 描画開始
	ctx.beginPath();
	// 基点に移動
	ctx.moveTo(basePos.x, basePos.y);
	
	let ttlDmg = 0;
	
	for(let i = 0; i < frameRatio * mesure.x; i++){
		
		ctx.lineTo(basePos.x + i * baseScale.x, basePos.y - ttlDmg / baseScale.y);
		
		if(skillInfo.activate && skillInfo.pers <= 0){
			skillInfo.activate = false;
			
			// 描画
			ctx.stroke();
			// 描画終了
			ctx.closePath();
			
			ctx.beginPath();
			
			if(data.job == "医療"){
				ctx.strokeStyle = "#00c000";
			}else{
				ctx.strokeStyle = "#000000";
			}
			
			ctx.moveTo(basePos.x + i * baseScale.x, basePos.y - ttlDmg / baseScale.y);
		}
		
		if(
			(!skillInfo.activate && i % speed == 0) ||
			(skillInfo.activate && i % skillInfo.speed == 0)
		){
			if(skillData.recover == "attack" && typeof skillEffect.need != "undefined"){
				skillEffect.need = skillEffect.need - 1;
			}
			
			if(typeof skillEffect.pers == "undefined" && typeof skillEffect.need != "undefined"){
				if(
					skillEffect.need <= 0 &&
					(
						skillData.activate == "auto" ||
						(skillData.activate == "manual" && ById("skillActivate").checked)
					)
				){
					// 描画
					ctx.stroke();
					// 描画終了
					ctx.closePath();
					
					ctx.beginPath();
					
					ctx.strokeStyle = "#ff0000";
					
					ctx.moveTo(basePos.x + i * baseScale.x, basePos.y - ttlDmg / baseScale.y);
					
					let sCnt = 1;
					if(skillEffect.cnt){
						sCnt = skillEffect.cnt;
					}
					if(skillEffect.atk > 0){
						// 術攻撃オペレータの場合
						if(data.job == "術師" || data.job == "補助" || name == "ムース" || name == "アステシア" || skillData.res){
							ttlDmg += Math.round(stat.atk * skillEffect.atk / 100) * ((100 - eneRes) / 100) * sCnt;
						// 医療オペレータの場合
						}else if(data.job == "医療"){
							ttlDmg += Math.round(stat.atk * skillEffect.atk / 100) * sCnt;
						}else if(skillData.multi){
							ttlDmg += Math.round(stat.atk * skillEffect.atk / 100) * ((100 - eneRes) / 100) * sCnt;
							ttlDmg += (Math.round(stat.atk * skillEffect.atk / 100) - eneDef) * sCnt;
						// それ以外＝物理攻撃オペレータの場合
						}else{
							ttlDmg += (Math.round(stat.atk * skillEffect.atk / 100) - eneDef) * sCnt;
						}
					}else if(skillEffect.atkadd > 0){
						// 術攻撃オペレータの場合
						if(data.job == "術師" || data.job == "補助" || name == "ムース" || name == "アステシア" || skillData.res){
							ttlDmg += Math.round(stat.atk * (1 + skillEffect.atkadd / 100) * ((100 - eneRes) / 100)) * sCnt;
						// 医療オペレータの場合
						}else if(data.job == "医療"){
							ttlDmg += Math.round(stat.atk * (1 + skillEffect.atkadd / 100)) * sCnt;
						}else if(skillData.multi){
							ttlDmg += Math.round(stat.atk * (1 + skillEffect.atkadd / 100) * ((100 - eneRes) / 100)) * sCnt;
							ttlDmg += (Math.round(stat.atk * (1 + skillEffect.atkadd / 100)) - eneDef)  * sCnt;
						// それ以外＝物理攻撃オペレータの場合
						}else{
							ttlDmg += (Math.round(stat.atk * (1 + skillEffect.atkadd / 100)) - eneDef)  * sCnt;
						}
					}else{
						ttlDmg += dmg * sCnt;
					}
					skillEffect.need = baseNeed;
				}else{
					if(skillInfo.activate){
						ttlDmg += skillInfo.dmg * skillInfo.cnt;
					}else{
						ttlDmg += dmg * atkCnt;
					}
				}
			}else{
				if(skillInfo.activate){
					ttlDmg += skillInfo.dmg * skillInfo.cnt;
				}else{
					ttlDmg += dmg * atkCnt;
				}
			}
			ctx.lineTo(basePos.x + i * baseScale.x, basePos.y - ttlDmg / baseScale.y);
			
			if(ctx.strokeStyle == "#ff0000"){
				// 描画
				ctx.stroke();
				// 描画終了
				ctx.closePath();
				
				ctx.beginPath();
				if(data.job == "医療"){
					ctx.strokeStyle = "#00c000";
				}else{
					ctx.strokeStyle = "#000000";
				}
				ctx.moveTo(basePos.x + i * baseScale.x, basePos.y - ttlDmg / baseScale.y);

			}
		}
		if(skillData.recover == "auto" && typeof skillEffect.need != "undefined" && (i != 0 && i % 30 == 0)){
			skillEffect.need = skillEffect.need - 1;
		}
		
		if(skillData.activate == "auto" && !skillInfo.activate && skillEffect.need <= 0 && skillEffect.pers){

			skillInfo.activate = true;

			// 描画
			ctx.stroke();
			// 描画終了
			ctx.closePath();
			
			ctx.beginPath();
			
			ctx.strokeStyle = "#ff3000";
			
			ctx.moveTo(basePos.x + i * baseScale.x, basePos.y - ttlDmg / baseScale.y);

			if(skillEffect.atk){
				skillInfo.dmg = stat.atk * skillEffect.atk / 100;
			}else if(skillEffect.atkadd){
				skillInfo.dmg = stat.atk * (1 + skillEffect.atkadd / 100);
			}
			// 攻撃時のダメージ値が保証ダメージ未満の場合
			if(skillInfo.dmg < stat.atk * limit){
				// 保証ダメージによる計算
				skillInfo.dmg = parseInt(stat.atk * limit);
			}
			if(skillData.noAttack){
				skillInfo.dmg = 0;
			}
			
			if(skillEffect.speed){
				speedUp += skillEffect.speed;
			}
			if(skillEffect.interval){
				interval = skillEffect.interval;
			}
			if(skillEffect.intervaladd){
				intervalUp += skillEffect.intervaladd;
			}
			if(skillEffect.cnt){
				skillInfo.cnt = skillEffect.cnt;
			}
			
			skillInfo.speed = Math.round((data.speed + intervalUp) * interval * (100 / (100 + speedUp)) * frameRatio);
			
			console.log(skillInfo.speed);
			
			skillInfo.pers = skillEffect.pers;
		}
		
		if(skillInfo.activate && i != 0 && i % 30 == 0){
			skillInfo.pers = skillInfo.pers - 1;
		}
	}
	
	ById("ttl").innerText = Math.round(ttlDmg);
	
	// 描画
	ctx.stroke();
	// 描画終了
	ctx.closePath();
}
