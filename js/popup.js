document.addEventListener('DOMContentLoaded', function() {
    // 初始化IOC的默认配置
    document.getElementById("threadbook").value = JSON.stringify(["https://x.threatbook.cn/nodev4/ip/{IP}", "https://x.threatbook.cn/nodev4/domain/{DOMAIN}"]);
    document.getElementById("360").value = JSON.stringify(["https://ti.360.cn/#/DetailPage/searchResult?query={IP}", "https://ti.360.cn/#/DetailPage/searchResult?query={DOMAIN}"]);
    document.getElementById("vt").value = JSON.stringify(["https://www.virustotal.com/gui/ip-address/{IP}/detection", "https://www.virustotal.com/gui/domain/{DOMAIN}/detection"]);
    document.getElementById("nf").value = JSON.stringify(["https://nti.nsfocus.com/ip?query={IP}&type=all", "https://nti.nsfocus.com/web?query={DOMAIN}&type=all"]);
    document.getElementById("ze").value = JSON.stringify(["https://www.zoomeye.org/searchResult?q={IP}", "https://www.zoomeye.org/searchResult?q={DOMAIN}"]);
    document.getElementById("fofa").value = JSON.stringify(["https://fofa.so/%23sechelpertarget:{IP}", "https://fofa.so/%23sechelpertarget:{DOMAIN}"]);
    document.getElementById("tools1").value = JSON.stringify(["http://s.tool.chinaz.com/same?s={IP}&page=", "http://whois.chinaz.com/{DOMAIN}"]);
    if (localStorage.getItem("diyPlat")) {
        document.getElementById("iocdiy").value = localStorage.getItem("diyPlat");
    }

    if (localStorage.getItem("config")) {
        // 初始化界面选项
        var configMap = JSON.parse(localStorage.getItem("config"));
        switch (configMap["iocType"]) {
            case "threadbook":
                document.getElementById("threadbook").checked = true;
                //document.getElementById("threadbook").click();
                break;
            case "360":
                document.getElementById("360").checked = true;
                //document.getElementById("360").click();
                break;
            case "vt":
                document.getElementById("vt").checked = true;
                break;
            case "nf":
                document.getElementById("nf").checked = true;
                break;
            case "ze":
                document.getElementById("ze").checked = true;
                break;
            case "fofa":
                document.getElementById("fofa").checked = true;
                break;
            case "diy":
                document.getElementById("diy").checked = true;
                break;
            case "tools1":
                document.getElementById("tools1").checked = true;
                break;
            default:
                document.getElementById("threadbook").checked = true;
                configMap["ioc"] = document.getElementById("threadbook").value;
                configMap["iocType"] = "threadbook";
                break;
        }
        if (configMap["dbg"] && configMap["dbg"].length > 0) {
            document.getElementById("dbg").value = configMap["dbg"];
        }        
        if (configMap["siem_type"] && configMap["siem_type"].length > 0) {
            switch (configMap["siem_type"]) {
                case "usm":
                    document.getElementById("usm").checked = true;
                    break;
                case "dbg":
                    document.getElementById("dbg_siem").checked = true;
                    break;
            }
        }
        if (configMap["ioc_update_url"] && configMap["ioc_update_url"].length > 0) {
            document.getElementById("ioc_update_url").value = configMap["ioc_update_url"];
        }
        if (configMap["offline_ioc_sites"] && configMap["offline_ioc_sites"].length > 0) {
            document.getElementById("offline_ioc_sites").value = configMap["offline_ioc_sites"];
        } else {
            document.getElementById("offline_ioc_sites").value = "http://192.168.1.2:8080/\nhttp://192.168.1.3/";
        }
    } else {
        // 第一次打开的初始化
        var configMap = {};
        document.getElementById("threadbook").checked = true;
        configMap["ioc"] = document.getElementById("threadbook").value;
        configMap["iocType"] = "threadbook";
        document.getElementById("iocdiy").value = "https://www.baidu.com/s?wd={IP}\nhttps://www.baidu.com/s?wd={DOMAIN}";
        document.getElementById("ioc_update_url").value = "https://starso.oss-cn-beijing.aliyuncs.com/starso_opensource_ioc.txt";
        document.getElementById("offline_ioc_sites").value = "http://192.168.1.2:8080/\nhttp://192.168.1.3/";
    }

    document.getElementById("diy").onclick = function() {
        document.getElementById("iocdiy").type = "text";
    }
    document.getElementById("save").onclick = function() {
        var configMap = {};
        configMap["action"] = "save";
        if (document.getElementById("threadbook").checked) {
            configMap["ioc"] = document.getElementById("threadbook").value;
            configMap["iocType"] = "threadbook";
        } else if (document.getElementById("360").checked) {
            configMap["ioc"] = document.getElementById("360").value;
            configMap["iocType"] = "360";
        } else if (document.getElementById("vt").checked) {
            configMap["ioc"] = document.getElementById("vt").value;
            configMap["iocType"] = "vt";
        } else if (document.getElementById("nf").checked) {
            configMap["ioc"] = document.getElementById("nf").value;
            configMap["iocType"] = "nf";
        } else if (document.getElementById("ze").checked) {
            configMap["ioc"] = document.getElementById("ze").value;
            configMap["iocType"] = "ze";
        } else if (document.getElementById("fofa").checked) {
            configMap["ioc"] = document.getElementById("fofa").value;
            configMap["iocType"] = "fofa";
        } else if (document.getElementById("tools1").checked) {
            configMap["ioc"] = document.getElementById("tools1").value;
            configMap["iocType"] = "tools1";
        } else if (document.getElementById("diy").checked) {
            try {
                // 验证是JSON格式
                JSON.parse(document.getElementById("iocdiy").value);
                configMap["ioc"] = document.getElementById("iocdiy").value;
            } catch(e) {
                if (document.getElementById("iocdiy").value.indexOf("\n") > -1) {
                    var iocUrl1 = document.getElementById("iocdiy").value.split("\n")[0];
                    var iocUrl2 = document.getElementById("iocdiy").value.split("\n")[1];
                    iocUrl1 = iocUrl1.trim();
                    iocUrl2 = iocUrl2.trim();
                    if (iocUrl1.indexOf("http")==0 && iocUrl2.indexOf("http")==0) {
                        configMap["ioc"] = JSON.stringify([iocUrl1, iocUrl2]);
                    } else {
                        showInfo("自定义地址需要以http开头")
                        return;
                    }
                } else {
                    var iocUrl = document.getElementById("iocdiy").value.trim();
                    if (iocUrl.indexOf("http")==0) {
                        configMap["ioc"] = JSON.stringify([iocUrl]);
                    } else {
                        showInfo("自定义地址需要以http开头")
                        return;
                    }
                }
            }
            
            configMap["iocType"] = "diy";
        }
        configMap["ioc_update_url"] = document.getElementById("ioc_update_url").value;
        configMap["offline_ioc_sites"] = document.getElementById("offline_ioc_sites").value;
        localStorage.setItem("diyPlat", document.getElementById("iocdiy").value);
        configStr = JSON.stringify(configMap);
        chrome.runtime.sendMessage(configStr, function(){
            localStorage.setItem("config", configStr)
            showInfo("保存成功");
        })
    }
});

function showInfo(msg) {
    document.getElementById("showinfor").innerText = msg;
}