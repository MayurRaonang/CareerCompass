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
import multer from "multer";
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

const storage = multer.diskStorage({
  destination: function (req,file,cb){
    return cb(null,"./public/uploads");
  },
  filename: function (req,file,cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
let redirectUrl;
const saveRedirectUrl = (req, res, next) => {
  if(req.originalUrl != "/login" && req.originalUrl != "/register")
    redirectUrl = req.originalUrl; // Save the URL
    //console.log('Redirect URL:', redirectUrl); // Debugging
  
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

let id;
var name;
var password;
var flag = false;
let user;

let posts = [];
let career = [];
let percentage =[];

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
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
    //console.log('i am logged in')
    res.sendFile(path.join(__dirname, 'public', 'assesment.html'));
  } else {
    res.redirect("/login");
  }
});

app.get("/explore",async(req,res)=>{
  const user_career = await db.query("select * from userinfo where uid = $1",[id])
  //console.log(user_career.rows);
  let career1_index = user_career.rows[0].career1_index;
  career1_index++;
  let career1_percent = user_career.rows[0].career1_percent;
  const car1 = await db.query("select * from career where career_id = $1",[career1_index]);

  let career2_index = user_career.rows[0].career2_index;
  career2_index++;
  let career2_percent = user_career.rows[0].career2_percent;
  const car2 = await db.query("select * from career where career_id = $1",[career2_index]);

  let career3_index = user_career.rows[0].career3_index;
  career3_index++;
  let career3_percent = user_career.rows[0].career3_percent;
  const car3 = await db.query("select * from career where career_id = $1",[career3_index]);

  career.push(car1.rows[0]);
  career.push(car2.rows[0]);
  career.push(car3.rows[0]);

  percentage.push(career1_percent);
  percentage.push(career2_percent);
  percentage.push(career3_percent);

  res.render("explore.ejs",{
    career : career,
    percent : percentage
  });
  career.length = 0;
  percentage.length = 0;
});

app.get("/resource",(req,res)=>{
  res.sendFile(__dirname + "/public/resource.html");
})

app.get("/profile",async(req,res)=>{
  if (req.isAuthenticated()) {
    console.log('i am logged in in profile');
    const result = await db.query("SELECT * FROM userinfo WHERE uid = $1 ", [
      user.uid,
    ]);
    user = result.rows[0];
    console.log(user);
    res.render("profile.ejs",{
      id:user.uid,
      name:user.name,
      summary:user.summary,
      location: user.address,
      contactno: user.phone_no,
      education: user.education,
      age: user.age,
      profilepic: user.profile,
      linkedin: user.linkedin,
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/comunity",async (req,res) => {
  const result = await db.query("Select * from comments");
  posts = result.rows;
  res.render("community.ejs",{
    posts : posts
  })
})

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.post("/profilepic",upload.single("profileImage"),async(req,res) => {
  const str = req.file.path;
  const pro = str.replace("public\\", "");
  console.log(pro);
  await db.query(`UPDATE userinfo SET profile = ($1) WHERE uid = $2`,[pro,user.uid])
  res.redirect("/profile");
})

app.post("/edit",async(req,res) =>{
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  console.log(req.body)
  console.log(user.uid)
  await db.query(`UPDATE userinfo SET ${id} = ($1) WHERE uid = $2`,[item,user.uid])
  res.redirect("/profile")
})

app.post("/new", async (req,res) => {
  const title = req.body.title;
  const msg = req.body.content;
  const topic1 = req.body.topic1;
  const topic2 = req.body.topic2;
  const topic3 = req.body.topic3;
  const user_name = name;

  const date = new Date();
  var curr_date = date.getDate();
  var curr_month = date.getMonth();
  var curr_year = date.getFullYear();

  curr_month = curr_month+1;

  curr_date = curr_date.toString();
  curr_month = curr_month.toString();
  curr_year = curr_year.toString();

  const final_date = curr_date + "/" + curr_month + "/" + curr_year;

  await db.query("Insert Into comments(title,msg,user_name,comment_date,topic1,topic2,topic3) Values ($1,$2,$3,$4,$5,$6,$7) returning *",[title,msg,user_name,final_date,topic1,topic2,topic3]);
  res.redirect("/comunity");
})
let flag = false;
app.post('/submit-career', async (req, res) => {
  const arr = req.body.careerScores; // Extract suitedCareerIndex
  console.log(arr);
  //console.log(email);
  //console.log(req.user.email);
  const indexedArray = arr.map((value, index) => ({ value, index }));

  // Sort the array in descending order based on value
  indexedArray.sort((a, b) => b.value - a.value);

  // Get the top 3 elements
  const maxThree = indexedArray.slice(0, 3);

  console.log(maxThree);
  const career1_index = maxThree[0].index;
  const career2_index = maxThree[1].index;
  const career3_index = maxThree[2].index;
  var career1_percent = maxThree[0].value;
  var career2_percent = maxThree[1].value;
  var career3_percent = maxThree[2].value;

  career1_percent = Math.floor((career1_percent/7)*100);
  career2_percent = Math.floor((career2_percent/7)*100);
  career3_percent = Math.floor((career3_percent/7)*100);

  await db.query("Update userinfo set career1_index = $1,career1_percent = $2,career2_index = $3,career2_percent = $4,career3_index = $5,career3_percent = $6",[career1_index,career1_percent,career2_index,career2_percent,career3_index,career3_percent]);
  flag = true;
});

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

app.post("/register",upload.single("profileImage"), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const naam = req.body.username;
  let pro = null;
  try{
    const str = req.file.path;
    pro = str.replace("public\\", "");
  }
  catch(err){
    console.log(err)
  }

  console.log(pro);
  try {
    const checkResult = await db.query("SELECT * FROM userinfo WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.redirect("/login");
    } else {
      const result = await db.query(
              "Insert Into userinfo(email,password,name,profile) Values ($1,$2,$3,$4) returning *",[email,password,naam,pro]
            );
            name = result.rows[0].name;
            id = result.rows[0].uid;
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
      id = result.rows[0].uid;
      //console.log(`name = ${name}`);
      // loginuser = result.rows[0].email;
      if (result.rows.length > 0) {
        user = result.rows[0];
        console.log(`inside login`);
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