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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
let redirectUrl;
const saveRedirectUrl = (req, res, next) => {
  if(req.originalUrl != "/login" && req.originalUrl != "/register")
    redirectUrl = req.originalUrl; // Save the URL
    console.log('Redirect URL:', redirectUrl); // Debugging
  
  next();
};
app.use(saveRedirectUrl);
// const saveRedirectUrl = (req, res, next) => {
//   if (req.session.redirectUrl) {
//       console.log(req);
//   }
//   console.log(a);
//   next();
// };
// app.use(saveRedirectUrl);
app.use(passport.initialize());
app.use(passport.session());
var name;
var password;
var flag = false;
let user;

let posts = [];

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

let career = [{name:"Software Developer", 
              desc:"Design and develop software applications",
              salary : "$70,000-$80,000",
              growth : "Medium",
              req1 : "Bachelor in CS",
              req2 : "Programming skills",
             req3 : "Problem Solving"}];

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

app.get("/explore",async(req,res)=>{
  const car = await db.query("select * from career")
  console.log(car.rows);
  res.render("explore.ejs",{
    careers : car.rows,
    percent : "95"
  });
});

app.get("/resource",(req,res)=>{
  res.sendFile(__dirname + "/public/resource.html");
})

app.get("/profile",(req,res)=>{
  if (req.isAuthenticated()) {
    console.log('i am logged in in profile');
    console.log(user);
    res.render("profile.ejs",{
      name:user.name,
      summary:"i am a pro python developer",
      location: user.address,
      contactno: user.phone_no,
      education: user.education,
      age: user.age
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/comunity",async (req,res) => {
  const result = await db.query("Select * from comments");
  console.log(result.rows);
  posts = result.rows;
  console.log(name);
  res.render("community.ejs",{
    posts : posts,
    name: name
  })
})

app.get("/new",(req,res) => {
  if (req.isAuthenticated()) {
    console.log('i am logged in for posting comments');
    res.render("comment.ejs", { heading: "New Post", submit: "Create Post" });
  } else {
    res.redirect("/login");
  }
   
})
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

app.post("/new", async (req,res) => {
  const title = req.body.title;
  const content = req.body.content;
  console.log(name);
  await db.query("insert into comments(title,msg,user_name) values($1,$2,$3)",[title,content,name]);
  // res.render("community.ejs",{
  //   posts : posts,
  //   name: name
  // })
  res.redirect("/comunity");
})


app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    const a = redirectUrl || "/"; // Default to home if no URL is saved
    //req.session.redirectUrl = null; // Clear the session value after use
    res.redirect(a);
  }
);

app.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const naam = req.body.username;
  
  console.log(email);
  try {
    const checkResult = await db.query("SELECT * FROM userinfo WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      const result = await db.query(
              "Insert Into userinfo(email,password,name) Values ($1,$2,$3) returning *",[email,password,naam]
            );
            name = result.rows[0].username;
            // loginuser = result.rows[0].email;
            user = result.rows[0];
            req.login(user, (err) => {
              console.log("success");
              const a = redirectUrl || "/"; // Default to home if no URL is saved
              //req.session.redirectUrl = null; // Clear the session value after use
              console.log(`inside register ${a}`);
              res.redirect(a);
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
      name = result.rows[0].name;
      // loginuser = result.rows[0].email;
      if (result.rows.length > 0) {
        user = result.rows[0];
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