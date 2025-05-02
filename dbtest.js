var mysql=require('mysql');
var http= require('http');
var con= mysql.createConnection({
    host:'localhost',
    user:'root',
    password:''
});

con.connect(function(err){
    if(err){
    //console.log("error");    
    http.createServer(function(req,res){
        res.writeHead(200,{'Content-type':'text/html'});
        res.end('Error');
    }).listen(9100)
   
    }else{
    http.createServer(function(req,res){
        res.writeHead(200,{'Content-type':'text/html'});
        res.end('Connected');
    }).listen(9100)
    }
});
