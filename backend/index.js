import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import geminiResponse from './gemini.js';
dotenv.config();
const PORT=process.env.PORT||5000;  

const app=express();
app.use(cors({
   origin:"https://virtualassistant-frontend-jziq.onrender.com",
   credentials:true, 
}));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())

app.use('/api/auth',authRouter);
app.use('/api/user',userRouter);
// app.get("/ping", (req, res) => {
//   res.status(200).send("Server is alive!");
// });


app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});

