
  //CONTEXT MENU
  
  
  var volume;
  chrome.contextMenus.create({"title":"Open Popup...","onclick":function(){
	window.open("popup.html", "extension_popup", "resizable=0,width=220,height=270,menubar=1");
  }});
  
  chrome.commands.onCommand.addListener(function(command){
	console.log(command)
	if(command === 'pause-video'){
		chrome.storage.local.get("default_tab",function(result){
			var text = "if(ytplay.getVideoStats().state == 4 || ytplay.getVideoStats().state == 45){ytplay.playVideo()}else{ytplay.pauseVideo()}";
			//console.log(result);
			chrome.tabs.sendMessage(parseInt(result.default_tab),{id:"code", string:text});
		});
	}
	else if(command === 'next-video'){
		chrome.storage.local.get("default_tab",function(result){
			chrome.tabs.sendMessage(parseInt(result.default_tab),{id:"code", string:"customNextVideo();"});
		});
	}
	else if(command === 'previous-video'){
		chrome.storage.local.get("default_tab",function(result){
			chrome.tabs.sendMessage(parseInt(result.default_tab),{id:"code", string:"customPreviousVideo();"});
		});
	}
	else if(command === 'restart-video'){
		chrome.storage.local.get("default_tab",function(result){
			chrome.tabs.sendMessage(parseInt(result.default_tab),{id:"code", string:"vidplayer.currentTime=0;"});
		});
	}
  });
  
  
  chrome.runtime.onMessage.addListener(function(msg,sender,response){ 
	if(msg.id == "SetVolume"){
		volume = msg.value;
	}
	if(msg.id == "RequestVolume"){
		chrome.tabs.sendMessage(sender.tab.id,{id:"ReturnVolume",value:volume});
		//console.log(sender)
	}
  });
 

  
//ADDS POPUP
 chrome.runtime.onInstalled.addListener(function() {

    
  });
  
  //RUNS WHEN TAB CLOSED
  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
		chrome.storage.local.get("tabs",function(result){
			tabs = (result != undefined ? String(result.valueOf().tabs) : "");
			tabs = tabs.replace("."+tabId+"|", "");
			//alert(tabs);
			chrome.storage.local.set({"tabs":tabs});
			chrome.runtime.sendMessage({key:"tab_update",tab:tabId});
			//chrome.contextMenus.remove("."+tabId+"|");
		});
  });
  
  //RUN WHEN TAB OPENED
  chrome.tabs.onCreated.addListener(function(createdTab){
	/*if(createdTab.url.includes("www.youtube.com")){
		chrome.storage.local.get("tabs",function(result){
			tabs = result.valueOf().tabs;
			tabs = String(tabs) +"." + createdTab.id + "|";
			alert(tabs);
			chrome.storage.local.set({"tabs":tabs});
		});
	}	*/ //on updated takes care of this
  });
  
  //RUN WHEN TAB UPDATED
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	//console.log(changeInfo);
	//console.log(tabId);
	//console.log(tab);
	try{
	if(changeInfo.url.includes("www.youtube.com/watch?v=")){
		//console.log("we're in");
		//chrome.runtime.sendMessage({key:"tab_pass",id:tab.id});
		chrome.tabs.sendMessage(tabId,{id:"youtube"});
		chrome.storage.local.get("tabs",function(result){
			if(result != undefined){
				tabs = result.valueOf().tabs
			}
			else{
				tabs = ""
			}
			// tabs = (result != undefined ? result.valueOf().tabs : "");
			if(!(typeof tabs === 'undefined')){
				tabs = tabs.replace("undefined","");
			}
			//console.log(tabs);
			
			if(!(String(tabs).includes("." + tab.id + "|"))){
				tabs = String(tabs) + "." + tab.id + "|";
				//console.log(tabs);
				chrome.storage.local.set({"tabs":tabs});	
				
			}});
			console.log(tab)
			chrome.runtime.sendMessage({key:"tab_pass",id:tab.id});
	}
	else{
		chrome.tabs.sendMessage(tabId,{id:"youtube_not"});
	}
	}
	catch(event){
	if(!tab.url.includes("www.youtube.com/watch?v=")){
		//console.log("hello");
		chrome.storage.local.get("tabs",function(result){
			tabs = (result != undefined ? String(result.valueOf().tabs) : "");
			tabs = tabs.replace("."+tabId+"|", "");
			//alert(tabs);
			chrome.storage.local.set({"tabs":tabs});
			chrome.runtime.sendMessage({key:"tab_update",tab:tabId});
			//chrome.contextMenus.remove("."+tabId+"|");
		});
	}
	}
	
});

  
