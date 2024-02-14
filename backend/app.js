import express  from "express";
import mongodbDatabase from "./config/database.js";
import router from "./routes/uploadRoutes.js";
import genrateRoute from "./routes/genrateFaqRoutes.js";
import bodyParser from "body-parser";
import cors from 'cors'


const app = express();

app.use(bodyParser.json())
app.use(cors())

app.use('/api',router)
app.use('/api',genrateRoute)


app.listen(8000,()=>{
    console.log("server is running on 8000 port")
})