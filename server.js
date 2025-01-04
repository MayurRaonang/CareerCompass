import express from "express"
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";
import path from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
// import findcareer from './public/AssesScript.js';
// findcareer();
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();  
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: "TOPSECRETWORD",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());
var name;
var password;
var flag = false;

let posts = [];

const db = new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "CareerCompass",
  password : "Sumit@06",
  port : 5432
});
db.connect();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/home.html");
});

app.get("/login",(req,res)=>{
    res.sendFile(__dirname+ "/public/login.html");
});

app.get("/assesment",(req,res) => {
  if (req.isAuthenticated()) {
    console.log('i am logged in')
    res.sendFile(path.join(__dirname, 'public', 'assesment.html'));
  } else {
    res.redirect("/login");
  }
});

app.get("/explore",(req,res)=>{
  res.send("not ready");
});

app.get("/resource",(req,res)=>{
  res.sendFile(__dirname + "/public/resource.html");
});

app.get("/profile",(req,res)=>{
  if (req.isAuthenticated()) {
    console.log('i am logged in');
    res.render("profile.ejs");
  } else {
    res.redirect("/login");
  }
});

// app.get("/comunity",(req,res)=>{
//   res.render("comment.ejs", { heading: "New Post", submit: "Create Post" });
// });

app.post('/submit-career', async (req, res) => {
  const suitedCareerIndex = req.body.suitedCareerIndex; // Extract suitedCareerIndex
  const email = req.user.email;
  console.log(suitedCareerIndex);
  console.log(email);
  console.log(req.user.email);
  try {
      // Save the suitedCareerIndex to the database
      const query = `UPDATE userinfo SET assesment = $1 WHERE email = $2`;
      await db.query(query, [suitedCareerIndex,email]);

      res.json({ success: true, message: 'Career index saved successfully!' });
  } catch (err) {
      console.error('Database error:', err);
      res.status(500).json({ success: false, message: 'Failed to save career index.' });
  }
});

app.get("/comunity",async (req,res) => {
  const result = await db.query("Select * from comments");
  console.log(result.rows);
  posts = result.rows;
  res.render("community.ejs",{
    posts : posts,
    name: "Sumit Rathod"
  })
})

app.get("/new",(req,res) => {
   res.render("comment.ejs", { heading: "New Post", submit: "Create Post" });
})

app.post("/new", async (req,res) => {
  const title = req.body.title;
  const content = req.body.content;
  console.log(name);
})


app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/assesment",
    failureRedirect: "/login",
  })
);

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  const age = req.body.age;
  const phone_no = req.body.phone_no;
  console.log(email);
  try {
    const checkResult = await db.query("SELECT * FROM userinfo WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      const result = await db.query(
              "Insert Into userinfo(email,password,age,phone_no) Values ($1,$2,$3,$4) returning *",[email,password,age,phone_no]
            );
            const user = result.rows[0];
            req.login(user, (err) => {
              console.log("success");
              res.redirect("/assesment");
            });
      // bcrypt.hash(password, saltRounds, async (err, hash) => {
      //   if (err) {
      //     console.error("Error hashing password:", err);
      //   } else {
      //     const result = await db.query(
      //       "Insert Into userinfo(email,password,age,phone_no) Values ($1,$2,$3,$4) returning *",[email,password,age,phone_no]
      //     );
      //     const user = result.rows[0];
      //     req.login(user, (err) => {
      //       console.log("success");
      //       res.redirect("/assesment");
      //     });
      //   }
      // });
    }
  } catch (err) {
    console.log(err);
  }
});

passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM userinfo WHERE email = $1 ", [
        username,
      ]);
      name = result.rows[0];
      if (result.rows.length > 0) {
        const user = result.rows[0];
        console.log(user);
        const storedHashedPassword = user.password;
        if(password === storedHashedPassword){
          return cb(null, user);
        }else {
          //Did not pass password check
          return cb(null, false);
        }
        // bcrypt.compare(password, storedHashedPassword, (err, valid) => {
        //   if (err) {
        //     //Error with password check
        //     console.error("Error comparing passwords:", err);
        //     return cb(err);
        //   } else {
        //     if (valid) {
        //       //Passed password check
        //       return cb(null, user);
        //     } else {
        //       //Did not pass password check
        //       return cb(null, false);
        //     }
        //   }
        // });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port,()=>{
    console.log(`Server Running on Port ${port}`);
})