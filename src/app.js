require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require('hbs');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
var cookieParser = require('cookie-parser');
require("./db/conn");
const Registration = require("./model/registration");
const auth = require("./middleware/auth");


const port = process.env.PORT || 5000
const staticPath = path.join(__dirname,"../public");
const templatesPath = path.join(__dirname,"../templates/views");
const partailPath =  path.join(__dirname,"../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));

hbs.registerPartials(partailPath);
//view engine setup
app.use(express.static(staticPath));
app.set('view engine', 'hbs');
app.set('views',templatesPath);

app.get("/",(req,res)=>{
    res.render("index")
});

app.get("/sdetail",auth,(req,res)=>{
    res.render("sdetail")
});

app.get("/logout", auth, async(req,res)=>{
    try {
        //to delete particular token from database and cookie
        //Below code for specific token need to delete from specific device not all device 
        //if user login to multiple device
        req.user.tokens = req.user.tokens.filter((currentElememt)=>{
            return currentElememt.token !== req.token
        })

        //logout for multiple device
        //req.user.tokens=[];

        //To clear cookie
        res.clearCookie("jwt");
        await req.user.save();
        res.render("login");
        console.log("Logout Successfully");
    } catch (error) {
       res.status(500).send(error); 
    }
});

app.get("/registration", (req,res)=>{
    res.render("registration");
})

app.get("/login", (req,res)=>{
    res.render("login");
})

app.post("/registration", async(req,res)=>{
    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;
        if(password  === cpassword){
            const registerStudent = new Registration({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                mothername: req.body.mothername,
                fathername: req.body.fathername,
                addess: req.body.addess,
                gender: req.body.gender,
                dob: req.body.dob,
                phone: req.body.phone,
                pincode: req.body.pincode,
                course: req.body.course,
                email: req.body.email,
                password: req.body.password,
                cpassword: req.body.cpassword
            })

            const token = await registerStudent.generateAuthToken();
            //setting token into cookie
            res.cookie("jwt", token, {
                expires: new Date(Date.now()+30000),
                httpOnly:true
            });
            await registerStudent.save();
            res.status(201).render("index")
        }else{
            res.send("Password are not matching");
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

app.post("/login", async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userDetails = await Registration.findOne({email:email})
        //To match encrypted password
        const isPasswordMatch = await bcrypt.compare(password,userDetails.password);

        const token = await userDetails.generateAuthToken();

        res.cookie("jwt", token, {
            expires: new Date(Date.now()+300000),
            httpOnly:true
            //secure:true
        });

        if(isPasswordMatch){
            res.status(201).render("sdetail")
        }else{
            res.send("Invalid username and password!")
        }        
    } catch (error) {
       res.status(400).send("Invalid username and password!") 
    }
    
})

app.get("*", (req,res)=>{
    res.render("404_error",{
        errorMsg : 'Oops! Page Not Found'
    });
})

// const securePassword = async(password)=>{
//    const passwordHash =  await bcrypt.hash(password,10);
//    console.log(passwordHash)
//    const passwordMatch = await bcrypt.compare("aniket",passwordHash);
//    console.log(passwordMatch)
// }

// securePassword("anieket");

//CreateToken Code 
// const createToken = async()=>{
//     const token = await jwt.sign({_id:"651cfecf0bcece7fda8720af"},"hsjhdhuihuiduinvdsnyuydyufyugyugyyhjj",{expiresIn:"2 seconds"});
//     const verifyToken = await jwt.verify(token,"hsjhdhuihuiduinvdsnyuydyufyugyugyyhjj");
//     console.log(verifyToken)
// }

//createToken();

app.listen(port,()=>{
    console.log(`Server is running on the port : ${port}`);
});