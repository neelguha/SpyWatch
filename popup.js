// Copyright (c) 2014 Neel Guha. All rights reserved.

// This is the code that drives the popup window. 

currentPageURL = "";
domain = "";
numTotalSpies = 0;
spies = Object();
allspies = Object();
allData = Object();

function getCurrentTab () {
    chrome.tabs.query({active: true, currentWindow: true}, 
    	function(tabs) {
		  	currentPageURL = tabs[0].url;
		  	domain = urlToDomain(currentPageURL);

		  	chrome.storage.local.get(null, 
		   		function(all) {
		   			allData = all;
					spies = all[currentPageURL];
					allspies = all["allspies"];
					showSpies();
				});
		});
}

/* Shows the spies watching the user on the current page */

function showSpies() {
	$('.main').empty();
	addClose();
    
    if ( spies == null){
	// We have no data. User must have just cleared data or something
		$('.main').append("Please refresh the page!<br>");
		return;
    } 
    console.log(spies);
    
    $('.main').append("<b>" + Object.keys(allspies).length + "</b> third party sites are watching you. <seeall><u style='cursor: pointer'>See All</u>.</seeall><br><br> ");
    $('.main').append(" The following sites know that you visited this page. Click on a site to find out what more it knows about you.<br>");
    document.querySelector('seeall').addEventListener('click', seeAllSpies);
    $('.main').append("<ol class='spies'></ol>");
    var n = 0;
    
    for (var spy in spies) {
    	(function (spy) {
			if (spy != 'urlx' && spy != 'title' && spy !='current' && spy !='time') {

			    var tag = "tag" + n;
			    $('.spies').append("<li><" + tag + "><u  style='cursor: pointer'>" + spy+ "</u> <u style='cursor: pointer'></" + tag + "></li>");
			    document.querySelector(tag).addEventListener('click', function(){
			    	getSpiedSites(spy);
			    });
			    n++;
			}
		}(spy));
    }

    if (n == 0) {
		$('.main').append("Spy Watch did not detect anyone watching you on this page.<br><br>");
    }

    $('.main').append("<clear><button class=\"btn btn-small btn-danger \" title=\"clear\" type=\"button\">  Clear Data </button></clear>");
    document.querySelector('clear').addEventListener('click', clearData);
}


// Places a "back" button allowing the user to go to initial screen in the pop up. 
function goBack () {
	getCurrentTab();
}


function clearData () {
    chrome.storage.local.clear();
    window.close();
}

function closeWindow () {
    window.close();
}

// Shows all the third party sites that have spied on the user. 
function seeAllSpies() {
    $('.main').empty();
    addClose();
    spyCounts = Object();
    var numSpies = 0;

    for (var site in allData) {
    	if (site == "allspies")
    		continue;
		for (var spy in allData[site]) {
		    if (spy != 'title') {
				if (spyCounts[spy] == null) {
					numSpies++;
				    spyCounts[spy] = 1;
				} else {
				    spyCounts[spy]++;
				}
		    }
		}
    }
   
    $('.main').append("The following " + numSpies + " sites are watching you. Click on each for what they have seen.");
    $('.main').append("<ol class='spies'></ol>");

    var sortedSpies = Object.keys(spyCounts);
    sortedSpies = sortedSpies.sort(function(a, b) {return spyCounts[b] - spyCounts[a]})
    
    n = 0;
    spyList = new Array();
    for (var spyIndex in sortedSpies){
		spy = sortedSpies[spyIndex];
		num = spyCounts[spy];
    	(function (spy) {
			if (spy != 'urlx' && spy != 'title' && spy !='current' && spy !='time') {
			    var tag = "tag" + n;
			    $('.spies').append("<li><" + tag + "><u  style='cursor: pointer'>" + spy+ " (" + num + ")</u> <u style='cursor: pointer'></" + tag + "></li>");
			    document.querySelector(tag).addEventListener('click', function(){
			    	getSpiedSites(spy);
			    });
			    n++;
			}
		}(spy));
    }
    if (n == 0) {
		$('.main').empty();
		$('.main').append("Spy Watch has not detected anyone watching you.");
		$('.main').append("<br><br><br><div><font size=1> *If you just cleared this extension's data, refresh the page to see who has watched you.</font><div>");
    }
    $('.spies').append("<br><br><back><u  style='cursor: pointer'>&lt;&lt; Go Back</u></back>");
    document.querySelector('back').addEventListener('click', goBack);

}

// Adds a button allowing users to close the popup.  
function addClose () {
   
    document.querySelector('closeb').addEventListener('click', closeWindow);
}


/* Displays the sites spied on by the passed spy as well as statistics regarding 
the fraction of the user's browsing history that the spy knows. */

function getSpiedSites(spy){

    $('.main').empty();
    addClose();
    
    var spiedItems = new Object();
    var numPagesSpied = 0; // the number of pages seen by this spy
    var numPagesSeen = 0; // total number of pages seen by this user
    var numSitesSpied = 0;

	chrome.runtime.sendMessage(spy, function(response){});
    for (url in allData) {
    	if (url == "allspies")
    		continue;
    	visitedPage = allData[url];
		if (visitedPage == null) 
		    continue;
		numPagesSeen++;
		if (visitedPage.hasOwnProperty(spy)) {
			numPagesSpied++;
		    var title = visitedPage.title;
	    	chrome.runtime.sendMessage("title: " + title, function(response){});
		    if (title != null && title.length > 3) {
				domain = urlToDomain(url);
				chrome.runtime.sendMessage("spied domain: " + domain, function(response){});
				if (spiedItems[domain] == null) {
				    spiedItems[domain] = new Object();
				    numSitesSpied++;
				}
				domainSpiedUrls = spiedItems[domain];
				spiedItems[domain][url] = title;
		    }
		}
    }
    if (numPagesSpied == 0) {
		$('.main').append(spy + " has not watched you on any other pages.");
		return false;
    }
    spyWatchPercentage = (numPagesSpied * 100) / numPagesSeen;
    spyWatchPercentage = spyWatchPercentage.toFixed(1);
    s = "across " + numSitesSpied + " sites you have visited.";
    if (numSitesSpied == 1) {
		s = " on 1 site."
    }
    p = " pages ";
    if (numPagesSpied == 1) {
		p = " page ";
    }
    $('.main').append( spy + " has watched you on " + numPagesSpied + p + s + "<br><br>" + spy + " knows about " + spyWatchPercentage + "% of your browsing history.<br><br>" );

    $('.main').append("<ol class='viewed'></ol>");
    str = "";
    for(var site in spiedItems){
		if(spy.toString() != site){
		    str = str + "<li><u style='cursor: pointer'></u>" + site + ": <ol>";
		    counter = 0;
		    num_items = Object.keys(spiedItems).length;
		    for (var urlx in spiedItems[site]){
				page = spiedItems[site][urlx];
				if(counter > 4){
				    num = Object.keys(spiedItems[site]).length - counter
				    str = str + "and " + num + " more..." 
				    break;
				}
				str = str + "<li>" + page + "</li>";
				counter++;
		    }
		    str = str + "</ol></li>";
		}
    }
    $('.viewed').append(str);
    $('.main').append("<br><back><u style='cursor: pointer'>&lt;&lt; Go Back</u></back>");
    document.querySelector('back').addEventListener('click', goBack);
    return false;
}

// call getCurrentTab as soon as the document DOM is loaded.
$(document).ready(getCurrentTab);

    
