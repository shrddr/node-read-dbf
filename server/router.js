function route(handle, pathname, response, request) {
	

    console.logt('routing request for: ' + pathname);

    if (typeof(handle[pathname]) === 'function') {
    	handle[pathname](response, request);
    } else {
    	console.log( 'No request handler found for: ' + pathname );
    	response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('404 Not found');
    }
}

exports.route = route;