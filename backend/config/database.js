import mongoose from "mongoose";

const mongodbDatabase = mongoose.connect("mongodb://127.0.0.1:27017/chat-widgetDb")
.then(()=>{
    console.log("DataBase is Connected ")
})

.catch((error)=>{
    console.log(error)
})

export default mongodbDatabase