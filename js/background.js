window.iocResult = [];
function httpRequest(url, callback){
	var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			//alert(xhr.responseText);
			callback(xhr.responseText);
		}
    }
    xhr.send();
}

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    //console.log(message);
    message = unescape(message);
    try {
        var obj = JSON.parse(message);
        var action = obj["action"];
        if (action == "save") {
            localStorage.setItem("config", message);
            sendResponse("ok");
            updateOfflineIOC();
        }
        if (action == "get") {
            var outPut = localStorage.getItem("config", message);
            sendResponse(outPut);
        }
        if (action == "checkioc") {
            var ioc = obj["ioc"];
            getIOC(ioc);
            //sendResponse("ok");
        }
        if (action == "getiocresult") {
            sendResponse(window.iocResult);
            //window.iocResult = [];
        }
        if (action == "getiocmatchedurls") {
            var responseBody = JSON.parse(localStorage.getItem("config"))["offline_ioc_sites"];
            if (responseBody && responseBody.length > 0) {
                sendResponse(responseBody);
            } else {
                sendResponse(false);
            }
            
        }
    } catch(e) {
        console.log(e);
    }
    //if (message.indexOf("http://") == 0) {
	//	httpRequest(message, sendResponse);
        //sendResponse(wlist);
    //}
    
});


function httpGet(url) {
    xmlhttp=new XMLHttpRequest();
    xmlhttp.open("GET",url);
    xmlhttp.send();
    xmlhttp.onreadystatechange = function(){
        if (xmlhttp.readyState==4 && xmlhttp.status==200) {
            var iocRaw = xmlhttp.responseText;
            var arr = iocRaw.split("\n");
            var arrClear = [];
            var j = 0;
            for (var i = 0; i < arr.length; i++) {
                var temp = arr[i].trim();
                if (temp.length < 4) {
                    continue;
                }
                if (arrClear.includes(temp)) {
                    continue
                } else {
                    arrClear.push(temp);
                }
                
                if (j==10) {
                    addIOC(arrClear);
                    j=0;
                    arrClear = [];
                }
                j++;
            }
        }
    }
}


function updateOfflineIOC() {
    databaseName="ioc";
    var updateURL = false;
    if (localStorage.getItem("config") && JSON.parse(localStorage.getItem("config"))["ioc_update_url"]) {
        updateURL = JSON.parse(localStorage.getItem("config"))["ioc_update_url"];
        var request = window.indexedDB.open(databaseName,1);
        request.onupgradeneeded = function (event) {
          db = event.target.result;
          var objectStore;
          if (!db.objectStoreNames.contains('ioc')) {
            objectStore = db.createObjectStore('ioc', {keyPath: 'id', autoIncrement: true});
            objectStore.createIndex('ioc', 'ioc', { unique: true });
          }
        }
        request.onsuccess = function(e) {
            db = e.target.result;
            httpGet(updateURL);
        }

    }   
}



function addIOC(iocList) {
    var request = db.transaction(['ioc'], 'readwrite').objectStore('ioc');
    request.onsuccess = function (event) {
        console.log('数据写入成功');
    };

    request.onerror = function (event) {
        console.log('数据写入失败');
    }
    for (var i=0;i < iocList.length; i++) {
        request.add({ioc: iocList[i]});
    }
}

function getIOC(ioc) {
   var transaction = db.transaction(['ioc'], 'readwrite');
   var store = transaction.objectStore('ioc');
   var index = store.index('ioc');
   var request = index.get(ioc);
   request.onerror = function(event) {
     console.log('事务失败');
   };
   request.onsuccess = function(event) {
        if (event.target.result) {
            var sendObj = {
                "action": "ioc",
                "ioc": ioc
            }
            //chrome.runtime.sendMessage(sendObj)
            if (!window.iocResult.includes(ioc)) {
                window.iocResult.push(ioc)
            }
        }
   };
}

updateOfflineIOC();
