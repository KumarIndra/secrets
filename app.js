import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import md5 from 'md5';

const app = express();
const port = 3000;
// DATABASE CONNECTION
const db = new pg.Client({
    user: "postgres",
    password: process.env.DB_PASSWORD,
    host: "localhost",
    port: "5432",
    database: "udemy"
});
db.connect();

//Accessing the Public folder
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req,res)=>{
    try {
        res.render("home");
    } catch (error) {
        console.log(error);
    }
});

app.get("/register", (req,res)=>{
    res.render("register");
});

app.get("/login", (req,res)=>{
    res.render("login");
});

app.post("/register", async (req,res)=>{
    const username = req.body.username;
    try {
        const password = req.body.password;
        //HASHING ENCRYPTED
        const encrypted = md5(password);
        const result = await db.query("INSERT INTO userform (username, password) values ($1, $2)",[username,encrypted]);
        if(result){
            res.render("secrets");
        }
    } catch (error) {
        console.log(error);
    } 
});

app.post("/login", async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    try {
       
        const result = await db.query("SELECT password from userform where username = $1",[username]);
        console.log("PASSWORD FROM DB:" + result.rows[0].password);
        //HASHING ENCRYPTED
        const decrypted = md5(password)
        console.log(decrypted);
        if(result){
            if(decrypted === result.rows[0].password){
                res.render("secrets");
            }
        }
    } catch (error) {
        console.log(error);
    } 
});

app.listen(port, () => {
    console.log(`Server has been started at the Port ${port}`);
});