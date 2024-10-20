const express= require('express');
const app=express();

const userModel= require("./models/user");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.get("/", (req,res)=>{
    res.render("index");
})

app.get('/users', async (req,res)=>{
    let allUsers = await userModel.find();
    res.render("read", {users:allUsers});
})

app.post('/create', async (req,res) =>{
    let{name,email,imageURL} = req.body;

    let createdUser = await userModel.create({
        name:name,
        email:email,
        imageURL:imageURL,
    })
    res.redirect("/users")
})

app.get('/delete/:id', async (req,res)=>{

    let users = await userModel.findOneAndDelete({_id:req.params.id});
    res.redirect("/users");
})

app.get('/edit/:id', async (req,res)=>{

    let editedUsers = await userModel.findOne({_id:req.params.id});
    res.render("edit", {editedUsers});
})

app.post('/update/:id', async (req,res)=>{

    let {name,email,imageURL}=req.body;
    let updatedUsers = await userModel.findOneAndUpdate({_id:req.params.id}, {name,email,imageURL}, {new:true});
    res.redirect("/users");
})


app.listen(3000);