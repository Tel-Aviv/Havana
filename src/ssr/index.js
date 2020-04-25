require('dotenv').config({ path: './src/ssr/.env' });
const fs = require('fs'),
    os = require("os"),
    crypto = require("crypto"),
    express = require('express'),
    ntlm = require('express-ntlm'),
    cors = require('cors'),
    ActiveDirectory = require('activedirectory');

const PORT = 3000;
const VPATH = '/hr';


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

app.get(VPATH, function(request, response, next) {

        // Create a completely random secret
        const sharedSecret = crypto.randomBytes(16); // 128-bits === 16-bytes,  
        const textSecret = sharedSecret.toString('base64');
        console.log(`Shared secret: ${textSecret}`)

        const initializationVector = crypto.randomBytes(16); // IV is always 16-bytes
        const cipher = crypto.Cipheriv('aes-128-cbc', sharedSecret, initializationVector);
        const plaintext = "Everything's gonna be 200 OK!";
        let encrypted = cipher.update(plaintext, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        console.log(`Encrypted: ${encrypted}`)

        return ad.findUser( `${request.ntlm.UserName}@tlv.gov.il` , function(err, user) {
            let rsp;
            if (err) {
                console.error('ERROR: ' + JSON.stringify(err));
                // return  next(err)
            }
            
            if (!user){ 
                console.log('User: ' + request.ntlm.UserName + ' not found in AD');

                rsp = template.replace('{USER_NAME}', request.ntlm.UserName)
                        .replace('{USER_THUMBNAIL}', null)
                        .replace('{USER_ID}', request.ntlm.UserName)
                        .replace('{HOST}', process.env.HOST)

            } else {
                //TODO this operation take to match time
                rsp = template.replace('{USER_NAME}', user.cn)
                        .replace('{USER_THUMBNAIL}', user.thumbnailPhoto)
                        .replace('{USER_ID}', request.ntlm.UserName)
                        .replace('{HOST}', process.env.HOST)
            }   
            response.end(rsp)
        });
})

app.use(VPATH, // mount path
        express.static("./dist"))

app.listen(PORT,
    () => console.log(`Listening at http://${os.hostname()}:${PORT}${VPATH}`));    
    

