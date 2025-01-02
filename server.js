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
import e from "express";
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

const db = new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "CareerCompass",
  password : "Mayur@2005",
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
  res.send("not ready");
});

app.get("/comunity",(req,res)=>{
  res.send("not ready");
});

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

// app.post("/login",async (req,res)=>{
//   if(flag === true){
//     res.redirect("/assesment");
//   }
//     name = req.body["username"];
//     password = req.body["password"];
  
//     const result = await db.query("Select password from userinfo where email = $1",[name]);
  
//     if(result.rows.length > 0)
//     {
//       const user = result.rows[0];
//       const dbpass = user.password;
  
//       if(dbpass === password)
//       {
//           flag = true;
//           res.redirect("/assesment");
//       }
//       else{
//         res.send("<h1>Incorrect Password</h1>");
//       }
//     }
//     else
//     {
//       res.send("<h1>Seller not Found</h1>");
//     }
//   });

// app.get("/homepage-customer", async (req,res) => {
//   const pro = await db.query("Select * From product");
//   if(pro.rows <= 0)
//   {
//     console.log("Error : ",err.stack);
//   }
//   else
//   {
//     products = pro.rows;
//   }

//   res.render("home-customer.ejs",
//     {
//         products: products
//     }
//   )
// })

// app.get("/homepage-seller",async (req,res)=>{

//   const id = await db.query("Select id from seller where name = $1",[name]);
//   const pro = await db.query("Select * From product Where sid = $1",[id.rows[0].id]);
//   if(pro.rows <= 0)
//   {
//     products = [];
//   }
//   else
//   {
//     products = pro.rows;
//   }

//   res.render("home-seller.ejs",
//     {
//         products: products
//     }
//   )
// })

// app.post("/login-customer",async (req,res)=>{

//   name = req.body["username"];
//   password = req.body["password"];

//   const resul = await db.query("Select password from customer where name = $1",[name]);

//   if(resul.rows.length > 0)
//   {
//     const user = resul.rows[0];
//     const dbpass = user.password;

//     if(dbpass === password)
//     {
//       res.redirect("/homepage-customer");
//     }
//     else{
//       res.send("<h1>Incorrect Password</h1>");
//     }
//   }
//   else
//   {
//     res.send("<h1>Customer not Found</h1>");
//   }
// })

// 

// app.post("/register-customer",async (req,res)=>{

//   name = req.body["username"];
//   password = req.body["password"];
//   const age = req.body["age"];
//   const phone_no = req.body["phone_no"];

//   await db.query("Insert Into customer(name,password,age,phone_no) Values ($1,$2,$3,$4)",[name,password,age,phone_no]);
//   res.sendFile(__dirname + "/public/login-customer.html");
// })


// app.get("/add-product",(req,res)=>{
//   res.sendFile(__dirname + "/public/add-product.html");
// })

// app.post("/add-product-redirect",async (req,res) => {

//   const pname = req.body["pname"];
//   const desc = req.body["description"];
//   const price = req.body["price"];

//   const id = await db.query("Select id from seller where name = $1",[name]);

//   await db.query("Insert into product(sid,pname,price,description) values($1,$2,$3,$4)",[id.rows[0].id,pname,price,desc]);

//   res.redirect("/homepage-seller");
  
// })

// app.get("/deleteproduct/:id", async (req, res) => {
  
//   await db.query("Delete from product where id = $1",[req.params.id]);

//   res.redirect("/homepage-seller");

//   });

// app.get("/buyproduct/:id",async (req,res) => {

//   const pro = await db.query("Select * From product Where id = $1",[req.params.id]);
//   if(pro.rows <= 0)
//   {
//     products = [];
//   }
//   else
//   {
//     products = pro.rows;
//   }
//   res.render("buy-product.ejs",
//     {
//         products: products
//     }
//   )
// })

// app.post("/finallybuyproduct/:id",async (req,res)=>{
//   const date = req.body["date"];
//   const mode = req.body["payment-mode"];
//   const pid = req.params.id;

//   const resul = await db.query("Select * from product where id = $1",[pid]);
//   const pname = resul.rows[0].pname;
//   const price = resul.rows[0].price;

//   const id = await db.query("Select id from customer where name = $1",[name]);

//   await db.query("Insert into odetails(pid,cid,payment_mode,odate,pname,price) values($1,$2,$3,$4,$5,$6)",[pid,id.rows[0].id,mode,date,pname,price]);

//   res.redirect("/homepage-customer");
// })

// app.get("/orderdetails",async (req,res)=>{
//   const temp_id = await db.query("Select id from customer where name = $1",[name]);
//   const cid = temp_id.rows[0].id;

//     const resul = await db.query("Select * from odetails where cid = $1",[cid]);
//     if(resul.rows.length > 0)
//     {
//         res.render("order-details.ejs",{
//           products : resul.rows
//         })
//     }
//     else
//     {
//       res.render("order-details.ejs",{
//         products : []
//       })
//     }
// })

// app.get("/deleteodetails/:id",async (req,res)=>{
//   const id = req.params.id;
//   await db.query("Delete from odetails where id = $1",[id]);

//   res.redirect("/orderdetails");

// })


app.listen(port,()=>{
    console.log(`Server Running on Port ${port}`);
})