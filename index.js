var server = require('./server');
var router = require('./router');
var handlers = require('./handlers');

var handle = {} //map of functions
handle["/start"] = handlers.start;
handle["/show"] = handlers.show;
handle["file"] = handlers.serve;

console.logt = function(s) {
	t = new Date();
	console.log( t.toLocaleTimeString() + '.' + t.getMilliseconds() + ' ' + s);
}

server.start(router.route, handle);

