const cookieParser = require('cookie-parser');
const express= require('express');
const userModel = require('./models/user')
const postModel=require('./models/post');
const app=express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const upload = require('./config/multerconfig');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get("/", (req, res)=>{
    res.render("index");
})

app.post("/register",async (req, res)=>{
   let {email,name,password, username, age}=req.body;
   let user=await userModel.findOne({email});
    if(user) return res.status(500).send("User already registered");
    
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password,salt, async (err, hash)=>{
          let user =  await  userModel.create({
                username,
                password:hash,
                name,
                email,
                age
            })
            let token =  jwt.sign({email:email, userid: user._id}, "shhhhhhh");
            res.cookie("token", token);
            res.send("Registed");
        })
    })
})

//********login code**********

app.get("/login",async (req, res)=>{
    res.render('login');
 })

 app.post("/login", async(req,res)=>{
    let{email,password}=req.body;
    let user= await userModel.findOne({email});
    if(!user) return res.status(500).send("Something went wrong");

    bcrypt.compare(password, user.password, (err, result)=>{
        if(result){ 
            let token =  jwt.sign({email:email, userid: user._id}, "shhhhhhh");
            res.cookie("token", token);
            res.redirect('/profile');
        }
        else {
            res.redirect("/login");
        }
    })
 })

 //*******logout code */
 app.get("/logout", (req,res)=>{
    res.cookie("token", "");
    res.redirect("/login");
 })


//*******profile code */

app.get("/profile",isLoggedIn ,async (req,res)=>{
    let user = await userModel.findOne({email:req.user.email}).populate("posts");
    res.render("profile", {user});
})


//**********post the blog**********//
app.post('/post', isLoggedIn, async (req,res)=>{
    let user= await userModel.findOne({email:req.user.email});
    let {content} =  req.body;

     let post =  await postModel.create({
        user: user._id,
        content:content
    })

    user.posts.push(post._id);
    user.save();
    res.redirect('/profile');

}) 


// ****************like feature***********
app.get('/like/:id',isLoggedIn,  async(req,res)=>{
    let post = await postModel.findOne({_id:req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) == -1)
    {
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.user),1);
    }

    await post.save();
    res.redirect("/profile");
    
})


// *************Edit Feature***********//
app.get('/edit/:id', isLoggedIn, async (req,res)=>{
    let post= await postModel.findOne({_id:req.params.id}).populate("user");
    res.render("edit", {post});
})


app.post('/update/:id', isLoggedIn, async (req,res)=>{
    let post = await postModel.findOneAndUpdate({_id:req.params.id}, {content:req.body.content});
    res.redirect("/profile");

})


//******protected route code* as a middleware/
 function isLoggedIn(req,res,next){
    if(req.cookies.token=="") res.send("You must be logged in");
    else{
        let data = jwt.verify(req.cookies.token, "shhhhhhh");
        req.user = data;
        }
        next();
 }


// **********multer for updating profile picture***********//

app.get('/profile/upload', (req,res)=>{
    res.render("profileupload");
})

app.post('/upload',isLoggedIn, upload.single('image') ,async (req,res)=>{
    let user = await userModel.findOne({email:req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect('/profile');
})

app.listen(3000);