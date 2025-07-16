import getToken from "../config/token.js";
import User from "../model/user.model.js";
import bcrypt from "bcryptjs";

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existEmail = await User.findOne({ email });
        if (existEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        
        const token=await getToken(user._id);
        res.cookie("token",token,{
            httpOnly:true,
            maxAge:10*24*60*60*1000,
            sameSite:"None",
            secure:true
        })
        return res.status(201).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
        
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email does not exist" });
        }
       const isMatched=await bcrypt.compare(password,user.password)
       if(!isMatched){
        return res.status(400).json({ message: "Invalid credentials" });

       }
       
       const token=await getToken(user._id);
       res.cookie("token",token,{
           httpOnly:true,
           maxAge:10*24*60*60*1000,
           sameSite:"None",
           secure:true
        })
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Login error ${error}` });
        
    }
}

export const logout=async (req,res)=>{
    try {
        res.clearCookie("token");
        return res.status(200).json({message:"Logout successful"});
    } catch (error) {
        return res.status(500).json({message:`Logout error ${error}`})
    }
}
