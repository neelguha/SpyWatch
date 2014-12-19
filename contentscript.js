/*
 * Copyright (c) 2013 Neel Guha. All right reserved.
 */


 url = document.location; // The url of the current page the user is visiting
 domain = ""; // The domain of the current page the user is visiting. 
 title = document.title; // The title of the page the user is visiting. 
 numSpies = 0; // The number of spies for this page.
 spies = Object();

window.onload = function() { 
    domain = urlToDomain(url);
    console.log(domain);
    var delay=1000;//1 seconds
    counter = 0;
    while (counter < 4){
        setTimeout(function(){
            chrome.storage.local.get(url, updatePageSpies);
            chrome.storage.local.get("allspies", updateList);  
        
        },delay); 
        counter++;
    }
}



function updatePageSpies (pageSpies) {
    
    // If the user hasn't visited this page before, then pageSpies will be null and we must create a new object. 
    if (pageSpies == null) {
       pageSpies = new Object();
    }
    if (pageSpies[url] != null){
        pageSpies = pageSpies[url];
    }
    // record the url and title for this page.
    if (title.length == 0)
        return;
    pageSpies['title'] = title;

    getSpies(pageSpies,document.getElementsByTagName("script"));
    getSpies(pageSpies,document.getElementsByTagName("img"));
    getSpies(pageSpies,document.getElementsByTagName("iframe"));
    spies = pageSpies;
    var obj= {};
    obj[url] = pageSpies;
    chrome.storage.local.set(obj);

}

function updateList(allspies){

    if (spies == null) 
        return;
    
    if (allspies['allspies'] != null)
        allspies = allspies['allspies'];

    if (allspies == null)
        allspies = new Object();

    keys = Object.keys(spies);
    for (keyIndex in keys){
        var spy = keys[keyIndex];
        if (spy != "title"){
            allspies[spy] = 1;
        }
    }
    chrome.storage.local.set({'allspies': allspies});
}


function getSpies(pageSpies, links){
    
    for (var i=0;i<links.length;i++) {
        var spyDomain = urlToDomain(links[i].src);
        if (spyDomain != domain && spyDomain.length > 0 && spyDomain.indexOf(".") > -1){ 
            pageSpies[spyDomain] = 1;
        }
    }
}








