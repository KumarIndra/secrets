import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from 'express-session';
import passport from 'passport';
import oauth2 from 'passport-google-oauth2';


const app = express();
const port = 3000;
const saltRounds = 10;
//Session 
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
  }));
  
app.use(passport.initialize());
app.use(passport.session());

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


const GoogleStrategy = oauth2.Strategy;
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    // console.log(profile.id);
    return done(null, profile);
  }
));

passport.serializeUser((user, done)=>{
    done(null,user);
});

passport.deserializeUser((user, done)=>{
    done(null,user);
});


app.get("/", (req,res)=>{
    try {
        res.render("home");
    } catch (error) {
        console.log(error);
    }
});

app.get("/auth/google", 
    passport.authenticate("google", { scope: ['email','profile']})
);

app.get("/auth/google/callback", 
    passport.authenticate("google", {
        failureRedirect: "/login"
    }), (req,res) => {
        //Successful authentication, redirect to secrets.
        res.redirect("/secrets");
    }
);

app.get("/secrets", (req,res)=>{
    if(req.user){
        res.render("secrets");
    }else{
        res.redirect("/");
    }
});

app.get("/logout", function(req, res, next){
    req.logout((err)=>{
        if (err){
            return next(err);
        }
        res.redirect("/");
    });
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
        //bcrypt HASHING  
        bcrypt.hash(password, saltRounds, (err, hash)=>{
            const result = db.query("INSERT INTO userform (username, password) values ($1, $2)",[username,hash]);
            if(result){
                res.render("secrets");
            }
        });
        
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
        const decryptedHash = result.rows[0].password;
        bcrypt.compare(password, decryptedHash, (err, resulthash)=>{
            if(resulthash == true){
                res.render("secrets");
            }
        });
    } catch (error) {
        console.log(error);
    } 
});

app.listen(port, () => {
    console.log(`Server has been started at the Port ${port}`);
});