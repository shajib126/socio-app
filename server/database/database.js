const mongoose = require('mongoose')


const database = ()=>{
    mongoose.connect(process.env.DB_URL_LOCAL).then((con)=>{
        console.log(`DB connected ${con.connection.host}`)
    })
}


module.exports = database