"use strict";
/**
 * 初期表示処理
 */
function init(){
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
	// 簡易＋詳細
	if(type == "1"){
		thead.size("70.0em");
		ById("wrapper").style.width = "69.9em";
		hrow.addHeader("所持", {width:"2.9em"});
		hrow.addHeader("レア度", {width:"6.0em"});
		hrow.addHeader("コードネーム", {width:"9.5em"});
		hrow.addHeader("職業", {width:"2.5em"});
		hrow.addHeader("昇進", {width:"3.8em"});
		hrow.addHeader("レベル", {width:"11.1em"});
		hrow.addHeader("潜在", {width:"2.5em"});
		hrow.addHeader("信頼度", {width:"11.7em"});
		hrow.addHeader("スキルRANK");
	// 一覧
	}else if(type == "2"){
		thead.size("51.3em");
		ById("wrapper").style.width = "51.2em";
		thead.size();
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
	}
	// リストヘッダに行追加
	thead.addHeader(hrow);
	// 
	const t1 = ById("t1");
	t1.innerHTML = "";
	// 
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
				sp:new Array(0,0,0)
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
		// 簡易＋詳細
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
			r.add(star(data.rare), {width:"6.0em"});
			// オペレーター名セル追加
			r.add(operatorName, {cursor:"pointer", width:"9.5em"}, null, function(){
				new Table("operator").clear();
				event.target.setAttribute("class", "selected");
				showDetail(findRow(event.target).getAttribute("name"));
			});
			// 職業セル追加
			r.add(data.job, {textAlign:"center", width:"2.5em"});
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
				r.add(sel, {textAlign:"center",width:"2.5em"});
				if(sto.data[operatorName].slv == 7 && sto.data[operatorName].promotion == 2){
					r.add("<button onclick='showSkillSp();'>スキル特化</button>");
				}else{
					r.add("<button onclick='showSkillSp();' disabled>スキル特化</button>");
				}
			}else{
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

/**
 * 詳細表示
 */
function showDetail(name){
	ById("skillSp").style.display = "none";
	// 該当のオペレーターのデータ取得
	const data = operator[name];
	// イメージタグ生成
	const img = Elem("img");
	
	let src;
	
	if(sto.data[name].promotion == 0){
		src = data.en;
	}else{
		if(name == "アーミヤ"){
			src = data.en + "_" + sto.data[name].promotion;
		}else{
			if(sto.data[name].promotion == 2){
				src = data.en + "_2";
			}else{
				src = data.en;
			}
		}
	}
	
	img.setAttribute("src", "image/" + src + ".png");
	img.style.width = "9.5em";
	img.style.height = "295px";
	ById("img").innerHTML = "";
	ById("img").appendChild(img);
	// イメージのオーバレイの色彩設定
	ById("imageBack").setAttribute("class", "rare" + data.rare);
	// オペレーター名反映
	ById("name").innerText = name;
	// 素質、スキルをクリア　※素質なしの場合、クリアしておかないと前に選択されているオペレーターの素質が残る
	ById("nature").innerHTML = "";
	ById("skill").innerHTML = "";
	ById("cond").innerHTML = "";
	ById("effect").innerHTML = "-";
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
	// 対象オペレータ名の取得
	const name = ById("name").innerText;
	// 表示領域取得
	const detail = ById("natureDetail");
	// 対象オペレータの素質を取得
	const nature = operator[name].stat[sto.data[name].promotion].nature;
	// HTML
	let html = "";
	// 素質ループ
	for(let natureName in nature){
		// ヘッダ、もしくは改行の追加
		if(html == ""){
			html += div("素質詳細", {fontSize:"1.8em", marginBottom:"0.2em", color:"gray"});
		}else{
			html += "<br/><br/>";
		}
		// 素質の追加
		html += div(natureName, {display:"inline-block"}, {class:"whitelabel"}) + "<br/>";
		html += nature[natureName];
	}
	// HTML反映
	detail.innerHTML = html;
	// 素質詳細の表示
	detail.style.display = "block";
	// イベント伝播の停止
	event.stopPropagation();
}
/**
 * スキル詳細の表示
 */
function showSkill(){
	// オペレータ名取得
	const name = ById("name").innerText;
	// オペレータデータ取得
	const data = operator[name];
	// スキルデータ取得
	const sdata = data.skill;
	// スキルレベル取得
	const slv = sto.data[name].slv;
	ById("skillRank").innerText = slv;
	// スキル特化取得
	let sp = sto.data[name].sp;
	// スキル特化データのnullpo防止
	if(!sp){
		sp = new Array(0,0,0);
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
			html += "<div style='background-color:rgba(160,160,160,0.7);text-align:center;'>";
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
			html += "<div style='margin-left:5px;margin-right:2px;'>" + sdata[sname].effect[slv - 1].pers + "秒</div>";
			html += "</div>";
		}
		html += "</div>";
		// スキルの説明取得
		let exp = sdata[sname].exp;
		// スキルレベルに対応した形にスキルの説明を補正
		const eff = sdata[sname].effect[slv - 1 + sp[i]];
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
	if(ById("natureDetail").style.display == "block"){
		ById("natureDetail").style.display = "none";
		flg = true;
	}
	// スキル詳細が表示されている場合、非表示
	if(ById("skillDetailOverlay").style.display == "block"){
		ById("skillDetailOverlay").style.display = "none";
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
	// アクション対象の行を特定
	const r = findRow(event.target);
	// 行に設定されているオペレータ名の取得
	const operatorName = r.getAttribute("name");
	// 値
	let targetValue;
	// キーによる分岐
	switch(key){
		// 所持
		case "have":
			// チェックボックスなのでcheckedを取得
			targetValue = event.target.checked;
			// チェックされている場合
			if(event.target.checked){
				// クラス定義を消して未所持状態を解除
				r.removeAttribute("class");
			// チェックされていない場合
			}else{
				// 未所持状態のクラス定義を追加
				r.setAttribute("class", "notHave");
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
	if(key == "promotion"){
		const selects = r.getElementsByTagName("select");
		let divide = 1;
		if(operator[operatorName].rare >= 4){
			divide = 2;
		}
		selects[0].style.color = "rgb(" + Math.round(selects[0].value / divide * 255) + ",0,0)";
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
