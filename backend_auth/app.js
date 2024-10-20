const express = require('express');
const app=express();
const path=require('path');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('./models/user');

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req,res)=>{
    res.render("index");
})


app.post('/create', (req, res) => {
    let { username, email, password, age } = req.body;

    console.log('Original Password:', password);

    // Hash the password
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(password, salt, async (err, hash) => {
           
            console.log('Hashed Password:', hash);

      
            let createdUser = await userModel.create({
                username,
                email,
                password:hash,  
                age
            });

            let token = jwt.sign({ email }, "shhhhhhhhhh");
            res.cookie('token', token);
            res.send(createdUser);
        });
    });
});



//login a user

app.get('/login', (req,res)=>{
    res.render("login");
})


app.post('/login', async (req,res)=>{
    let user = await userModel.findOne({email:req.body.email});
    if(!user) res.send("Something went wrong");

    bcrypt.compare(req.body.password, user.password, (err, result)=>{
        if(result){
            let token = jwt.sign({ email: user.email }, "shhhhhhhhhh");
            res.cookie('token', token);
            res.send("You are logged in!");
        }

        else
        {
             res.send("You are not logged in");
            }

    });
})

//logout a user

app.get('/logout', (req,res)=>{
    res.cookie("token", "");
    res.redirect("/");
})
 



app.listen(3000);