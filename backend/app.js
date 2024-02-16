import express from "express"
import bodyParser from "body-parser"
import cors from "cors"

import mdb from "./config/database.js"
import router from "./routes/uploadRoutes.js"
import genrateRoute from "./routes/genrateFaqRoutes.js"


const app = express()

app.use(bodyParser.json())
app.use(cors())

app.use('/api', router)
app.use('/api', genrateRoute)

const port = 8001
app.listen(port, () => {
    console.log("Running server on port:", port)
})