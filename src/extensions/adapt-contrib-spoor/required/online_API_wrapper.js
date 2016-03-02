var api_url = "https://odi-elearning.herokuapp.com/";

function setID() {
  	$.get( api_url + "create_id.php", function( data ) {
  		window.localStorage.setItem("_id",data);
	})
	.fail( function() {
		setTimeout(function() {setID();},10000);
	});
}

if (!localStorage.getItem("_id")) {
	setID();
}
if (!localStorage.getItem("ODI_Badges")) {
	localStorage.setItem("ODI_Badges","");
}

var moduleId = "";
var lang = ""
var config = {};
$.getJSON("course/config.json",function(data) {
	moduleId = data._moduleId;
	config = data;
});
var id = "";

$(document).ready(function() {
	$.getJSON("course/config.json",function(data) {
		moduleId = data._moduleId;
		lang = data._defaultLanguage;
		setRawValue("lang",lang);
		if (moduleId == "ODI_nav"){
			setInterval(function() {updateProgress();},5000);
		} else {
			console.log(theme);
			setInterval(function() {miniProgressUpdate();},1000);
		}
	});
	setTimeout(function() {setRawValue("theme",theme)},1000);
});

function miniProgressUpdate() {
	badges = localStorage.getItem("ODI_Badges");
	try {
		badges = $.parseJSON(badges);
	} catch(err) {
		badges = {};
	}
	var mods_done = {};
	var badge_progression = {};
	badge_progression["explorer"] = 0;
	badge_progression["adventurer"] = 0;
	badge_progression["practitioner"] = 0;
	badge_progression["strategist"] = 0;
	for (i=1;i<13;i++) {
		current_badge = "explorer";
		if (i>3 && i<7) {
			current_badge = "adventurer";
		}
		if (i==8 || i==9 || i==11 || i==12) {
			current_badge = "practitioner";
		} 
		if (i==7 || i==10 || i==13) {
			current_badge = "strategist";
		}
		key = "ODI_" + i + "_cmi.suspend_data";
    		try {
			value = localStorage.getItem(key);
			data = $.parseJSON(value);
			completion = data.spoor.completion;
			total = completion.length;
			complete = completion.match(/1/g || []).length;	
			percent = Math.round((complete/total) * 100);
			badge_progression[current_badge] = badge_progression[current_badge] + percent;
			if (percent == 100) {
				mods_done[i] = true;
			}
		}
		catch(err) {
		}
	}
	badge_progression["explorer"] = Math.round(badge_progression["explorer"] / 3);
	badge_progression["adventurer"] = Math.round(badge_progression["adventurer"] / 3);
	badge_progression["practitioner"] = Math.round(badge_progression["practitioner"] / 4);
	badge_progression["strategist"] = Math.round(badge_progression["strategist"] / 3);
	if (moduleId == "ODI_nav"){
		updateBadgeOverall(badge_progression,'explorer');
		updateBadgeOverall(badge_progression,'adventurer');
		updateBadgeOverall(badge_progression,'practitioner');
		updateBadgeOverall(badge_progression,'strategist');
	}
	if (mods_done[1] && mods_done[2] && mods_done[3] && !badges["explorer"]) {
		showMessage('explorer-complete');
		badges["explorer"] = true;	
	}
	if (mods_done[4] && mods_done[5] && mods_done[6] && !badges["adventurer"]) {
		showMessage('adventurer-complete');
		badges["adventurer"] = true;	
	}
	if (mods_done[8] && mods_done[9] && mods_done[11] && mods_done[12] && !bedges["practitioner"]) {
		showMessage('practitioner-complete');
		badges["practitioner"] = true;	
	}
	if (mods_done[7] && mods_done[10] && mods_done[13] && !badges["strategist"]) {
		showMessage('strategist-complete');
		badges["strategist"] = true;	
	}
	localStorage.setItem("ODI_Badges",JSON.stringify(badges));
	
}
function updateBadgeOverall(badge_progression,level) {
	percent = badge_progression[level];
	if (percent > 0) {
		document.getElementById(level + '-overall').innerHTML = percent + "%";
		try { document.getElementById(level + '-overall-side').innerHTML = percent + "%"; } catch(err) {}
	}
	if (percent == 100) {
		document.getElementById(level + '-overall').innerHTML = "✔";
		try { document.getElementById(level + '-overall-side').innerHTML = "✔"; } catch(err) {}
	}
}
function updateProgress() {
//	var frame = document.getElementById('contentFrame').contentDocument;
	miniProgressUpdate();
	for (i=1;i<13;i++) {
		key = "ODI_" + i + "_cmi.suspend_data";
    		try {
			value = localStorage.getItem(key);
			data = $.parseJSON(value);
			completion = data.spoor.completion;
			total = completion.length;
			complete = completion.match(/1/g || []).length;	
			percent = Math.round((complete/total) * 100);
			//document.getElementById('ODI_' + i).setAttribute('value',percent);
			if (percent > 0) {
				document.getElementById('ODI_' + i + '_tick').innerHTML = percent + "%";
			}
			if (percent == 100) {
				document.getElementById('ODI_' + i + '_tick').innerHTML = "✔";
				mods_done[i] = true;
			}
		}
		catch(err) {
		}
	}
	badges = localStorage.getItem("ODI_Badges");
	try {
		badges = $.parseJSON(badges);
	} catch(err) {
		badges = {};
	}
	if (badges["explorer"]) { updateBadgeClass('explorer'); }
	if (badges["adventurer"]) { updateBadgeClass('adventurer'); }
	if (badges["practitioner"]) { updateBadgeClass('prectitioner'); }
	if (badges["strategist"]) { updateBadgeClass('strategist'); }
}
function updateBadgeClass(level) {
	document.getElementById(level + '-badge').className = "progress-badge awarded " + level + "-awarded";	
	try {	
		document.getElementById(level + '-overall-side').parentNode.parentNode.parentNode.parentNode.className = 'resources-item drawer-item link ' + level + '-awarded';
	} catch(err) {}
}

function getModuleId() {
	return moduleId;
}

function setSaveClass(toClass) {
//    var frame = document.getElementById('contentFrame').contentDocument;
    var sl = document.getElementById('save-section');
    $(sl).addClass("saving");
    $(sl).fadeIn();
    $(sl).css('background-image','url(adapt/css/assets/' + toClass + '.gif)');
    var ss = document.getElementById('cloud-status-text');
    $(ss).html(config["_phrases"][toClass]);
    var ssi = document.getElementById('cloud-status-img');
    $(ssi).attr('src','adapt/css/assets/' + toClass + '.gif');
}

function updateRemote() {
    var flag = localStorage.getItem("email");
    if (flag) { setSaveClass('cloud_saving'); }
    if(window.localStorage!==undefined) {
        send = {};
	send.data = JSON.stringify(localStorage);
        $.ajax({
           type: "POST",
           url: api_url + "store.php",         
           data: send,
           success: function(ret) {
		d = new Date();
    		localStorage.setItem("ODI_lastSave",d.toString());
    		localStorage.setItem(moduleId+"_lastSave",d.toString());
    		if (flag) { setSaveClass('cloud_success'); }
	   },
	   error: function (xhr, ajaxOptions, thrownError) {
    		if (flag) { setSaveClass('cloud_failed'); }
           }
        });
    } else {
    }
}

function fetchRemote() {
	if (typeof id == "undefined") {
		return;
	}
	url = api_url + "load.php?id=" + id;
	return $.getJSON( url , function() {
	})
	.done(function(data) {
		var update = false;
		if (localStorage.getItem("_id") != id) {
			localStorage.clear();
			update = true;
			console.log("new data from remote");
		} else {
			lastGlobalSave = data["ODI_lastSave"];
			localSave = localStorage.getItem("ODI_lastSave");
			if (lastGlobalSave > localSave) {
				update = true;
				console.log("Updating data from remote");
			}
		}
		if (update) {
			$.each(data, function(key, value) {
				localStorage.setItem(key,value);
			});
			window.location.href=location.protocol + '//' + location.host + location.pathname;
		}
	})
	.fail(function() {
		console.log("Failed to load data");
		//window.location.href=location.protocol + '//' + location.host + location.pathname;
	});
}

function getRawValue(cname) {
    value = localStorage.getItem(cname);
    if (value) return value;
    return "";
}

function getValue(cname) {
    module_id = getModuleId();
    cname = module_id + "_" + cname;
    value = localStorage.getItem(cname);
    if (value) return value;
    return "";
}

function setRawValue(cname,cvalue) {
    localStorage.setItem(cname,cvalue);
    setTimeout(function() {updateRemote();},2000);
}

function setValue(cname, cvalue) {
    module_id = getModuleId();
    cname = module_id + "_" + cname;
    localStorage.setItem(cname,cvalue);
    setTimeout(function() {updateRemote();},2000);
}

function setValueLocal(cname, cvalue) {
    localStorage.setItem(cname,cvalue);
}

var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
    return query_string;
}();

var API = {
	LMSInitialize: function() {
		this.data = {};
		this.data["cmi.core.lesson_status"] = "not attempted";
		var lesson_status = getValue("cmi.core.lesson_status");
		if (lesson_status != "") {
			this.data["cmi.core.lesson_status"] = lesson_status;
		}
		this.data["cmi.suspend_data"] = getValue("cmi.suspend_data");
		return true;
	},
	LMSFinish: function() {
		return "true";
	},
	LMSGetValue: function(key) {
//		window.console && console.log('LMSGetValue("' + key + '") - ' + this.data[key]);
		if (typeof this.data[key] == "undefined") {
			localValue = getValue(key);
			this.data[key] = localValue;
			return localValue;
		} else {
			return this.data[key];
		}
	},
	LMSSetValue: function(key, value) {
//		window.console && console.log('LMSSetValue("' + key + '") - ' + value);
		this.data[key] = value;
		setValue(key,value,365);
		return "true";
	},
	LMSCommit: function() {
		return "true";
	},
	LMSGetLastError: function() {
		return 0;
	},
	LMSGetErrorString: function() {
		return "Fake error string.";
	},
	LMSGetDiagnostic: function() {
		return "Fake diagnostic information."
	}
}

id = QueryString.id;
if (typeof id != "undefined") {
	fetchRemote();
} else if (!localStorage.getItem("_id")) {
  	$.get( api_url + "create_id.php", function( data ) {
  		window.localStorage.setItem("_id",data);
	});
} else {
	id = localStorage.getItem("_id");
	fetchRemote();
}