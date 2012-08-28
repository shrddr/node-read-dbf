var http = require('http');
var fs = require('fs');
var util = require('util');

var base = { fields: [], data: [] }

http.createServer(function (request, response) {
    
    response.writeHead(200, {'Content-Type': 'application/json'});
    response.end(JSON.stringify(base));
    
}).listen(1337, '127.0.0.1');

console.log('Server running at http://127.0.0.1:1337/');


var field = 0;

var head_stream = fs.createReadStream('2012 03 12 0000 (Wide).DBF', {bufferSize: 64*1024});
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
    console.log("Header ok:");
    console.log(util.inspect(base));
    
    var record = 0;

    var data_stream = fs.createReadStream('2012 03 12 0000 (Wide).DBF', {bufferSize: base.recordlength, start: base.firstdata });
    data_stream.on("data", function(data){
        if (record < 10) {
        base.data[record] = [];
            for (i=0; i<base.fieldscount; i++) {               
                base.data[record][i] = data.toString('ascii', base.fields[i].shift, base.fields[i].shift+base.fields[i].width).trim();
            }
            record++;
        }
    });
    data_stream.on("error", function(err){
      console.error("Data error: %s", err)
    });
    data_stream.on("close", function(){
      console.log("Data ok:");
      console.log(util.inspect(base.data));
    });
  
});


