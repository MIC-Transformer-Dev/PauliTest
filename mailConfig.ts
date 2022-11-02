
import * as nodemailer from 'nodemailer';

// let title = "Just A html-pdf-node Test"
// let file = { content: `<h1>${title}</h1>` };
// let options = { format: 'Letter' };
export default function mailer() {
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'mictransformer.dev@gmail.com',
    pass: 'ylmgjjwcnvdxhvmo'
  }
});

transporter.sendMail({
  to:"anthonygunardi@gmail.com",
  from:"mictransformer.dev@gmail.com",
  subject:"Nodemailer Test",
  html:"<h1>Just A Test</h1>",
})
console.log('mail is sent')
}




