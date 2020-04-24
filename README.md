# Havana
Online Presence System Client

## How to run
This project requires the backend server (usually installed at IIS for Kerberos with NTLM authentication). 
Its address should be known to React, so update ./src/ssr/index.js file with the appropriate address.
In two distinct termnals run 
1. yarn build
2. yarn start
The first script will produce bundle.js with entire React app.
The second script will run SSR that populate index.html template and return it for browser

``` html
<base href = "/hr/" />
```
