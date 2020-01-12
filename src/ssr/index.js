var express = require('express'),
    ntlm = require('express-ntlm'),
    cors = require('cors');

var fs = require('fs')

var app = express();
// app.use(cors({credentials:true, origin: 'http://localhost:8887',}))
app.use(ntlm());
app.use(express.static("./dist"))
fs.readFile('./dist/index.html', "utf8", (err, file) => {

    app.all('*', function(request, response) {

        if (err) {
            console.error(err);
            response.end(err.toString());
            return
        }

        file = file.replace('{USER_NAME}', request.ntlm.UserName);   
        response.end(file)
        
    });

    app.listen(8080);    
})
    

