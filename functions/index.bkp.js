const functions = require('firebase-functions');
const express=require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app=express();

// to allow cross origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(bodyParser.urlencoded({
    extended: true
  }));
// app.use(multer({ dest: '/tmp/'}));
app.use(cookieParser());


app.get('/api',(request,response)=>{
    response.send({
        status:"ok",
        message:"The app is working properly"
    })
});


app.post('/send',(req,res)=>{


    console.log("Received a POST request on the /send endpoint")
    // res.end(JSON.stringify(req.body))
    var to_mail = req.body.to;
    var s_email = req.body.email;
    var s_name = req.body.name;
    var s_message = req.body.message;

    var s_subject="ToMail Notification";

    if(req.body.subject || req.body.subject!=''){
        s_subject="ToMail Notification";
    }
  
    let app_email;
    let app_password;


    // geting the config file
  fs.readFile(__dirname + "/config.json", 'utf8', function (err, data) {
    var config = JSON.parse(data);
    app_email = config['email'];
    app_password=config['password'];


    var transporter = nodemailer.createTransport({
      host:'smtp.yandex.com',
      port:465,
      secure:true,
      auth: {
        type:'login',
        user: app_email,
        pass:app_password
      }
    });

    var mailOptions = {
      from:`ToMail <${app_email}>`,
      to:`Ohidur <${to_mail}>`,
      replyTo:s_email,
      subject: s_subject,
      text:`
      Messsage:${s_message} from ${s_name} Reply to ${s_email}`,
      html: `
        <h2>
        ToMail Notification
        </h2>
        <div>
        <span><b>From:</b> ${s_name} </span><br>
        <span><b>Reply-to:</b> ${s_email} </span><br>
        <spn><b>Subject:</b> ${s_subject} </span><br>
        <span><b><u>Message</u></b></span><br>
        <pre>
        ${s_message}
        </pre>
        </div>
        <br>
        <br>
        <span>Mailed by: <a href="https://to-mail.web.app">ToMail</a></span>
        <span style="color:red;">Thank you</span>`
    }



    // now send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error.message)
        res.send({
          status: 'error',
          msg: 'Email sending failed'
        })
      } else {
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.send({
          status: 'ok',
          msg: 'Email sent'
        })
      }

      transporter.close();

    });

  });

})

exports.app = functions.https.onRequest(app);
