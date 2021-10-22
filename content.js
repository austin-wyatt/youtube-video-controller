var urls = ""
var intervals = []
var timer = null
const initializeString = 'youtubeVideoControllerEXT'

let temp = document.getElementById(initializeString)
let tabDisabled = temp ? temp.getAttribute('disabled') == 'true' : false;
//var volume = 5;
//Message listener
chrome.runtime.onMessage.addListener(function(msg,sender,response){ 
	if(msg.id == "code"){
		injectString(msg.string);
		// console.log(msg)
	}
	else if(msg.id == "youtube"){
		injectString("var xpathResult = document.evaluate('//*[@id=\"container\"]/h1/yt-formatted-string',document,null,XPathResult.FIRST_ORDERED_NODE_TYPE, null );document.title = xpathResult.singleNodeValue.innerText + ' - Youtube';")
		youtube = true;
		

		setTimeout(initialize, 1000)
		// initialize(true);
		prev_youtube = false;
		//chrome.runtime.sendMessage({id:"title_update"});
		
		//console.log("coolio");
	}
	else if(msg.id == "youtube_not"){
		youtube = false;
		prev_youtube = false;
	}
	else if(msg.id == "settime"){
		var temp = document.getElementsByTagName("video")[0];
		temp.currentTime = msg.value * temp.duration;
	}
	else if(msg.id == "setloop"){
		var temp = document.getElementsByTagName("video")[0];
		temp.loop = msg.value;
		
	}
	else if(msg.id == "setdisabled"){
		var temp = document.getElementById(initializeString);
		if(temp)
			temp.setAttribute('disabled', msg.value);
		tabDisabled = msg.value
	}
	else if(msg.id == "getplaylist"){
		//var temp = document.getElementById("PLAYLISTINFO");
		let usingPlaylist = true; //determines whether using playlist or recommended videos

		var temp = document.querySelectorAll(".playlist-items.style-scope.ytd-playlist-panel-renderer")[1]
		var current = temp.baseURI.replace("https://youtube.com","");
		current = current.replace("https://www.youtube.com","");


		if(temp.childElementCount == 0){
			//this is the branch taken if the playlist container does not exist
			temp = document.querySelectorAll('ytd-watch-next-secondary-results-renderer')[0]
			current = temp.baseURI.replace("https://youtube.com","");
			current = current.replace("https://www.youtube.com","");

			temp = temp.querySelectorAll('A.ytd-compact-video-renderer')
			// temp = temp.getElementsByTagName('A')
			// let newTemp = []
			// let index = 0
			// while(index < temp.length){
			// 	if(temp[index].className == "yt-simple-endpoint style-scope ytd-compact-video-renderer")
			// 		newTemp.push(temp[index])
			// 	index += 1
			// }
			// temp = newTemp
			usingPlaylist = false
		}
		else
		{
			//this is the branch taken if the playlist container does exist
			temp = temp.getElementsByTagName('A')
			let newTemp = []
			let index = 0
			while(index < temp.length){
				if(temp[index].id == "wc-endpoint")
					newTemp.push(temp[index])
				index += 1
			}
			temp = newTemp
			usingPlaylist = true			
		}


		result = [];
		//console.log(current);
		for(i = 0; i < temp.length; i++){
			if(usingPlaylist){
				result[i] = 
					{url:temp[i].href, 
					title:temp[i].querySelector("#video-title").innerText, current:current};
			}
			else{
				result[i] = {
					url:temp[i].href,
					title:temp[i].querySelector("#video-title").innerText,
					current:current
				}
			}
		}

		//console.log(result);
		if(result.length == 0){
			result = [{current:"no"}];
		}
		chrome.runtime.sendMessage({id:"playlist",playlist:result});
	}
	else if(msg.id == "playlist_video"){
		if(msg.index)
			injectString("goToVideoFromPlaylist("+ msg.index + ",'playlist');");
		else{
			injectString("goToVideoFromPlaylist("+ msg.altIndex + ",'recommended');");
		}
	}
	//else if(msg.id == "ReturnVolume"){
		//volume = msg.value;
		//injectString("document.getElementById('movie_player').setVolume("+volume+");")
		//console.log(volume)
	//}
	
});
var youtube = false;//"https://www.youtube.com/watch*"
var prev_youtube = false;
initialize(true);

//chrome.runtime.sendMessage({id:"RequestVolume"});
//injectString("document.getElementById('movie_player').getVolume();")

intervals.push(setInterval(initialize_check,100))

init = false
init_prev = false
function initialize_check(){
	//console.log(document.getElementById("INITIALIZE_CHECK"))
	//console.log("test")
	if(!init){
		init_prev = false;
	}
	if(document.getElementById("INITIALIZE_CHECK")){
		init = true;
		//console.log("yes")
		if(!init_prev){
			//chrome.runtime.sendMessage({id:"volume_update"});
			try{
			chrome.runtime.sendMessage({id:"title_update"});
			}
			catch(error){
				console.error(error)
			}
			//injectString("ytplay.setVolume("+volume+");")
			for(i in intervals){
				clearInterval(intervals[i])
			}
		}
		init_prev = true
	}
	else{
		init = false
	}
}

function initialize(d = false){
	//if((youtube || d) && !prev_youtube){
	try{
	if(!window.history.state || (window.history.state && window.history.state.endpoint && ((window.history.state.endpoint.watchEndpoint && !!window.history.state.endpoint.watchEndpoint.videoId) || 
			(window.history.state.endpoint.urlEndpoint && window.history.state.endpoint.urlEndpoint.url.includes('watch?'))))){
		if(document.getElementById(initializeString) == undefined && document.URL.includes('watch?')){
			prev_youtube = true;
			console.log('---------------- attempting intialize')
			var s = document.createElement('script');
			s.src = chrome.runtime.getURL('script.js');
			
			(document.head || document.documentElement).appendChild(s);
			
			//inject script.js

			var p = document.createElement("script");
			chrome.storage.local.get("url",function(result){
					urls = result.valueOf().url;
					urls = urls.replace(/\n/g,".");
					//urls = urls.split("");
					var t = document.createTextNode("var urls = \"" + urls + "\";");
					p.appendChild(t);
				});
			
			(document.head || document.documentElement).appendChild(p);
			
			let initializedNode = document.createElement('div')
			initializedNode.setAttribute('id', initializeString)

			document.head.appendChild(initializedNode)

			//inject urls into page
			timer = setInterval(() => {
				// console.log('-=-=-=-=-=-=-=-=-INTERVAL TEST')
				tabDisabled = initializedNode ? initializedNode.getAttribute('disabled') == 'true' : false;
				chrome.runtime.sendMessage(null, {"id":"time","currenttime":player.currentTime, "duration":player.duration, "loop":player.loop, disabled: tabDisabled});
			},200);
			//}
			
			var player = document.getElementsByTagName("video")[0];
		}
	}
	else if(!d){
		setTimeout(() => initialize(true), 5000)
		// console.log('second pass')
	}
	}
	catch(event){
		console.error("video controller extension error: \n" + event)
	}
}
function injectString(data){
	var p = document.createElement("script");
	p.textContent = data;
(	document.head || document.documentElement).appendChild(p);
}



// chrome.runtime.connect().onDisconnect.addListener(() => {
//     clearInterval(timer)
// })