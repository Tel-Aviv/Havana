var express = require('express'),
    ntlm = require('express-ntlm'),
    cors = require('cors');

var fs = require('fs')

var app = express();
// app.use(cors({credentials:true, origin: 'http://localhost:8887',}))
app.use(ntlm());

const template = fs.readFileSync('./templates/index.html', "utf8")

app.get('/', function(request, response) {

    file = 
        template.replace('{USER_NAME}', request.ntlm.UserName)
                .replace('{USER_ID}', 'c1306948')
                .replace('{HOST}', 'localhost/ps')  

    response.end(file)

})

app.use(express.static("./dist"))


app.listen(8080);    
    

