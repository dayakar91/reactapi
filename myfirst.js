var http= require('http');
http.createServer(function(req,res){
    res.writeHead(200,{'Content-type':'text/html'});
    res.end('Hello World! Welcome to Nodejs');
}).listen(9100);