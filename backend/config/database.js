import mongoose from "mongoose"

const url = "mongodb://127.0.0.1:27017/faq-chat"
const mdb = mongoose.connect(url)
    .then(() => {
        console.log("Connected:", url)
    })
    .catch((error) => {
        console.log(error)
    })

export default mdb