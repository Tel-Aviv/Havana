# Havana
Online Presence System Client

## How to run
This project requires the backend server (usually installed at IIS for Kerberos with NTLM authentication). 
Its address should be known to React, so update ./src/ssr/index.js file with the appropriate address.
In two distinct termnals run 
1. yarn build This script will produce bundle.js with entire React app.
2. yarn start This script will run SSR that populate index.html template and return it to browser
Note that the second script will run the app at virtual directory 'hr'. The actual link for browse is shows in terminal and looks like http://iMac.local:3000/hr. In order to serve the approriate static files from the returned index.html, it is based on '/hr/
``` html
<base href = "/hr/" />
```

