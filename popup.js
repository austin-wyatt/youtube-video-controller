document.getElementById("playBtn").addEventListener("click", playFunc);
document.getElementById("pauseBtn").addEventListener("click", pauseFunc);
document.getElementById("tabDropdown").addEventListener("click", createChildren);
document.getElementById("nextVideo").addEventListener("click", nextFunc);
document.getElementById("prevVideo").addEventListener("click", prevFunc);
document.getElementById("dropdownContent").addEventListener("click", updateCurrent);
document.getElementById("vSlider").addEventListener("change", changeVolume);
document.getElementById("playbackSlider").addEventListener("change", changePlayback);
document.getElementById("volumeButton").addEventListener("click", fMuteVideo);



function clearTabs() {
	chrome.storage.local.set({ "tabs": "" });
	//chrome.storage.local.set({"default_volume":""});
	//chrome.storage.local.set({"current_tab_title":""});
	chrome.tabs.getAllInWindow(function (tabs) {
		var temp = "";
		for (i = 0; i < tabs.length; i++) {
			if (tabs[i].url.includes("www.youtube.com/watch")) { }
			temp = temp + "." + tabs[i].id + "|";
		}
		chrome.storage.local.set({ "tabs": temp });
	});
}

var playlist = [];
var loop = false;
var currentTabTitle = "";
var currentTab = "";
var currentVolume = 5;
var prevVolume = {};
var volumeObj = {};
let zoom = 2;
let currentTime = 0;
let tabDisabled = false;

//padding: 16px;
var tabDropdown = document.getElementById("tabDropdown");
var tabContext = tabDropdown.getContext("2d");
tabContext.textAlign = "center";
tabContext.textBaseline = "middle";
tabContext.font = "50px Arial";
tabContext.fillStyle = "#ffffff";
tabContext.fillText("Select Tab", tabDropdown.width / 2, tabDropdown.height / 2);

var testCanvas = $("#testCanvas")[0];
testCanvas = testCanvas.getContext("2d");
testCanvas.font = "14px Arial";
var mute = true;
//$(".otherbtn").css("position","static");

function fMuteVideo() {
	if (currentVolume == 0) {
		setVolume(prevVolume[currentTab]);
		chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "ytplay.unMute();" });
		$('#volumeImage')[0].src = './images/volume.svg'
	}
	else {
		prevVolume[currentTab] = volumeObj[currentTab];
		chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "ytplay.mute();" });
		setVolume(0);
		$('#volumeImage')[0].src = './images/volumeMute.svg'
	}
}

$("html").keyup(function (event) {
	console.log(event);
	if (event.key == " ") {
		pauseFunc();
	}
	else if (event.key == "Shift") {
		if (mute) {
			fMuteVideo()
		}
		mute = true;
	}
	else if (event.key == "e") {
		console.log(volumeObj);
		setVolume(parseInt(volumeObj[currentTab]) + 5, true);
	}
	else if (event.key == "q") {
		setVolume(parseInt(volumeObj[currentTab]) - 5, true);
	}
	else if (event.key == "1") {
		prevFunc();
	}
	else if (event.key == "2") {
		nextFunc();
	}
});

const setBasic = () => {
	$(".primaryOptions").show();
	$(".secondaryOptions").hide();
	$(".infoOptions").hide();
}

const removeSelected = () => {
	$('#optionButton').removeClass('selected')
	$('#infoButton').removeClass('selected')
}

const setInfo = () => {
	removeSelected()
	if ($(".infoOptions").is(":hidden")) {
		$(".primaryOptions").hide();
		$(".secondaryOptions").hide();
		$(".infoOptions").show();
		$('#infoButton').addClass('selected')
		$('#disableButton').hide()
	}
	else {
		$(".primaryOptions").show();
		$(".secondaryOptions").hide();
		$(".infoOptions").hide();
		$('#infoButton').removeClass('selected')
		$('#disableButton').show()
	}
}

const setSecondary = () => {
	removeSelected()
	if ($(".secondaryOptions").is(":hidden")) {
		$(".primaryOptions").hide();
		$(".secondaryOptions").show();
		$(".infoOptions").hide();
		$('#optionButton').addClass('selected')
		$('#disableButton').hide()
	}
	else {
		$(".primaryOptions").show();
		$(".secondaryOptions").hide();
		$(".infoOptions").hide();
		$('#optionButton').removeClass('selected')
		$('#disableButton').show()
	}
	if (loop) {
		$("#loopBtn").toggleClass("loopDark");
	}
}

/** debug page toggle */
const p2 = () => {
	$("#page1").toggle()
	$("#page2").toggle()
}

const setZoom = () => {
	temp = $(".zoominfo").val()
	document.body.style.zoom = Number(temp);
	chrome.storage.local.set({ "zoom": Number(temp) });
	zoom = Number(temp)
}

//SECONDARY BUTTONS
$(".options").click(setSecondary);


//INFO BUTTON
$(".info").click(setInfo);

//INFO FUNCTIONS
$(".zoominfo").change(setZoom);

//SECONDARY FUNCTIONS

var timeBar = $(".chasebar");

$("#playbackSlider").dblclick(function (event) {
	console.log(parseInt(temp.value));
	$("#playbackSlider")[0].value = 100;
	var text = "document.getElementsByTagName('video')[0].playbackRate = 1;";
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: text });
});

function changePlayback() {
	var temp = $("#playbackSlider")[0];
	var text = "document.getElementsByTagName('video')[0].playbackRate = " + parseInt(temp.value) / 100 + ";";
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: text });
}

$("#loopBtn").click(function (event) {
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "setloop", value: !loop });
	if (!loop) {
		$("#loopBtn").addClass("loopDark");
	}
	else {
		$("#loopBtn").removeClass("loopDark");
	}


	//$("#loopBtn").toggleClass("loopDark");
});

$("#disableButton").click(function (event) {
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "setdisabled", value: !tabDisabled });
	if (!tabDisabled) {
		$("#disableButton").addClass("loopDark");
	}
	else {
		$("#disableButton").removeClass("loopDark");
	}
});

var timebarMoving = false;
let timeBarBackground = $(".timebar")
timeBarBackground.on('mousedown', function (event) {
	var temp = (event.offsetX / 160 / zoom);
	currentTime = temp;
	// chrome.tabs.sendMessage(parseInt(currentTab),{id:"settime",value:temp});
	timebarMoving = true;
	$("body").on("mousemove", function (event) {
		var temp = event.offsetX / 160 / zoom;
		if (timebarMoving) {
			currentTime = temp
			timeBar.css("width", (temp * 100) + "%")
		}
		else {
			timebarMoving = true;
		}

		if (!event.originalEvent.path.some(comp => comp.id == 'timebar')) {
			$("body").off("mousemove")
			// if(timebarMoving)
			// 	chrome.tabs.sendMessage(parseInt(currentTab),{id:"settime",value:currentTime});
			timebarMoving = false;
		}
	});
})

var timebarTitleDisplayed = false;
var timebarHovered = false;
timeBarBackground.on('mouseover', () => {
	timebarHovered = true;
});

timeBarBackground.on('mouseout', () => {
	timebarHovered = false;
	timebarTitleDisplayed = false;
})


//PLAYLIST FUNCTIONS
var finishedPlaylist = false;
$(".playlist").click(function (event) {
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "getplaylist" });
	finishedPlaylist = false;
	var t = setInterval(function () {
		if (finishedPlaylist && playlist[0].current != 'no') {
			createChildren(false, true);
			clearInterval(t);
		}
		if (playlist[0].current != 'no') {
			clearInterval(t);
		}
	}, 100);
});

//SLIDER VISUALS
document.getElementById("vSlider").classList.add('sliderclass');
document.getElementById("playbackSlider").classList.add('sliderclass');



$("*").hide().fadeIn();
$("#dropdownContent").hide();
$(".hide").hide();
$(".hideStartup").hide();
$("#page2").hide();

$("body").click(function (event) {
	if (event.detail == 2 && event.ctrlKey == true) {
		console.log(event);
		$("body").css("background", "#524d4d");
		//$(".otherbtn").css("border-width","0px");
		//$(".dropbtn").css("background","#171717");
		$(".dark").css("background", "#171717").css("border-color", "#171717");
		$(".slider::-webkit-slider-thumb").css("background", "#171717");
		$(".slider").css("background", "#2e2d2d");
		document.getElementById("vSlider").classList.remove('sliderclass');
		document.getElementById("vSlider").classList.add('sliderclass2');
		document.getElementById("playbackSlider").classList.remove('sliderclass');
		document.getElementById("playbackSlider").classList.add('sliderclass2');
	}
}).mouseup(function (event) {
	if (timebarMoving) {
		chrome.tabs.sendMessage(parseInt(currentTab), { id: "settime", value: currentTime });
	}
	$("body").off("mousemove");
	timebarMoving = false;
});

//ON MESSAGE
chrome.runtime.onMessage.addListener(function (msg, sender, response) {
	if (msg.key == "tab_pass") {
		//console.log(msg);
		var temp = document.getElementsByName(msg.id);
		//console.log(temp[0].innerText);
		/*setTimeout(function(){
		createChildren(true);
		}, 2000);*/
		var tab = [String(msg.id)];
		//console.log($("#dropdownContent"));
		initializeChild($("#dropdownContent")[0], 0, tab, function () { });
		try {
			changeInnerText(temp, msg.id, 5);
		}
		catch (event) {
		}
		try {
			if (msg.id == currentTab) {
				changeTabText(msg.id, 5);
			}
		} catch (event) {
		}
		//console.log(temp[0].innerText);
	}
	else if (msg.key == "tab_update") {
		$('a[name=' + msg.tab + ']').remove();
	}
	else if (msg.id == 'time' && sender.tab.id == currentTab) {
		loop = msg.loop;
		if (msg.disabled != tabDisabled) {
			tabDisabled = msg.disabled;
			if (tabDisabled) {
				$("#disableButton").addClass("disableRed");
				$("#disableButton").removeClass("disableGreen");
			}
			else {
				$("#disableButton").removeClass("disableRed");
				$("#disableButton").addClass("disableGreen");
			}
		}

		if (!timebarMoving) {
			var temp = parseFloat(msg.currenttime) / parseFloat(msg.duration) * 100;
			timeBar.css("width", temp + "%");

			if (!timebarHovered && !timebarTitleDisplayed) {
				timeBarBackground.attr("title", new Date(parseInt(msg.currenttime) * 1000).toISOString().substr(14, 5) + " / " + new Date(parseInt(msg.duration) * 1000).toISOString().substr(14, 5));
				timebarTitleDisplayed = true;
			}
		}
	}
	else if (msg.id == "playlist" && sender.tab.id == currentTab) {
		playlist = msg.playlist;
		finishedPlaylist = true;
		//console.log(playlist);
	}
	else if (msg.id == "title_update" && sender.tab.id == currentTab) {
		chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "window_intervals = [];titleInit();" });

		//setTimeout(function(){updateCurrent(sender.tab)},5000);
	}
	else if (msg.id == "volume_update" && sender.tab.id == currentTab) {
		//console.log("YUPPPPP")
		//setVolume(currentVolume,true);
		var temp = document.getElementById("vSlider");
		temp.value = volumeObj[parseInt(currentTab)];

		setVolume(volumeObj[parseInt(currentTab)]);
		console.log(volumeObj[parseInt(currentTab)]);

	}
});



function changeInnerText(element, id, i = 0, index = 0) {
	chrome.tabs.get(id, function (tab) {
		text = childTextLength(tab.title);
		//console.log(text);
		if (text.length > 0) {
			element[0].innerText = text;
		}
		if (index < i) {
			setTimeout(function () {
				changeInnerText(element, id, i, index + 1);
			}, 1000);
		}
	});
}

function changeTabText(id, i = 0, index = 0) {
	if (id == currentTab) {
		try {
			chrome.tabs.get(parseInt(id), function (tab) {
				//currentTabTitle = tabA.title;
				//currentTabTitle = (currentTabTitle.length>11?currentTabTitle.substring(0,11) + "...":currentTabTitle);
				//tabC.innerText = currentTabTitle;
				//console.log(id);
				text = tab.title;
				$('#dropdownMenu')[0].setAttribute('title', text)
				tabContext.clearRect(0, 0, tabDropdown.width, tabDropdown.height);
				if (tabContext.measureText(text).width < tabDropdown.width) {
					tabContext.fillText(text, tabDropdown.width / 2, tabDropdown.height / 2);
				}
				else {
					for (q = text.length; q > 0; q--) {
						if (tabContext.measureText(text.substring(0, q) + "...").width < tabDropdown.width) {
							//console.log(text.substring(0,q));
							tabContext.fillText(text.substring(0, q) + "...", tabDropdown.width / 2, tabDropdown.height / 2);
							q = 0;
						}
					}
				}
				if (index < i) {
					setTimeout(function () {
						changeTabText(id, i, index + 1);
					}, 1000);
				}
			});
		}
		catch (event) {
			tabContext.clearRect(0, 0, tabDropdown.width, tabDropdown.height);
			tabContext.fillText("Tabs", tabDropdown.width / 2, tabDropdown.height / 2);
		}
	}
}


try {
	chrome.storage.local.get("zoom", function (result) {
		document.body.style.zoom = result.zoom;
		$(".zoominfo").val(result.zoom);
		zoom = Number(result.zoom)
	});

	chrome.storage.local.get("default_volume", function (result) {
		result = result.valueOf().default_volume;
		keys = result.split(".");
		console.log(keys);
		result = "";
		for (i = 0; i < keys.length; i++) {
			temp = keys[i].split("|");
			if (parseInt(temp[0]) > 0 && parseInt(temp[1]) > 0) {
				result = result + temp[0] + "|" + temp[1] + ".";
				volumeObj[temp[0]] = temp[1];
			}
		}
		chrome.storage.local.get("tabs", function (tabs) {
			tabs = tabs.valueOf().tabs;
			console.log(tabs);
			tabs = tabs.split("|");

			var final_result = "";
			for (i = 0; i < tabs.length; i++) {
				tabs[i] = tabs[i].replace(".", "");
				if (result.includes(tabs[i])) {
					final_result = final_result + tabs[i] + "|" + volumeObj[tabs[i]] + ".";
					console.log(final_result);
				}
			}
			chrome.storage.local.set({ "default_volume": final_result });
		});
		/*currentVolume = result.valueOf().default_volume;
		setVolume(result.valueOf().default_volume);*/
	});

	chrome.storage.local.get("default_tab", function (result) {
		setCurrent(result.valueOf().default_tab);
		chrome.tabs.get(parseInt(result.valueOf().default_tab), function (tab) {
			/*currentTabTitle = tab.title;
			currentTabTitle = (currentTabTitle.length>11?currentTabTitle.substring(0,11) + "...":currentTabTitle);
			tabC.innerText = currentTabTitle;
			*/
			text = tab.title;
			$('#dropdownMenu')[0].setAttribute('title', text)
			tabContext.clearRect(0, 0, tabDropdown.width, tabDropdown.height);
			if (tabContext.measureText(text).width < tabDropdown.width) {
				tabContext.fillText(text, tabDropdown.width / 2, tabDropdown.height / 2);
			}
			else {
				for (q = text.length; q > 0; q--) {
					if (tabContext.measureText(text.substring(0, q) + "...").width < tabDropdown.width) {
						//console.log(text.substring(0,q));
						tabContext.fillText(text.substring(0, q) + "...", tabDropdown.width / 2, tabDropdown.height / 2);
						q = 0;
					}
				}
			}

		});
		var t = setInterval(function () {
			if (!playlist[0]) {
				chrome.tabs.sendMessage(parseInt(currentTab), { id: "getplaylist" });
			}
			else {
				clearInterval(t);
				//console.log("yee");
			}
		}, 1000);
	});
}
catch (event) {

}
function setCurrent(tab) {
	currentTab = tab;
	var temp = document.getElementById("vSlider");
	temp.value = volumeObj[tab];
	currentVolume = volumeObj[tab];
	chrome.tabs.get(+tab, (tab) => currentTabTitle = tab.title)

	//MAYBE?
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "window_intervals = [];titleInit();" });
	//chrome.tabs.sendMessage(parseInt(currentTab),{id:"code", string:"console.log('yes this works')"});
}


function updateCurrent(id) {
	//volumeObj[currentTab]=currentVolume;
	if (typeof volumeObj[id.path[0].name] !== 'undefined') {
		setVolume(volumeObj[id.path[0].name]);
		//console.log("changed");
	}

	if (!parseInt(id.path[0].name) == false) {
		currentTab = id.path[0].name;
		chrome.tabs.get(+currentTab, (tab) => currentTabTitle = tab.title)

		if (!id.altKey) {
			if (id.ctrlKey) {
				chrome.tabs.update(parseInt(currentTab), { "active": true, "highlighted": true });
				//mute = false;
			}

			//console.log(id);
			$("#dropdownContent").hide();
			chrome.storage.local.set({ "default_tab": currentTab })

			changeTabText(currentTab);
		}
		else {
			chrome.tabs.remove(parseInt(currentTab), function () {
				$("#dropdownContent").toggle();
				currentTab = 0;
				chrome.storage.local.set({ "default_tab": currentTab })
				changeTabText(currentTab);
			});
		}
	}
	else {
		//UPDATE URL WITH PLAYLIST VIDEO
		//chrome.tabs.update(parseInt(currentTab),{url: "https://www.youtube.com"+id.path[0].name});
		let msg =
		{
			id: "playlist_video",
			index: parseInt(id.path[0].getAttribute('index')),
			altIndex: parseInt(id.path[0].getAttribute('altIndex'))
		}

		chrome.tabs.sendMessage(parseInt(currentTab), msg);
		console.log(msg.index)
		console.log(msg.altIndex)

		$("#dropdownContent").toggle();
	}
}

window.onclick = function (event) { //Test if you click outside of dropdown
	//console.log(event);
	var parent = document.getElementById("dropdownContent");
	if ((!event.target.matches('.dropdown-content')) && (!event.target.matches('.dropbtn'))
		&& (!event.target.matches('.smallbutton2'))) {
		$("#dropdownContent").hide();
	}
}

/*window.onbeforeunload = function(){ //Save default volumes on unload
	keys = Object.keys(volumeObj);
	result = "";
	for(i = 0; i < keys.length; i++){
		result = result + keys[i] + "|" + volumeObj[keys[i]]+".";
	}
	chrome.storage.local.set({"default_volume":result});
	
}*/

function changeVolume() {
	var temp = document.getElementById("vSlider");
	//console.log(temp.value);
	chrome.storage.local.set({ "default_volume": temp.value });
	setVolume(temp.value, true);

	if (temp.value == 0)
		$('#volumeImage')[0].src = './images/volumeMute.svg'
	else
		$('#volumeImage')[0].src = './images/volume.svg'
}



function setVolume(volume, change = false) {
	var temp = document.getElementById("vSlider");
	if (change) {
		currentVolume = volume;
		if (currentVolume > 100) {
			currentVolume = 100;
		}
		else if (currentVolume < 0) {
			currentVolume = 0;
		}


		chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: `ytplay.setVolume("${currentVolume}");` });
		if (currentVolume > 0)
			chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "vidplayer.muted = false" });
		temp.value = volume;
		volumeObj[currentTab] = currentVolume;

		keys = Object.keys(volumeObj);
		result = "";
		for (i = 0; i < keys.length; i++) {
			result = result + keys[i] + "|" + volumeObj[keys[i]] + ".";
		}
		chrome.storage.local.set({ "default_volume": result });
		chrome.runtime.sendMessage({ id: "SetVolume", value: temp.value });
	}
	else {
		k = parseInt(volumeObj[currentTab]);
		//console.log(k);
		chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "ytplay.setVolume(" + (typeof k === "number" ? k : 0) + ")" });
		currentVolume = volume;
		temp.value = volume;

		chrome.runtime.sendMessage({ id: "SetVolume", value: temp.value });
	}
}


function playFunc() {
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "ytplay.playVideo();" });
}
function pauseFunc() {
	console.log(currentTab)
	console.log(currentTabTitle)
	chrome.tabs.get(+currentTab, (tab) => console.log(tab.title))

	var text = "if(ytplay.getVideoStats().state == 4){ytplay.playVideo()}else{ytplay.playVideo();ytplay.pauseVideo();}";
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: text });
}
function nextFunc() {
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "customNextVideo();" });
	//chrome.tabs.sendMessage(parseInt(currentTab),{id:"code", string:"ytplay.nextVideo();"});
}
function prevFunc() {
	//chrome.tabs.sendMessage(parseInt(currentTab),{id:"code", string:"ytplay.previousVideo();"});
	chrome.tabs.sendMessage(parseInt(currentTab), { id: "code", string: "customPreviousVideo();" });
}

function childTextLength(text) {

	var max_length = 240;
	if (testCanvas.measureText(text).width < max_length) {
		text = text.replace(" - YouTube", "\n");
	}
	else {
		for (i = 0; i < text.length; i++) {
			if (testCanvas.measureText(text.substring(0, i)).width > max_length / 2) {
				temp = text.substring(0, i);
				var j = temp.regexLastIndexOf(/\W/, i);
				//console.log(j);
				temp = text.substring(0, j);
				temp2 = "";
				for (k = j; k < text.length; k++) {
					//console.log(text.substring(j,k));
					if (testCanvas.measureText(text.substring(j, k)).width > max_length / 2) {
						temp2 = text.substring(j, k - 1) + "...";
						//console.log(temp2);
						k = text.length;
					}
				}
				text = temp + "\n" + temp2;
				//console.log(text);
				i = text.length;
			}
		}
	}

	return text;
}


function initializeChild(parent, i, tabs, callback) {
	tabs[i] = tabs[i].replace(".", "");
	var text = "";
	chrome.tabs.get(parseInt(tabs[i]), tab => {
		try {
			if (chrome.runtime.lastError.message.includes("No tab with")) {
				clearTabs();
			}
		}
		catch (event) {
		}
		if (!tab) {
			return 0
		}
		if (tab.url.includes("www.youtube.com/watch")) {
			text = childTextLength(tab.title);

			temp = document.createElement("a"); //a
			temp.setAttribute("id", "dropdownChildren");
			temp.setAttribute("name", tabs[i]);
			temp.setAttribute('title', tab.title)

			temp.innerText = text;
			//temp
			text = tab.title;
			//console.log(i);
			//console.log(tabs);

			var check = 0;
			for (j = 0; j < parent.children.length; j++) {
				if (parent.children[j].name === tabs[i]) {
					check = 1;
					//console.log(tabs[i]);
				}
			}
			if (check == 0) {
				parent.appendChild(temp);
			}
		}
		callback();
	});

}

function initializeChildPlaylist(parent, i, callback) {
	var text = "";

	text = childTextLength(playlist[i].title);

	temp = document.createElement("a"); //a
	temp.setAttribute("id", "dropdownChildren");
	temp.setAttribute("name", playlist[i].url.replace("https://www.youtube.com", "").split("&index")[0]);

	if (playlist[i].url.includes("index")) {
		temp.setAttribute("index", playlist[i].url.substr(playlist[i].url.indexOf("index") + 6));
	}

	temp.setAttribute('title', playlist[i].title)
	temp.setAttribute('altIndex', i)
	temp.innerText = text;
	//console.log(text);
	//temp
	//text = tab.title;
	//console.log(i);
	//console.log(tabs);
	// console.log(playlist[i])

	var check = 0;
	for (j = 0; j < parent.children.length; j++) {
		if (parent.children[j].name === playlist[i].url) {
			check = 1;
			//console.log(tabs[i]);
		}
	}
	if (check == 0 && text != "") {
		parent.appendChild(temp);
	}
	callback();
}


function createChildren(p = false, playlistB = false) {
	removeSelected()
	setBasic()
	var dropdown = document.getElementById("dropdownContent");

	if (typeof p === 'object') {
		p = false;
	}


	if (dropdown.style.display != "none" && !p) {
		dropdown.style.display = "none";
	}
	else {
		var parent = document.getElementById("dropdownContent");
		$("#dropdownContent").empty();
		//IF TABS ELSE IF PLAYLIST ETC
		if (!playlistB) {
			try {
				chrome.storage.local.get("tabs", function (result) {
					var tabs = result.valueOf().tabs;
					tabs = tabs.split("|");


					var i = 0;
					var loopArray = function (arr) {
						initializeChild(parent, i, arr, function () {
							i++;

							if (i < arr.length - 1) {
								loopArray(arr);
							}
						});
					}

					loopArray(tabs);

				});
			}
			catch (event) { }
			dropdown.style.display = "inline";
		}
		else {
			var i = 0;
			var loopArray = (arr) => {
				initializeChildPlaylist(parent, i, () => {
					i++;

					if (i < playlist.length) {
						loopArray(arr);
					}
				});
			}

			loopArray(playlist);
			$("#dropdownContent").show();
			let current = playlist[0].current.split('&index')[0]
			try {
				window.scrollTo(0, document.getElementsByName(current)[0].offsetTop * document.body.style.zoom);
				document.getElementsByName(current)[0].style.background = "#cccccc";
			}
			catch (event) {
				console.log(event)
			}
		}
	}
}

String.prototype.regexLastIndexOf = function (regex, startpos) {
	regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
	if (typeof (startpos) == "undefined") {
		startpos = this.length;
	} else if (startpos < 0) {
		startpos = 0;
	}
	var stringToWorkWith = this.substring(0, startpos + 1);
	var lastIndexOf = -1;
	var nextStop = 0;
	while ((result = regex.exec(stringToWorkWith)) != null) {
		lastIndexOf = result.index;
		regex.lastIndex = ++nextStop;
	}
	return lastIndexOf;
}
