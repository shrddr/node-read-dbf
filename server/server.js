var http = require('http');
var url = require('url');


function start(route, handle) {
    http.createServer(function (request, response) {
    	var postData = "";
        var pathname = url.parse(request.url).pathname;

        console.logt('received request for: ' + pathname);

	    route(handle, pathname, response, request);

    }).listen(1337, '127.0.0.1');
    console.log('Server running at http://127.0.0.1:1337/');
}

exports.start = start;