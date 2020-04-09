/**
 * DOMエレメントの生成
 */
function Elem(tag){
	return document.createElement(tag);
}
/**
 * DOMエレメントをIDで取得
 */
function ById(id){
	return document.getElementById(id);
}
/**
 * Tableセル内のイベントから行を特定する
 */
function findRow(t){
	let elem = t;
	while(elem.tagName != "TR"){
		elem = elem.parentNode;
	}
	return elem;
}
/**
 * spanタグの作成
 */
function span(val, css){
	const ret = Elem("span");
	ret.innerText = val;
	if(css){
		for(let key in css){
			ret.style[key] = css[key];
		}
	}
	return ret.outerHTML;
}
/**
 * divタグの作成
 */
function div(text, css, attr){
	let ret = Elem("div");
	ret.innerText = text;
	if(css){
		for(let key in css){
			ret.style[key] = css[key];
		}
	}
	if(attr){
		for(let key in attr){
			ret.setAttribute(key, attr[key]);
		}
	}
	return ret.outerHTML;
}
/**
 * divタグ(card)の作成
 */
function card(text, css){
	let ret = Elem("div");
	ret.setAttribute("class", "card");
	ret.innerText = text;
	if(css){
		for(let key in css){
			ret.style[key] = css[key];
		}
	}
	return ret.outerHTML;
}
/**
 * Tableオブジェクトラッパー
 */
function Table(id){
	// IDを条件に対応するTableエレメントの取得
	const t = ById(id);
	// theadを取得
	let th = t.getElementsByTagName("thead")[0];
	if(!th){
		th = Elem("thead");
		t.appendChild(th);
	}
	// tbodyを取得
	let tb = t.getElementsByTagName("tbody")[0];
	if(!tb){
		tb = Elem("tbody");
		t.appendChild(tb);
	}
	/**
	 * 全消し
	 */
	this.removeAll = function(clearHeader){
		if(clearHeader){
			while(th.firstChild){
				th.removeChild(th.firstChild);
			}
		}
		// 全行削る
		while(tb.firstChild){
			tb.removeChild(tb.firstChild);
		}
		// 処理が終わったら自身のインスタンスを返却
		return this;
	}
	this.clear = function(){
		const r = tb.getElementsByTagName("TR");
		for(let i = 0; i < r.length; i++){
			const c = r[i].getElementsByTagName("TD");
			for(let j = 0; j < c.length; j++){
				c[j].removeAttribute("class");
			}
		}
	}
	/**
	 * ヘッダ追加
	 */
	this.addHeader = function(r){
		th.appendChild(r.get());
		return this;
	}
	/**
	 * 行追加
	 */
	this.add = function(r){
		tb.appendChild(r.get());
		return this;
	}
}
/**
 * 行オブジェクトラッパー
 */
function Row(){
	// 行生成
	const r = Elem("TR");
	/**
	 * DOMオブジェクトの取得
	 */
	this.get = function(){
		// フィールド値の返却
		return r;
	}
	/**
	 * 属性を設定
	 */
	this.attr = function(name, value){
		r.setAttribute(name, value);
		return this;
	}
	/**
	 * スタイルを設定
	 */
	this.style = function(name, value){
		r.style[name] = value;
		return this;
	}
	/**
	 * セル追加
	 */
	this.addHeader = function(html, css, attr, onclickFunc){
		r.appendChild(Header(html, css, attr, onclickFunc));
		return this;
	}
	/**
	 * セル追加
	 */
	this.add = function(html, css, attr, onclickFunc){
		r.appendChild(Cell(html, css, attr, onclickFunc));
		return this;
	}
}
/**
 * ヘッダ
 */
function Header(html, css, attr, func){
	return TableTag("TH", html, css, attr, func);
}
/**
 * セル
 */
function Cell(html, css, attr, func){
	return TableTag("TD", html, css, attr, func);
}
/**
 * Table内のタグ生成
 */
function TableTag(tagName, html, css, attr, func){
	// セル生成
	const c = Elem(tagName);
	// HTMLが宣言されている理由
	if(html != null){
		// 文字列の場合
		if(typeof html == "string" || typeof html == "number"){
			// innerHTMLで反映
			c.innerHTML = html;
		// DOMオブジェクトの場合
		}else{
			// セルに追加
			c.appendChild(html);
		}
	}
	// CSSが定義されている場合
	if(css){
		// CSSの反映
		for(let styleName in css){
			c.style[styleName] = css[styleName];
		}
	}
	// 属性指定が定義されている場合
	if(attr){
		// 属性の反映
		for(let attrName in attr){
			c.setAttribute(attrName, attr[attrName]);
		}
	}
	// onclick時の関数が指定されている場合
	if(func != null){
		c.onclick = func;
	}
	// Elementを返却
	return c;
}
/**
 * アンカー（リンク）
 */
function Anchor(label , func){
	const a = Elem("a");
	a.href = "javascript:void(0)";
	a.innerText = label;
	a.onclick = func;
	return a;
}
