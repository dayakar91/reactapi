const express=require('express');
const mysql=require('mysql');
const mysql1=require('mysql2-promise');
const config=require('./conf');
const app=express();
const port=9100;
var cors = require('cors');
var bodyparse=require('body-parser');
const jwt=require('jsonwebtoken');
const multer=require('multer');
const path=require('path');
const fs=require('fs');
//import multer from 'multer';
//import path from 'path';

var urlencode=bodyparse.urlencoded({extended:false});

// var connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'reactapi'
//   });

//here comments for reactapi move to git
//here comment for reactapi move server to localmachine
var connection = mysql.createConnection(config.db);
  
app.use(cors());
app.use(bodyparse.urlencoded({extended:true}));
app.use(bodyparse.json());
app.use(express.static('public'));
app.get('/hello',(req,res)=>{
    res.json({message:'Ok'});
});

app.get('/dbcheck',(req,res)=>{
    connection.connect(function(err){
    if(!err){    
        res.json({message:'connected'});
    }else{
        res.send(err);
    }
    });
});


app.get('/getemplist',(req,res)=>{
    // const auth_header=req.headers.authorization;
    // if(!auth_header) res.send(401,'Unauthorized request');
    // const accessToken = auth_header.split(' ')[1];
    // jwt.verify(accessToken,'secret1',(err,user)=>{
    //     if(err) res.json(0);
    //     else{
    //      const sql="select * from employee";
    //      connection.query(sql,(err,results,fields)=>{
    //     if(err){
    //         res.send(err)
    //     }else{
    //         res.json(results)
    //     }
    // });
    //     }
    // })
    const auth_header = req.headers.authorization;

// Check if the Authorization header exists
if (!auth_header) {
    return res.status(401).send('Unauthorized request');  // Updated to the correct res.status().send() format
}

// Split the header to extract the token
const accessToken = auth_header.split(' ')[1];

// Check if the token exists after splitting
if (!accessToken) {
    return res.status(401).send('Token missing from authorization header');
}

// Verify the token using JWT
jwt.verify(accessToken, 'secret1', (err, user) => {
    if (err) {
        return res.status(401).json({ message: 'Invalid token' });
    } else {
        const sql = "SELECT * FROM employee";
        
        // Execute the SQL query to fetch employee data
        connection.query(sql, (err, results, fields) => {
            if (err) {
                return res.status(500).send(err);  // Handle DB error
            } else {
                res.json(results);  // Send back employee data
            }
        });
    }
});

});

app.get('/getemp/:id',(req,res)=>{
    const empid=req.params.id;
    const sql=`select * from employee where id=${empid}`;
    connection.query(sql,(err,results,fields)=>{
        if(err){
            res.send(err);
        }else{
            res.json(results);
        }
    });
});

app.post('/emplogin',(req,res)=>{
    const email = req.body.email;
    const password=req.body.password;

    const sql=`select email from users where email='${email}'`;
    connection.query(sql,(err,results,fields)=>{
            if(results.length==0){
                res.json({message:"Wrong Mail"});
            }else{
                const sql1=`select id,email,password from users where email='${email}'`;
                connection.query(sql1,(err1,results1,fields1)=>{
                    var passchk=results1[0].password;
                    var empid=results1[0].id;
                    var empemail=results1[0].email;
                    const bcrypt= require('bcryptjs');
                    var passchk1=bcrypt.compareSync(password,passchk);

                    if(passchk1){
                        const payload={
                            id:empid,
                            email:empemail
                        }
                        const secret='secret1';
                        const options = { expiresIn: '1h' };
                        const token=jwt.sign(payload,secret,options);

                        res.json({id:empid,message:results1.length,accessToken:token});

                    }else{
                        res.json({message:"Wrong Password"})
                    }
                })
                
            }
        
    });
});

app.post('/empregi',(req,res)=>{
    const username=req.body.username;
    const email = req.body.email;
    var password=req.body.password;

    //res.json({message:username})
    //var hashpass;
    const bcrypt= require('bcrypt-nodejs');
    const saltRounds = 10;
    const myPlaintextPassword = password;

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(myPlaintextPassword, salt);

//res.json({message:hash})
    

    const sql=`insert into users (username,email,password) values ('${username}','${email}','${hash}')`;
    //const sql=`select * from users`;
    connection.query(sql,(err,results,fields)=>{
        if(err){
            res.json({message:err});
        }else{
            res.json({message:'Record Inserted Successfully'})
        }
    });

});

// const destination = 'public/images';
// if (!fs.existsSync(destination)) {
//   fs.mkdirSync(destination, { recursive: true });
// }

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + "_" + Date.now() + path.extname(file.originalname));  // Corrected: Use file.fieldname instead of cb.file.fieldname
    }
  });
  
  const upload = multer({
    storage: storage
  });
  
app.post('/uploadimg/:id', upload.single('image'), (req, res) => {
    const image=req.file.filename;
    const empid=req.params.id;
    const sql=`update users set image=? where id=${empid}`;
    connection.query(sql,[image],(err,result)=>{
        if(err)  res.json({message:err});
        res.json({ message: 'File uploaded successfully!' }); 
    });
});

app.get('/profileimg/:id',(req,res)=>{
    const empid=req.params.id;
    const sql=`select image from users where id=${empid}`;
    connection.query(sql,(err,result)=>{
        if(err)  res.json({message:err});
        res.json({image:result[0].image}); 
    });
})

app.post('/empupdate',(req,res)=>{
    const id=req.body.id;
    const name=req.body.name;
    const email=req.body.email;
    const mobile=req.body.mobile;
    const sql=`update employee set name='${name}',email='${email}',mobile=${mobile} where id=${id}`;
    connection.query(sql,(err,result,fields)=>{ 
        if(err){
            res.json({message:0});

        }else{
        res.json({message:1});
        }
    })
});

app.listen(port,()=>{
    console.log(`Example app listening at http://localhost:${port}`);
})
