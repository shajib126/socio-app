const database = require('./database/database')
const app = require('./index')
const cloudinary = require('cloudinary')


cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})
//db connect
database()
const port = process.env.PORT
app.listen(port,()=>console.log(`server running in ${port}`))