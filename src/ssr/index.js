require('dotenv').config({ path: './src/ssr/.env' });
const fs = require('fs'),
    express = require('express'),
    ntlm = require('express-ntlm'),
    cors = require('cors'),
    ActiveDirectory = require('activedirectory');


const AD_config = { url: 'ldap://domdc1.tlv.gov.il',
                baseDN: 'DC=tlv,DC=gov,DC=il',
                username: process.env.AD_USER,
                password: process.env.AD_PASS }
const ad = new ActiveDirectory(AD_config);

var app = express();
app.use(ntlm());

const template = fs.readFileSync('./templates/index.html', "utf8")

app.get('/', function(request, response, next) {
    return ad.findUser( `${request.ntlm.UserName}@tlv.gov.il` , function(err, user) {
        let rsp;
        if (err) {
            console.error('ERROR: ' +JSON.stringify(err));
            // return  next(err)

            user = {
                cn : 'אולג קליימן'
            };
            request.ntlm.UserName = 'c1306948';
        }
        
        if (!user){ 
            console.log('User: ' + request.ntlm.UserName + ' not found.');
            rsp = 'User: ' + request.ntlm.UserName + ' not found.';
        } else {
            //TODO this operation take to match time
             rsp = template.replace('{USER_NAME}', user.cn)
                    .replace('{USER_ID}', request.ntlm.UserName)
                    .replace('{HOST}', process.env.HOST)
        }   
        response.end(rsp)
    });
})

app.use(express.static("./dist"))


app.listen(8080);    
    

