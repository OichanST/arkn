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
	// リストヘッダ行生成
	const hrow = new Row();
	// 簡易＋詳細
	if(type == "1"){
		hrow.addHeader("所持", {width:"2.9em"});
		hrow.addHeader("レアリティ", {width:"6.0em"});
		hrow.addHeader("オペレーター名", {width:"9.5em"});
		hrow.addHeader("職業", {width:"2.5em"});
		hrow.addHeader("昇進", {width:"4.4em"});
		hrow.addHeader("LV", {width:"11.1em"});
		hrow.addHeader("潜在", {width:"2.2em"});
		hrow.addHeader("信頼度", {width:"11.7em"});
		hrow.addHeader("スキルレベル");
	// 一覧
	}else if(type == "2"){
		hrow.addHeader("レアリティ", {width:"6.0em"});
		hrow.addHeader("オペレーター名", {width:"9.5em"});
		hrow.addHeader("職業", {width:"2.5em"});
		hrow.addHeader("昇進", {width:"5.5em"});
		hrow.addHeader("HP", {width:"3.5em"});
		hrow.addHeader("攻撃力", {width:"3.5em"});
		hrow.addHeader("防御力", {width:"3.5em"});
		hrow.addHeader("術耐性", {width:"3.5em"});
		hrow.addHeader("ｺｽﾄ", {width:"2.5em"});
		hrow.addHeader("ﾌﾞﾛｯｸ", {width:"3.0em"});
		hrow.addHeader();
	}
	// リストヘッダに行追加
	thead.addHeader(hrow);
	// オペレーター一覧をクリア
	const t = new Table("operator").removeAll();
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
				return b.rare - a.rare;
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
				return calcDPS(bName) - calcDPS(aName);
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
		// オペレータが追加された場合のストレージデータの追加
		if(!sto.data[operatorName]){
			sto.data[operatorName] = {
				have:false,
				promotion:0,
				lv:1,
				potential:1,
				trust:0,
				slv:1,
				sp:new Array(0,0,0)
			};
		}
		// 所持状態取得
		const haveOperator = sto.data[operatorName].have;
		// 所持していない場合
		if(!haveOperator){
			// 行を非活性化
			r.attr("class", "notHave");
		}
		// 簡易＋詳細
		if(type == "1"){
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
				sel.addEventListener("change", changePromotion);
				r.add(sel, {width:"4.4em"});
			// レアリティ２以下
			}else{
				// 昇進選択不可
				r.add("&nbsp;", {width:"4.4em"});
			}
			// LVスライダーセット
			r.add(
				makeRangeSet(
					sto.data[operatorName].lv,
					1,
					calcLvMax(data.rare, sto.data[operatorName].promotion),
					changeLv,
					null,
					38
				),
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
			sel.addEventListener("change", changePotential);
			r.add(sel, {width:"2.2em"});
			// 信頼度スライダーセット生成
			r.add(
				makeRangeSet(sto.data[operatorName].trust, 1, 200, changeTrust),
				{width:"11.7em"}
			);
			// スキルレベルスライダーセット生成
			r.add(
				makeRangeSet(sto.data[operatorName].slv, 1, 7, changeSlv, 60, 31),
				{width:"6.3em"}
			);
			
			r.add("<button onclick='showSkillSp();'>スキル特化</button>");
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
			r.add(operatorName, {width:"9.5em"}, {rowSpan:rsp});
			// 職業セル追加
			r.add(data.job, {width:"2.5em"}, {rowSpan:rsp});
			
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
			r.add(data[subKey].hp, {textAlign:"right", width:"3.5em"});
			r.add(data[subKey].atk, {textAlign:"right", width:"3.5em"});
			r.add(data[subKey].def, {textAlign:"right", width:"3.5em"});
		}else{
			r.add(data.hp, {textAlign:"right", width:"3.5em"});
			r.add(data.atk, {textAlign:"right", width:"3.5em"});
			r.add(data.def, {textAlign:"right", width:"3.5em"});
		}
		if(subKey == "min" || !subKey){
			r.add(data.res, {textAlign:"right", width:"3.5em"}, subKey == "min" ? {rowSpan:2} : null);
			r.add(data.cost, {textAlign:"right", width:"2.5em"}, subKey == "min" ? {rowSpan:2} : null);
			r.add(data.block, {textAlign:"right", width:"3.0em"}, subKey == "min" ? {rowSpan:2} : null);
		}
		r.add();
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
	// 物理耐久
	ById("pEndurance").innerText = stat.hp + stat.def;
	// 術耐久
	ById("aEndurance").innerText = Math.round(stat.hp * (100 / (100 - data.stat[sto.data[name].promotion].res)));
	// DPS
	ById("dps").innerText = calcDPS(name);
	// 詳細を表示する
	ById("detail").style.display = "block";
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
			html += div("素質詳細", {color:"gray"});
		}else{
			html += "<br/>";
		}
		// 素質の追加
		html += div(natureName, {display:"inline-block"}, {class:"whitelabel"}) + "<br/>";
		html += nature[natureName].exp;
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
		html += "<div class='flex'>";
		html += div(sname, {margin:"3px", fontWeight:"bold"});
		// スキル特化の設定がされている場合
		if(sp){
			// 特化段階の表示
			if(sp[i] > 0){
				html += div("スキル特化" + sp[i] + "段階", {marginLeft:"1em", marginTop:"3px", color:"yellow"});
			}
		}
		html += "</div>";
		html += "<div class='flex'>";
		// パッシブスキルの場合
		if(sdata[sname].passive){
			html += card("パッシブ");
		}else{
			// スキルの回復方法の文字変換
			switch(sdata[sname].recover){
				case "auto":
					html += card("自動回復", {backgroundColor:"#00C000"});
					break;
				case "attack":
					html += card("攻撃回復", {backgroundColor:"#FF0000"});
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
		html += "</div>";
		// スキルの説明取得
		let exp = sdata[sname].exp;
		// スキルレベルに対応した形にスキルの説明を補正
		const eff = sdata[sname].effect[slv + sp[i]];
		for(var key in eff){
			if(exp.indexOf("@" + key) >= 0){
			　　while(exp.indexOf("@" + key) >= 0){
					exp = exp.replace("@" + key, eff[key]);
				}
			}
		}
		// スキル説明の反映
		html += div(exp, {marginLeft:"1em", height:"5em"});
		// ループカウンタのインクリメント
		i++;
	}
	// HTML反映
	ById("skillDetail").innerHTML = html;
	// スキル詳細の表示
	ById("skillDetail").style.display = "block";
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
	if(ById("skillDetail").style.display == "block"){
		ById("skillDetail").style.display = "none";
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
}
/**
 * 昇進変更
 */
function changePromotion(){
	change('promotion');
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
		// 行にある入力を取得
		const inputs = r.getElementsByTagName("input");
		// 該当レアリティ、昇進状態による最大Lvを取得
		const lvMax = calcLvMax(operator[operatorName].rare, sto.data[operatorName].promotion);
		// Lvの最大値を更新
		inputs[1].max = lvMax;
		inputs[2].max = lvMax;
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
		div.appendChild(makeRangeSet(spData[i], 0, 3, changeSkillSp.bind(null, name), 35, 30));
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
	}else{
		alert("サーバーにデータがありません。");
	}
}
function saveServer(){
	serverData = sto.data;
	callServer("data", JSON.stringify(serverData));
}