window.switch_on = false;
window.timeWindow = 60;
window.hashIndex = {};
window.allPossibleElements = [];
select(document, popup); 
window.onmousedown=function(e){
	//console.log(1987);
	//console.log(window.switch_on);
	if (!window.switch_on) {
		return;
	}
	window.st = setTimeout(function(){
		window.switch_on = false;
		var rTop = document.getElementsByClassName("show_diy_button");
		for (i in rTop) {
			if (rTop[i].style) {
				rTop[i].style.display="none";
			}
		}
	}, 220);

}
function select(o, fn){ 
	o.onmouseup = function(e){ 
		var event = window.event || e; 
		var ev = getMousePos(event);
		x = ev["x"];
		y = ev["y"];
		var target = event.srcElement ? event.srcElement : event.target;
		if (/input|textarea/i.test(target.tagName) && /firefox/i.test(navigator.userAgent)) { 
			//Firefox在文本框内选择文字
			var staIndex=target.selectionStart; 
			var endIndex=target.selectionEnd; 
			if(staIndex!=endIndex){ 
				var sText=target.value.substring(staIndex,endIndex); 
				fn(sText,target); 
			} 
		} else { 
			//获取选中文字
			var sText = document.selection == undefined ? document.getSelection().toString():document.selection.createRange().text; 
			if (sText != "") { 
				//将参数传入回调函数fn
				fn(sText, target,x ,y); 
			}
		}
	}
}

function createButton(x,y, txt,type){
	window.switch_on = true;
	var rTop = document.createElement("input");
	//rTop.innerHTML = "<input type=button value='查询情报' onclick='call_dialog()'></input>";
	rTop.style.cssText = "width:170px; height:30px; text-align:center; font-size:small; line-height:30px; border:1px solid; position:absolute; right:0; bottom:0; margin:5px; cursor:pointer;border-radius: 5px;background: rgb(0, 118, 204);color: rgb(255, 255, 255);";
	rTop.style.left = x;
	rTop.style.top = y;
	rTop.type="button";
	rTop.value="查情报:"+txt;
	rTop.style.display="block";
	rTop.className="show_diy_button";
	rTop.onclick = function(){
		clearTimeout(window.st);
		chrome.runtime.sendMessage("{\"action\":\"get\"}", function(response){
			if (!response) {
				alert("请先点击右上角的按钮，配置情报平台。");
			}
			var configStr = unescape(response);
			//configMap = json.parse(configStr);
			localStorage.setItem("config", configStr);
			var iocArr = JSON.parse(JSON.parse(localStorage.getItem("config"))["ioc"]);
			for (var i=0; i<iocArr.length; i++) {
				if (iocArr[i].indexOf("{IP}") > -1) {
					window.IOC_IP_API = iocArr[i];
				} else if (iocArr[i].indexOf("{DOMAIN}") > -1) {
					window.IOC_DOMAIN_API = iocArr[i];
				}
			}
			switch (type) {
				case 1:
					//var url ="http://10.110.101.104:8000/table_agent/intelli_detail/?ioc=" + txt;
					if (window.IOC_IP_API) {
						var url = window.IOC_IP_API.replace(/\{IP\}/ig, txt);
						//console.log(url);
						window.open(url);
					}

					break;
				case 2:
					if (window.IOC_IP_API) {
						var url = window.IOC_DOMAIN_API.replace(/\{DOMAIN\}/ig, txt);
						//console.log(url);
						window.open(url);
					}

					break;
			}
			
			//document.body.appendChild(sc);
			window.switch_on = false;
			var rTop = document.getElementsByClassName("show_diy_button");
			for (i in rTop) {
				if (rTop[i].style) {
					rTop[i].style.display="none";
				}
			}
		});
	}
	document.body.append(rTop);
	//window.onkeydown=function(e){
	//	window.rTop.style.display="none";
	//}
}



function getMousePos(event) {
       var e = event || window.event;
       var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
       var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
       var x = e.pageX || e.clientX + scrollX;
       var y = e.pageY || e.clientY + scrollY;
       x = x + 5;
       y = y + 5;
       //alert('x: ' + x + '\ny: ' + y);
       return { 'x': x, 'y': y };
}

function popup(txt,tar,x,y){ 
	//alert("文字属于"+tar.tagName+"元素，选中内容为："+txt); 
	//alert(tar.offsetTop);
	//x = tar.offsetLeft;
	//y = tar.offsetHeight;
	//alert(y);
	//alert(tar.scrollHeight);
	//ev = getMousePos
	//window.ev = tar;
	// 正则匹配IP
	if (window.switch_on) {
		return;
	}
	txt = txt.trim();
	reg_str = /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/g
	if (txt.search(reg_str) > -1) {
		var ip = txt.trim()
		console.log(222);
		createButton(x+"px",y+"px", ip, 1);
	} else {
		reg_str = /^[0-9a-zA-Z-\.]{0,60}\.[a-zA-Z]{2,3}$/g
		if (txt.search(reg_str) > -1) {
			var domain = txt.trim()
			createButton(x+"px",y+"px", domain, 2);
		}
	}

	
}

function show_evil_ip(s) {
	alert(s);
	
}


window.onload = function(){
	if (document.location.host == "fofa.so" && document.location.pathname == "/") {
		var searchStr = unescape(location.hash.substring(1));
		if (searchStr.indexOf("sechelpertarget:") > -1) {
			searchStr = searchStr.replace("sechelpertarget:", "");
			document.getElementById("q").value = searchStr;
			document.getElementById("search_form").submit();	
		}
	}
	chrome.runtime.sendMessage("{\"action\":\"getiocmatchedurls\"}", function(urls){
		if (!urls) {
			// 没设置ioc作用域
			return;
		}
		var matchCurrentUrl = false;
		var urlList = urls.split("\n");
		for (var i=0; i<urlList.length; i++) {
			var url = urlList[i];
			url = url.replace("*", "");
			if (document.URL.indexOf(url) > -1) {
				matchCurrentUrl = true;
				break;
			}
		}
		if (matchCurrentUrl) {
			setInterval(function(){
				topLightIOC();
			},6000);
			setInterval(function(){
				chrome.runtime.sendMessage("{\"action\":\"getiocresult\"}", function(iocHashList){
					for (var i=0; i<iocHashList.length;i++) {
						var ioc = iocHashList[i]
				    	if (window.hashIndex[ioc]!=undefined) {
				    		var indexList = window.hashIndex[ioc];
				    		for (var j=0; j<indexList.length; j++) {
				    			var index = indexList[j];
				    			allPossibleElements[index].innerHTML = allPossibleElements[index].innerHTML.replace(allPossibleElements[index].innerText, "<b style='color:red' id='sechelper'>"+allPossibleElements[index].innerText+"</b>");
				    		}
				    	}					
					}

				});
			}, 8000);
		}
	});
}

function topLightIOC() {
		window.allPossibleElements = [];
		var watchTags = ["td", "span", "p", "div", "a"];
		for (var j=0; j<watchTags.length; j++) {
			var aTagName = watchTags[j];
			var oneTypeElement = document.getElementsByTagName(aTagName);// + document.getElementsByTagName("p") + document.getElementsByName("div") + document.getElementsByName("span");
			for (var i=0; i< oneTypeElement.length; i++) {
				allPossibleElements.push(oneTypeElement[i])
			} 
		}

		for (var i=0; i<allPossibleElements.length; i++) {
		    if (allPossibleElements[i].innerText && allPossibleElements[i].innerText.length == 0) {
		        continue
		    }
		    if (allPossibleElements[i].innerText && allPossibleElements[i].innerText.length > 100) {
		        continue
		    } else if (allPossibleElements[i].innerText && allPossibleElements[i].innerText.length > 0) {
		        if (allPossibleElements[i].innerText.search(/^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/g)>-1 || allPossibleElements[i].innerText.search(/^[0-9a-zA-Z-\.]{0,60}\.[a-zA-Z]{2,3}$/g)>-1) {
		            //console.log(allPossibleElements[i].innerText);
		            if (allPossibleElements[i].innerHTML.indexOf("<b style='color:red' id='sechelper'>")>-1) {
		            	// 标记过了
		            	continue
		            }
		            //allPossibleElements[i].innerHTML = allPossibleElements[i].innerHTML.replace(allPossibleElements[i].innerText, "<b style='color:red' id='sechelper'>"+allPossibleElements[i].innerText+"</b>");
		            var ioc = hash(allPossibleElements[i].innerText);
		            var sendObj = {
		            	"action": "checkioc",
		            	"ioc": ioc
		            }
		            if (window.hashIndex[ioc]) {
		            	window.hashIndex[ioc].push(i);
		            } else {
		            	window.hashIndex[ioc] = [i];
		            }
		            
		            chrome.runtime.sendMessage(JSON.stringify(sendObj));
		        }
		    }
		}
}





function hash(str) {
	hashStr = md5(str);
	hashStr = hashStr.substring(0,7);
	return hashStr;
}
!function(n){"use strict";function t(n,t){var r=(65535&n)+(65535&t);return(n>>16)+(t>>16)+(r>>16)<<16|65535&r}function r(n,t){return n<<t|n>>>32-t}function e(n,e,o,u,c,f){return t(r(t(t(e,n),t(u,f)),c),o)}function o(n,t,r,o,u,c,f){return e(t&r|~t&o,n,t,u,c,f)}function u(n,t,r,o,u,c,f){return e(t&o|r&~o,n,t,u,c,f)}function c(n,t,r,o,u,c,f){return e(t^r^o,n,t,u,c,f)}function f(n,t,r,o,u,c,f){return e(r^(t|~o),n,t,u,c,f)}function i(n,r){n[r>>5]|=128<<r%32,n[14+(r+64>>>9<<4)]=r;var e,i,a,d,h,l=1732584193,g=-271733879,v=-1732584194,m=271733878;for(e=0;e<n.length;e+=16)i=l,a=g,d=v,h=m,g=f(g=f(g=f(g=f(g=c(g=c(g=c(g=c(g=u(g=u(g=u(g=u(g=o(g=o(g=o(g=o(g,v=o(v,m=o(m,l=o(l,g,v,m,n[e],7,-680876936),g,v,n[e+1],12,-389564586),l,g,n[e+2],17,606105819),m,l,n[e+3],22,-1044525330),v=o(v,m=o(m,l=o(l,g,v,m,n[e+4],7,-176418897),g,v,n[e+5],12,1200080426),l,g,n[e+6],17,-1473231341),m,l,n[e+7],22,-45705983),v=o(v,m=o(m,l=o(l,g,v,m,n[e+8],7,1770035416),g,v,n[e+9],12,-1958414417),l,g,n[e+10],17,-42063),m,l,n[e+11],22,-1990404162),v=o(v,m=o(m,l=o(l,g,v,m,n[e+12],7,1804603682),g,v,n[e+13],12,-40341101),l,g,n[e+14],17,-1502002290),m,l,n[e+15],22,1236535329),v=u(v,m=u(m,l=u(l,g,v,m,n[e+1],5,-165796510),g,v,n[e+6],9,-1069501632),l,g,n[e+11],14,643717713),m,l,n[e],20,-373897302),v=u(v,m=u(m,l=u(l,g,v,m,n[e+5],5,-701558691),g,v,n[e+10],9,38016083),l,g,n[e+15],14,-660478335),m,l,n[e+4],20,-405537848),v=u(v,m=u(m,l=u(l,g,v,m,n[e+9],5,568446438),g,v,n[e+14],9,-1019803690),l,g,n[e+3],14,-187363961),m,l,n[e+8],20,1163531501),v=u(v,m=u(m,l=u(l,g,v,m,n[e+13],5,-1444681467),g,v,n[e+2],9,-51403784),l,g,n[e+7],14,1735328473),m,l,n[e+12],20,-1926607734),v=c(v,m=c(m,l=c(l,g,v,m,n[e+5],4,-378558),g,v,n[e+8],11,-2022574463),l,g,n[e+11],16,1839030562),m,l,n[e+14],23,-35309556),v=c(v,m=c(m,l=c(l,g,v,m,n[e+1],4,-1530992060),g,v,n[e+4],11,1272893353),l,g,n[e+7],16,-155497632),m,l,n[e+10],23,-1094730640),v=c(v,m=c(m,l=c(l,g,v,m,n[e+13],4,681279174),g,v,n[e],11,-358537222),l,g,n[e+3],16,-722521979),m,l,n[e+6],23,76029189),v=c(v,m=c(m,l=c(l,g,v,m,n[e+9],4,-640364487),g,v,n[e+12],11,-421815835),l,g,n[e+15],16,530742520),m,l,n[e+2],23,-995338651),v=f(v,m=f(m,l=f(l,g,v,m,n[e],6,-198630844),g,v,n[e+7],10,1126891415),l,g,n[e+14],15,-1416354905),m,l,n[e+5],21,-57434055),v=f(v,m=f(m,l=f(l,g,v,m,n[e+12],6,1700485571),g,v,n[e+3],10,-1894986606),l,g,n[e+10],15,-1051523),m,l,n[e+1],21,-2054922799),v=f(v,m=f(m,l=f(l,g,v,m,n[e+8],6,1873313359),g,v,n[e+15],10,-30611744),l,g,n[e+6],15,-1560198380),m,l,n[e+13],21,1309151649),v=f(v,m=f(m,l=f(l,g,v,m,n[e+4],6,-145523070),g,v,n[e+11],10,-1120210379),l,g,n[e+2],15,718787259),m,l,n[e+9],21,-343485551),l=t(l,i),g=t(g,a),v=t(v,d),m=t(m,h);return[l,g,v,m]}function a(n){var t,r="",e=32*n.length;for(t=0;t<e;t+=8)r+=String.fromCharCode(n[t>>5]>>>t%32&255);return r}function d(n){var t,r=[];for(r[(n.length>>2)-1]=void 0,t=0;t<r.length;t+=1)r[t]=0;var e=8*n.length;for(t=0;t<e;t+=8)r[t>>5]|=(255&n.charCodeAt(t/8))<<t%32;return r}function h(n){return a(i(d(n),8*n.length))}function l(n,t){var r,e,o=d(n),u=[],c=[];for(u[15]=c[15]=void 0,o.length>16&&(o=i(o,8*n.length)),r=0;r<16;r+=1)u[r]=909522486^o[r],c[r]=1549556828^o[r];return e=i(u.concat(d(t)),512+8*t.length),a(i(c.concat(e),640))}function g(n){var t,r,e="";for(r=0;r<n.length;r+=1)t=n.charCodeAt(r),e+="0123456789abcdef".charAt(t>>>4&15)+"0123456789abcdef".charAt(15&t);return e}function v(n){return unescape(encodeURIComponent(n))}function m(n){return h(v(n))}function p(n){return g(m(n))}function s(n,t){return l(v(n),v(t))}function C(n,t){return g(s(n,t))}function A(n,t,r){return t?r?s(t,n):C(t,n):r?m(n):p(n)}"function"==typeof define&&define.amd?define(function(){return A}):"object"==typeof module&&module.exports?module.exports=A:n.md5=A}(this);
//# sourceMappingURL=md5.min.js.map