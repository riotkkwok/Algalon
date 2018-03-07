const nodemailer = require('nodemailer'),
    email = require('../config/mail/mail.json');

const transport = nodemailer.createTransport({
    host: email.host,
    port: 465,
    secure: true,
    auth: {
        user: email.user,
        pass: email.pwd
    }
});

function sendMail(subject, content) {
    transport.sendMail({
        from: email.user,
        to: email.mailTo,
        subject: email.title + subject,
        html: content
    }, function(err, info) {
        if (err) {
            return console.error(err);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

module.exports = sendMail;
