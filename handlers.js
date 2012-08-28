var fs = require("fs");
var util = require('util');

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

function readhead() {

}

function show(response) {

  function dtfmt(d, t) {
      return Date.parse(d.slice(0,4) + '.' + d.slice(4,6) + '.' + d.slice(6,8) + ' ' + t);
  }

  function process(buf, record) {
    base.data[record] = [];
    //for (i=0; i<base.fieldscount; i++)                

    var d = buf.toString('ascii', base.fields[0].shift, base.fields[0].shift+base.fields[0].width).trim();
    var t = buf.toString('ascii', base.fields[1].shift, base.fields[1].shift+base.fields[1].width).trim();
    //console.log(base.fields[0].shift, d, base.fields[1].shift, t);
    base.data[record][0] = dtfmt(d, t);

    var v = buf.toString('ascii', base.fields[3].shift, base.fields[4].shift+base.fields[4].width).trim();
    base.data[record][1] = v;
  }

  var base = { fields: [], data: [], label: "hi" }
  var field = 0;
  var dbf = '2012 07 10 0000 (Wide).DBF';

  var head_stream = fs.createReadStream(dbf, {bufferSize: 64*1024});
  head_stream.on("data", function(data){

      if (field == 0) {   
          base.type = data.readUInt8(0);
          base.lastupdate = new Date (data.readUInt8(1) + 1900, data.readUInt8(2) - 1, data.readUInt8(3)); 
          base.recordscount = data.readUInt32LE(4);
          base.firstdata = data.readUInt16LE(8);
          base.recordlength = data.readUInt16LE(10);
      }
    
      while (field >= 0) {  
          base.fields[field] = { name: data.toString('ascii', 32+field*32, 42+field*32).replace('\u0000', '') }
          base.fields[field].type = data.toString('ascii', 43+field*32, 44+field*32);
          base.fields[field].shift = data.readUInt32LE(44+field*32);
          base.fields[field].width = data.readUInt8(48+field*32);
          base.fields[field].decimals = data.readUInt8(49+field*32);
          
          field++;
          if (data.readUInt8(32+field*32) == 13) {
              base.fieldscount = field;
              field = -1;
          }
      }   
  });

  head_stream.on("error", function(err){
    console.error("Header error: %s", err)
  });

  head_stream.on("close", function(){
    //console.logt("Header ok:");
    //console.log(util.inspect(base));
    
    var record = 0;
    var pos = base.firstdata;
    var buf = new Buffer(base.recordlength);

    var data_stream = fs.createReadStream(dbf, {bufferSize: base.recordlength, start: base.firstdata });
    data_stream.on("data", function(data){

      console.log(`Received pos ${pos} len ${data.length}`);

      chunk_start = pos;
      chunk_end = pos + data.length;
      
      while (true) {

        record_start = base.firstdata + record * base.recordlength;
        record_end = base.firstdata + (record+1) * base.recordlength;
        //console.log(`Rec ${record} (${record_start} .. ${record_end})`);

        if (record_start >= chunk_end)
          break;

        if (record_start >= chunk_start)
          data.copy(buf, 0, (record_start-chunk_start) % base.recordlength);
        if (record_start < chunk_start) {
          data.copy(buf, chunk_start-record_start);
        }

        if (record_end <= chunk_end) {
          process(buf, record);
          record++;
        }
        if (record_end > chunk_end) {
          break;
        }
      }

      pos = pos + data.length;

    });
    
    data_stream.on("error", function(err){
      console.error("Data error: %s", err)
    });
    
    data_stream.on("close", function(){
      //console.logt("Data ok:");
      //console.log(util.inspect(base.data));
      response.writeHead(200, {"Content-Type": "application/json"});
      response.end(JSON.stringify(out = { "data": base.data, "label": dbf } ));
    });
  });

}

function serve(response, request, pathname) {
  console.log("Request handler: 'serve'");
  if (pathname == "/") pathname = "/index.html";
  fs.readFile('.' + pathname, "binary", function(error, file) {
    if(error) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write(error + "\n");
      response.end();
    } else {
      response.writeHead(200, {"Content-Type": "text/html"});
      response.write(file, "binary");
      response.end();
    }
  });
}

exports.start = start;
exports.show = show;
exports.serve = serve;