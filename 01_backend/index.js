const { error } = require('console');
const express = require('express');
const fs=require('fs');

const app=express();
const port=3000;
const path=require('path');

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname,'public')));

app.get("/", (req,res)=>{
    fs.readdir('./files', (err, files)=>{   
    res.render("index" , {files:files});
    })

})

app.get("/files/:filename", (req,res)=>{
        fs.readFile(`./files/${req.params.filename}`, "utf8", (err, data)=>{
            
            res.render("show", {filename:req.params.filename, filedata:data});
        })
    })


    app.get("/edit/:filename", (req,res)=>{

        fs.readFile(`./files/${req.params.filename}`, "utf8", (err, data)=>{

            res.render("edit", {filename:req.params.filename, filedata:data});

        })
        })


        app.post("/edit", (req, res) => {
            const previousFileName = req.body.previous;
            const newFileName = req.body.new;
            const newContent = req.body.newContent;
        
            fs.rename(`./files/${previousFileName}`, `./files/${newFileName}`, (err) => {
                if (err) {
                    console.error("Error renaming file:", err);
                    return res.status(500).send("Error renaming file");
                }

                fs.writeFile(`./files/${newFileName}`, newContent, (err) => {
                    if (err) {
                        console.error("Error writing to file:", err);
                        return res.status(500).send("Error updating file content");
                    }
                    
                    res.redirect("/");
                });
            });
        });
        

app.post("/create", (req,res)=>{
    fs.writeFile(`./files/${req.body.title.split(" ").join("")}.txt`, req.body.details, (err)=>{
        res.redirect("/");
    })
})

app.listen(3000);