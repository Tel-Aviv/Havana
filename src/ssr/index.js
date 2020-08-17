const moment = require('moment');

const argv = require('minimist')(process.argv.slice(2));
let PORT = parseInt(argv['port'])
if( isNaN(PORT) )
    PORT = 3000;

require('dotenv').config({ path: './src/ssr/.env' });
const fs = require('fs'),
    express = require('express'),
    ntlm = require('express-ntlm'),
    cors = require('cors'),
    ActiveDirectory = require('activedirectory');


function customEntryParser(entry, raw, callback){
    if (raw.hasOwnProperty("thumbnailPhoto")){
        entry.thumbnailPhoto = Buffer.from(raw.thumbnailPhoto).toString('base64');
    }
    callback(entry);
};

const AD_config = { url: 'ldap://domdc1.tlv.gov.il',
                    baseDN: 'DC=tlv,DC=gov,DC=il',
                    username: process.env.AD_USER,
                    password: process.env.AD_PASS,
                    entryParser : customEntryParser,
                    attributes : {
                        user: ["cn", "thumbnailPhoto"]
                    }
}
const ad = new ActiveDirectory(AD_config);

var app = express();
app.use(ntlm());

const template = fs.readFileSync('./templates/index.html', "utf8")

app.get('/hr', function(request, response, next) {

        console.log(`Looking for ${request.ntlm.UserName}`);
        const userNameToFind =  request.ntlm.UserName.toUpperCase();
        return ad.findUser( `${userNameToFind}` , function(err, user) {
            let rsp;
            if (err) {
                console.error('ERROR: ' + JSON.stringify(err));
                // return  next(err)
            }
            
            if (!user){ 
                console.log(`User ${request.ntlm.UserName} not found in AD`);

                rsp = template.replace('{USER_NAME}', request.ntlm.UserName)
                        .replace('{USER_THUMBNAIL}', null)
                        .replace('{USER_ACCOUNT_NAME}', request.ntlm.UserName)
                        .replace('{HOST}', process.env.HOST)
                        .replace('{PROTOCOL}', 'http')

            } else {
                const now =  moment()
                console.log(`${now.format('DD-MM-YYYY HH:mm')} Serving user ${request.ntlm.UserName} (${user.cn})`);

                //TODO this operation take to match time
                rsp = template.replace('{USER_NAME}', user.cn)
                        .replace('{USER_THUMBNAIL}', user.thumbnailPhoto)
                        .replace('{USER_ACCOUNT_NAME}', request.ntlm.UserName)
                        .replace('{HOST}', process.env.HOST)
            }   
            response.end(rsp)
    });
})

app.use(express.static('dist'))

app.listen(PORT, () => console.log(`HR app listening at port ${PORT}`))
 
    

