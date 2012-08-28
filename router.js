var fs = require("fs");

function route(handle, pathname, response, request) {
	
    console.logt('routing request for: ' + pathname);

    if (typeof(handle[pathname]) === 'function') {
    	handle[pathname](response, request);
    } else {
        
    console.log( 'No request handler found for: ' + pathname );	
    handle['file'](response, request, pathname);
    
    }
}

exports.route = route;