import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    password: "postgres2023",
    host: "localhost",
    port: "5432",
    database: "udemy"
});
db.connect();

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
    const password = req.body.password;
    try {
        const result = await db.query("INSERT INTO userform (username, password) values ($1, $2)",[username,password]);
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
        console.log(result);
        if(result){
            if(result.rows[0].password === password){
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