import express from 'express';
import userRouter from './routes/userRouter.js';
import cors from "cors"
import createTables from './models/init.js';

const app = express();

app.use(express.json());
app.use(cors());

// app.get('/',(req,res)=>{
//     res.send("Hello World")
// })
createTables()
app.use("/",userRouter);

app.listen(3000,()=>{
    console.log("Listening at port 3000");
})