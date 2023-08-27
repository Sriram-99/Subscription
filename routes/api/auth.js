const express=require("express");
const router=express.Router();
const bcrypt =require('bcryptjs')
const auth=require('../../middleware/auth')
const User=require('../../models/User')
const jwt=require("jsonwebtoken");
const config=require("config");
const { check, validationResult } = require('express-validator');

// if token is autherized then we send the user details
// protected the route with middleware
router.get('/getid',auth,async(req,res)=>{
  res.status(200).json({id:req.user.id});
})
router.get('/',auth,async(req,res)=>{
   try{
        // we dont want password so we - password
        const user=await User.findById(req.user.id).select('-password');
        res.json(user);
   }
   catch{
        console.error(err.message);
        res.status(500).send('server Error');
   }
});

// for user login
// post api/auth  authenticate-user get token
router.post('/', [
  
    check('email', "Please include a valid email").isEmail(),
    check('password', 'Please enter a password with 6 or more characters').exists()
  ], async (req, res) => {
    const errors = validationResult(req);
    //
    const {  email1, password1 } = req.body;
    console.log(email1);
    console.log(password1);
    //
    if (!errors.isEmpty()) {
      return res.status(400).json({ "error": errors.array() });
    }
  
    const {  email, password } = req.body;
  
    try {
      // Check if user exists
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ 'errors': [{ msg: "Invalid Credentials" }] });
      }
      
      const isMatch=await bcrypt.compare(password,user.password);
      if(!isMatch){
        return res.status(400).json({ 'errors': [{ msg: "Invalid Credentials" }] });
      }

      
      // Return jsonwebtoken
        const payload={
            user:{
                id:user.id
            }
        }
        jwt.sign(payload,config.get("jwtSecret"),
        {expiresIn:360000},(err,token)=>{
            if(err) throw err;
            res.json({token});
        });
     

    } catch (err) {
      console.log(err);
      return  res.status(500).json({ "error": "Server error" });
    }
  });

module.exports=router;