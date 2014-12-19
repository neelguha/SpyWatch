

// Extracts and returns the domain from the url passed to it. 
function urlToDomain(data) {
    var a = document.createElement('a');
    a.href = data;
    var url = a.hostname;
    items = url.split(".");
    var domain = "";
    for(var i = items.length - 1; i > -1;i--){
    	part = items[i];
    	if(i == items.length - 1){
    	    domain =  part;
    	}
    	else{
    	    domain =  part + "." + domain;
    	}	
    	if(part.length < 3){
    	    continue;
    	}
    	switch(part) {
        	case "org":
        	    continue;
        	case "com":
        	    continue;
        	case "edu":
        	    continue;
        	case "net":
        	    continue;
        	case "gov":
        	    continue;
    	}
    	break;
    }
    return domain;
}