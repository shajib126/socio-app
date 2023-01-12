const naodeMailer = require('nodemailer')

 exports.sendEmail = async(options)=>{
    const transporter = naodeMailer.createTransport({
        host: "smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "425b464848f0fc",
          pass: "0214f8a548c76b"
        },
    })
    const mailOptions = {
        from:process.env.SMPT_MAIL,
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    await transporter.sendMail(mailOptions)
}