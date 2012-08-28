var querystring = require("querystring"),
	fs = require("fs"),
	formidable = require("formidable");

function start(response) {
	console.logt("request handler: 'start'");

	var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" '+
    'content="text/html; charset=UTF-8" />'+
    '</head>'+
    '<body>'+
    '<form action="/upload" enctype="multipart/form-data" '+
    'method="post">'+
    '<input type="file" name="upload">'+
    '<input type="submit" value="Upload file" />'+
    '</form>'+
    '</body>'+
    '</html>';

	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write(body);
	response.end();

}

function upload(response, request) {
	console.logt("request handler: 'upload'");

	var form = new formidable.IncomingForm();
	form.uploadDir = process.cwd();
	console.logt("handling form");
	form.parse(request, function(error, fields, files) {
		console.logt("form parsed");
		console.log(files); // TODO: pipe files.upload.type to show() content-type
		fs.rename(files.upload.path, "./img/test.png");
	});

	response.writeHead(200, {'Content-Type': 'text/html'});
	response.write("received image:<br/>");
    response.write("<img src='/show' />");
	response.end();
}

function show(response) {
  console.log("Request handler: 'show'");
  fs.readFile("./img/test.png", "binary", function(error, file) {
    if(error) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "image/png"});
      response.write(file, "binary");
      response.end();
    }
  });
}

function favicon(response) {
	console.logt("request handler: 'favicon'");
	response.writeHead(200, {'Content-Type': 'text/plain'});
    response.end('Favicon');
}

exports.start = start;
exports.upload = upload;
exports.show = show;
exports.favicon = favicon;