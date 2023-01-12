const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()

if(process.env.NODE_ENV !== "production"){
    dotenv.config()
}
//middleware
const corsOption = {
    origin: ['http://localhost:3000'],
}
app.use(cors(corsOption))
app.use(express.json({limit:'50mb'}))
app.use(express.urlencoded({limit:"50mb",extended:true}))
app.use(cookieParser())
const postRoutes = require('./routes/Post')
const userRoutes = require('./routes/User')

app.use('/api/v1',postRoutes)
app.use('/api/v1',userRoutes)

module.exports = app