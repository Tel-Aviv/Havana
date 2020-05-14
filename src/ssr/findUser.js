require('dotenv').config({ path: './src/ssr/.env' });
const ActiveDirectory = require('activedirectory');

const AD_config = { url: 'ldap://domdc1.tlv.gov.il',
                    baseDN: 'DC=tlv,DC=gov,DC=il',
                    username: process.env.AD_USER,
                    password: process.env.AD_PASS,
                    attributes : {
                        user: ["cn"]
                    }
}
const ad = new ActiveDirectory(AD_config);

var argv = require('minimist')(process.argv.slice(2));
const userName = argv['u'].toUpperCase();


ad.findUser(`${userName}`, function(err, user) {

    if (err) {
        console.error('ERROR: ' + JSON.stringify(err));
        return
    }

    if( user ) {
        console.log(user.cn)
    } else
        console.log(`User '${userName}' not found in AD`);
})