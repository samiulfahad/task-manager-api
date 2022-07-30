const nodemailer = require('nodemailer')
const sendMail = async (email, name, subject, msg) => {
let transporter = nodemailer.createTransport({
     service: 'Zoho',
     auth: {
         user: 'samiul_fahad@crackplaton.com',
         pass: process.env.NodeMailerPassword
     }
});
const message = {
  from: {
    name: 'Task Manager API',
    address: 'samiul_fahad@crackplaton.com'
  },
  to: email,
  subject: subject,
  // text: `Dear ${name}, We hope you are well`
  html: `<h2>Dear ${name}, <br> ${msg}</h2>`
  };
  try{
        const mail = await transporter.sendMail(message)
    } catch(e) {
        console.log(e)
    }
}
module.exports = sendMail;