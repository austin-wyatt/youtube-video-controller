document.getElementById("bSubmit").addEventListener("click", sendToStorage);
//document.getElementById("bClear").addEventListener("click", clearAllData);
document.getElementById("bList").addEventListener("click", listAllData);
document.getElementById("bRemove").addEventListener("click", removeItem);

document.getElementById("listTabs").addEventListener("click", listAllTabs); //TEMP

function sendToStorage(){
	var url = document.getElementById("urlField");
	var en = document.getElementById("endField");
	
	var urlval = url.value;
	var enval = en.value;
	
	var obj = {};
	if(urlval != "" && enval != ""){
		chrome.storage.local.get("url",function(result){
			var temp = result.valueOf().url;
			chrome.storage.local.set({"url" : temp + urlval + "|" + enval + "\n"});
			listAllData();
		});
		//chrome.storage.local.set({url : urlval + "|" + enval});
		url.value = "";
		en.value = "";
	}
	else if(urlval.includes('|')){
		chrome.storage.local.get("url",(result) => {
			var temp = result.valueOf().url;
			chrome.storage.local.set({"url" : temp + urlval + "\n"});
			listAllData();
		});
	}
	
}
function clearAllData(){
	//chrome.storage.local.clear();
	chrome.storage.local.set({"url":""});
	listAllData();
}
function listAllData(){
	var list = document.getElementById("listArea");
	list.value = "";
	chrome.storage.local.get("url",function(result){
		var urls = result.valueOf().url;
		/*while(urls.indexOf("|")>0){
			urls = urls.replace("|"," ");
		}*/
		list.value = String(urls);
	});
}
function removeItem(){
	var url = document.getElementById("urlField");
	if(url.value != ""){
	chrome.storage.local.get("url",function(result){
			var temp = result.valueOf().url;
			temp = temp.replace(url.value + "\n","");
			chrome.storage.local.set({"url" : temp});
			listAllData();
		});
	}
}

function listAllTabs(){
	var list = document.getElementById("listArea");
	list.value = "";
	chrome.storage.local.get("tabs",function(result){
		var tabs = result.valueOf().tabs;
		list.value = String(tabs);
	});
}
