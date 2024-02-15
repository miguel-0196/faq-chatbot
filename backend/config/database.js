import mongoose from "mongoose"

const mdb = mongoose.connect("mongodb://127.0.0.1:27017/faq-chat")
    .then(() => {
        console.log("mongodb is connected")
    })
    .catch((error) => {
        console.log(error)
    })

export default mdb