const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const nodemailer = require('nodemailer');
const {check,validationResult}=require('express-validator');

const app = express();

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


app.get('/api', (request, response) => {
  response.send({
    status: "ok",
    message: "The app is working properly"
  })
});


// send with mailjet
app.post('/send',[
  check('to_email').exists().isEmail(),
  check('to_name').exists().isAlpha().isLength({min:3}),
  check('email').exists().isEmail(),
  check('name').exists().isAlpha().isLength({min:3}),
  check('message').exists().isLength({min:25}),
  check('subject').exists().isLength({min:5})

], (req, res) => {

  console.log("Received a POST request on the /send endpoint")
  // res.end(JSON.stringify(req.body))


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  var to_email = req.body.to_email;
  var to_name=req.body.to_name;
  var s_email = req.body.email;
  var s_name = req.body.name;
  var s_message = req.body.message;
  var s_subject = req.body.subject;

  s_subject='✉️'+s_subject;

  let mailjet_username;
  let mailjet_password;
  let mailjet_from_email;
  let mailjet_from_name;

  var txtMessage = `Messsage:${s_message} from ${s_name} Reply to ${s_email}`;
  var htmlMessage = `
        <div style="background-color:#c1c1c1;padding:20px">
        <h2 style="padding:8px;background-color:black;color:white;text-align:center;">
        ToMail
        </h2>

        <div style="background-color:#ffffff;">
        <span><b>From:</b> ${s_name} </span><br>
        <span><b>Reply-to:</b> ${s_email} </span><br>
        <spn><b>Subject:</b> ${s_subject} </span><br>
        <span><b><u>Message</u></b></span><br>
        <p>
        ${s_message}
        </p>
        </div>


        <br>
        <br>
        <span>Mailed by: <a href="https://to-mail.web.app">ToMail</a></span></div>`;



  // geting the config file
  fs.readFile(__dirname + "/config.json", 'utf8', function (err, data) {
    var config = JSON.parse(data);
    mailjet_username = config['mailjet_username'];
    mailjet_password = config['mailjet_password'];
    mailjet_from_email = config['mailjet_from_email'];
    mailjet_from_name = config['mailjet_from_name'];

    const mailjet = require('node-mailjet')
    .connect(mailjet_username, mailjet_password);

    const request = mailjet
      .post("send", {
        'version': 'v3.1'
      })
      .request({
        Headers: { 'Reply-To': 'copilot@mailjet.com' },
        "Messages": [{
          "From": {
            "Email": mailjet_from_email,
            "Name": mailjet_from_name
          },
          "To": [{
              "Email": to_email,
              "Name":to_name
            }

          ],
          "Subject": s_subject,
          "TextPart": txtMessage,
          "HTMLPart": htmlMessage,
          "CustomID": "ToMailNotification"
        }]
      })
    request
      .then((result) => {
        console.log(result.body);

        mResponse=result.body;

        if (mResponse.Messages[0].Status == "success") {

          res.send({
            status: 'ok',
            msg: 'Email sent.'
          });

          


        } else {

          res.send({
            status: 'error',
            msg: 'Email could not be sent.'
          })

        }

      })
      .catch((err) => {
        console.log(err.statusCode);

        res.send({
          status: 'error',
          msg: 'Email not sent'
        })

      })

  });

})


exports.app = functions.https.onRequest(app);