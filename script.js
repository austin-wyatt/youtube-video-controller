//incorporate VIDEO html5 tag

function eventFire(el, etype){
  try{
	if (el.fireEvent) {
		el.fireEvent('on' + etype);
	} else {
		var evObj = document.createEvent('Events');
		evObj.initEvent(etype, true, false);
		el.dispatchEvent(evObj);
	}
  }
  catch(error){
	  return 0
  }
  return 1
}

let suspendCheckTime = false;
let documentURL = document.URL;

ytplay = document.getElementById("movie_player");
vidplayer = document.getElementsByTagName("video")[0];

timeEnd = ytplay.getDuration() - 1;
actualEnd = ytplay.getDuration();

debugCheckIntervals = []

var checker = debugCheckIntervals.push(setInterval(checkTime,1000));
var auto_play = debugCheckIntervals.push(setInterval(pauseBriefly,900000));
if(!document.getElementById("PLAYLISTINFO")){
	var y = document.createElement("span");
	y.id = "PLAYLISTINFO";
	//y.setAttribute("name",ytplay.getPlaylist().join("|"));
}
var initialize_check = document.createElement("span");
initialize_check.id = "INITIALIZE_CHECK";
(document.head || document.documentElement).appendChild(initialize_check);
//var v =document.getElementById("playlist")
//v.getElementsByTagName("h4")

/*
for (i = 0; i < playlist.length; i++)
	
*/
//console.log(y);
ytplay.append(y);

//var xpathResult = document.evaluate("//*[@id='container']/h1/yt-formatted-string",document,null,XPathResult.FIRST_ORDERED_NODE_TYPE, null )
//title = xpathResult.singleNodeValue.innerText

var check = 0;
try{
	document.getElementsByClassName("video-ads")[0].remove();
}
catch(event){
	// console.log(event);
}
function pauseBriefly(){
	//ytplay.pauseVideo();
	//ytplay.playVideo();
	ytplay.updateLastActiveTime();
}
var prev_time = 0;

var count = 0;

titleInit();

const fnSuspendCheckTime = () => {
	suspendCheckTime = true
	setTimeout(() => {suspendCheckTime = false}, 4000)
}

function titleCheck(){
	document.title = ytplay.getVideoData().title
	count += 1;
	// console.log('()()()()()()()()()()()()()()()()(');
	//console.log(xpathResult.singleNodeValue.innerText)
	//console.log(ytplay.getVideoData().title)
}

function titleInit(){
	count = 0
	let tempInterval = setInterval(titleCheck,200)
	setTimeout(clearInterval(tempInterval),3000);
	console.log("title initialize")
}
//setTimeout(titleInit,1500)

/** returns an anchor element */
const pathToLinkElement = (component) => {
	let index = 0
	while(component.children.length > index){
		// console.log('INDEX ' + index)
		// console.log(component.children[index])
		
		if(component.children[index]){
			// console.log(component.children[index].tagName)
			if(component.children[index].tagName == 'A'){
				// console.log('THIS IS CORRECT')
				return component.children[index]
			}
			else{
				return pathToLinkElement(component.children[index])
			}
		}
		index += 1
	}
} 

const nextRecommendedVideo = () => {
	let temp = document.querySelectorAll('ytd-watch-next-secondary-results-renderer')[0]
	temp = temp.querySelectorAll('A.ytd-compact-video-renderer')
	
	temp[0].click();
}

const customRecommendedVideo = (index) => {
	let temp = document.querySelectorAll('ytd-watch-next-secondary-results-renderer')[0]
	temp = temp.querySelectorAll('A.ytd-compact-video-renderer')

	temp[index].click();
}

function customNextVideo(){
	var xpathResult = document.evaluate("//*[@id='wc-endpoint']",document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	var playlistIndex = parseInt(document.URL.substr(document.URL.indexOf("index")+6))
	var i = 0;
	ytplay.pauseVideo();

	if(!xpathResult.snapshotItem(i)){
		nextRecommendedVideo()
		ytplay.seekTo(0)
		timeEnd = 999999;
		actualEnd = 999998
		return 0
	}

	let snapshotItem = xpathResult.snapshotItem(i)
	let internalIndex = playlistIndex - parseInt(snapshotItem.href.substr(snapshotItem.href.indexOf('index') + 6))
	if(internalIndex < xpathResult.snapshotLength - 1){
		internalIndex += 1;
	}
	// while(parseInt(snapshotItem.href.substr(snapshotItem.href.indexOf('index') + 6)) < playlistIndex && i < xpathResult.snapshotLength){
	// 	i+=1
	// 	// console.log(i)
	// 	// console.log(xpathResult.snapshotItem(i))
	// 	snapshotItem = xpathResult.snapshotItem(i)
	// }
	snapshotItem = xpathResult.snapshotItem(internalIndex)
	var xpathResultName = document.evaluate("//*[@id='unplayableText']",document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );

	try{
		while(xpathResultName.snapshotItem(internalIndex + i).text.simpleText){
			i+=1
		}
	}
	catch(event){
	}
	fnSuspendCheckTime()

	if(snapshotItem.textContent != xpathResultName.snapshotItem(internalIndex + i).textContent){
		snapshotItem = xpathResultName.snapshotItem(internalIndex + i)
	}

	console.log(i)
	vidplayer.pause()
	vidplayer.currentTime = 0
	actualEnd = 999999
	timeEnd = 999998
	// console.log(`clicked`)
	// console.log(xpathResult.snapshotItem(i))
	var xp = document.evaluate('//*[@id="meta"]',document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	//eventFire(xp.snapshotItem(i+1),'click');
	snapshotItem.click()
	//old method
	//eventFire(xpathResult.snapshotItem(i).children[0].children[3],'click')

	//window.location.assign(xpathResult.snapshotItem(i+1).href);
	//window.location.replace(xpathResult.snapshotItem(i+1).href);
}
function customPreviousVideo(){
	var xpathResult = document.evaluate("//*[@id='wc-endpoint']",document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	ytplay.pauseVideo();
	// console.log(xpathResult)

	if(!xpathResult.snapshotItem(i)){
		history.back()
		return 0
	}

	var playlistIndex = parseInt(document.URL.substr(document.URL.indexOf("index")+6))
	var i = 0;

	let snapshotItem = xpathResult.snapshotItem(i)
	let internalIndex = playlistIndex - parseInt(snapshotItem.href.substr(snapshotItem.href.indexOf('index') + 6))
	if(internalIndex > 0){
		internalIndex -= 1;
	}
	// while(parseInt(snapshotItem.href.substr(snapshotItem.href.indexOf('index') + 6)) < playlistIndex-1 && i < xpathResult.snapshotLength){
	// 	i+=1
	// 	snapshotItem = xpathResult.snapshotItem(i)
	// 	// console.log(i)
	// }
	snapshotItem = xpathResult.snapshotItem(internalIndex)
	var xpathResultName = document.evaluate("//*[@id='unplayableText']",document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
	//vidplayer.pause();
	try{
	while(xpathResultName.snapshotItem(internalIndex - i).text.simpleText){
		i-=1
		}
	}
	catch(event){
	}
	fnSuspendCheckTime()

	if(snapshotItem.textContent != xpathResultName.snapshotItem(internalIndex - i).textContent){
		snapshotItem = xpathResultName.snapshotItem(internalIndex - i)
	}
	
	vidplayer.pause()
	vidplayer.currentTime = 0
	actualEnd = 999999
	timeEnd = 999998
	// console.log(xpathResult.snapshotItem(i))
	snapshotItem.click()
	// eventFire(xpathResult.snapshotItem(i).children[0].children[3],'click');
	//eventFire(xp.snapshotItem(i-1),'click');
	//window.location.assign(xpathResult.snapshotItem(i-1).href);
	//window.location.replace(xpathResult.snapshotItem(i-1).href);
}

function goToVideoFromPlaylist(index, type){
	if(type == "playlist"){
		vidplayer.pause();
		var xpathResult = document.evaluate("//*[@id='wc-endpoint']",document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );
		var i = 0;

		let snapshotItem = xpathResult.snapshotItem(i)
		while(parseInt(snapshotItem.href.substr(snapshotItem.href.indexOf('index') + 6)) < index && i < xpathResult.snapshotLength){
			i+=1
			snapshotItem = xpathResult.snapshotItem(i)
			//console.log(i);
		}
		// console.log(xpathResult.snapshotItem(i).href)
		// console.log(index, " INDEX");
		//var snap = document.evaluate('//*[@id="meta"]',document,null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null );

		fnSuspendCheckTime()
	
		vidplayer.currentTime = 0
		actualEnd = 999999
		timeEnd = 999998
		//eventFire(xpathResult.snapshotItem(i).children[0].children[3],'click');
		eventFire(xpathResult.snapshotItem(i),'click');
		/*if(window.location.href != xpathResult.snapshotItem(i).href){
			setTimeout(function(){eventFire(xpathResult.snapshotItem(i),'click')},1000);
		}*/
		//window.location.assign( xpathResult.snapshotItem(i).href);
		// console.log(xpathResult.snapshotItem(i))
		//eventFire(snap.snapshotItem(i),'click');
	}
	else if(type == 'recommended'){
		customRecommendedVideo(index)
	}
	
}

let initializeComponent = document.getElementById('youtubeVideoControllerEXT')
let tabDisabled = initializeComponent ? initializeComponent.getAttribute('disabled') == 'true' : false;


function checkTime(){
	if(check == 0){
		var k = ytplay.getVideoUrl();
		k = k.slice(k.indexOf("v=")+2,k.length - 1);
		if(urls.indexOf(k) > -1){
			var temp = urls.slice(urls.indexOf(k),urls.length);
			//console.log(temp);
			temp = temp.slice(temp.indexOf("|")+1,temp.indexOf("."));
			//console.log(temp);
			timeEnd = temp;
		}
		let tempInterval = setInterval(titleCheck,1000)
		setTimeout(() => clearInterval(tempInterval), 10000)
		count = 0;
		//console.log(xpathResult.singleNodeValue.innerText)
		check = 1;
	}

	if(ytplay.getVideoStats().state == '45'){
		ytplay.playVideo()
	}

	if(actualEnd != ytplay.getDuration()){
		actualEnd = ytplay.getDuration()
		timeEnd = actualEnd - 1;
		// console.log(timeEnd + '------' + actualEnd)
		check = 0;
	}
	else if(actualEnd == timeEnd){
		timeEnd -= 1
	}

	// console.log('TIME-----------')
	// console.log(timeEnd)
	// console.log(ytplay.getCurrentTime())
	else if(ytplay.getCurrentTime() >= timeEnd && !suspendCheckTime && document.URL.includes('watch?')){
		if(vidplayer.loop){
			vidplayer.currentTime = 0;
			ytplay.seekTo(0)
		}
		else if(!tabDisabled){
			// console.log(tabDisabled)
			ytplay.pauseVideo();
			customNextVideo()
		}
		else{
			// ytplay.pauseVideo()
		}

		//If we change pages we should reset the end time since the youtube player persists when moving to non-video youtube pages
		if(document.URL != documentURL){
			timeEnd = 999999;
			actualEnd = 999998
			documentURL = document.URL

			//This catches a case where for whatever reason the extension attempts to initialize on a page that a video player does not exist
			if(!ytplay){
				// console.log('hello this is borked')
				ytplay = document.getElementById("movie_player");
				vidplayer = document.getElementsByTagName("video")[0];
			}
		}
	}

	tabDisabled = initializeComponent ? initializeComponent.getAttribute('disabled') == 'true' : false;
	//console.log(ytplay.getCurrentTime() - prev_time);
	//prev_time = ytplay.getCurrentTime();
	if(debugCheckIntervals.length > 2)
		console.log(debugCheckIntervals)
};