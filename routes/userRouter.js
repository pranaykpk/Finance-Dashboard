import express from "express"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import "dotenv/config"
import viewRouter from "./viewRouter.js";
import db from "../models/database.js";
import adminRouter from "./adminRouter.js"
import { userMiddleware } from "../middleware/auth.js";
import analyzeRouter from "./analyzeRouter.js"
import { configDotenv } from "dotenv";
configDotenv()

const router = express.Router();

// User login 
router.post("/login",async (req,res)=>{
    console.log(req.body);
    const {username,password} = req.body;
    const stmt = db.prepare(`SELECT * FROM users where username=?`)

    const user = stmt.get(username)
    const isPasswordMatch = await bcrypt.compare(password,user.password)
    if(!user || !isPasswordMatch){
        return res.status(400).json({
            message:"Invalid credentials"
        })
        
    }
    res.status(200).json({
        token:jwt.sign({
            username:user.username,
            userId:user.userId,
            role:user.role
        },process.env.JWT_SECRET)
    })

})

router.use(userMiddleware)

router.use("/view",viewRouter);

router.use("/analyze",analyzeRouter)

router.use("/admin",adminRouter)


export default router