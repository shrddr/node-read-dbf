var server = require('./server');
var router = require('./router');
var handlers = require('./handlers');

var handle = {} //map of functions
handle["/"] = handlers.start;
handle["/start"] = handlers.start;
handle["/upload"] = handlers.upload;
handle["/show"] = handlers.show;
handle["/favicon.ico"] = handlers.favicon;

console.logt = function(s) {
	t = new Date();
	console.log( t.toLocaleTimeString() + '.' + t.getMilliseconds() + ' ' + s);
}

server.start(router.route, handle);

