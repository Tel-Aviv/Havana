import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

export function getUserFromHtml() {

    let elem = document.getElementById('USER_NAME');
    const userName = elem.textContent;
    elem = document.getElementById('USER_ACCOUNT_NAME');
    const accountName = elem.textContent;
    elem = document.getElementById('USER_ID');
    const userID = elem.textContent;
    elem = document.getElementById('USER_THUMBNAIL');
    const imageData = elem.textContent;

    return {
        name: userName,
        account_name: accountName,
        userID:  userID,
        imageData: imageData
    }
}

export function getHost() {
    const elem = document.getElementById('HOST');
    return elem.textContent;
}

export function getProtocol() {
    const elem = document.getElementById('PROTOCOL');
    return elem.textContent;
}

export const TextualEmployeKind = {
    "1": `נש"מ`,
    "2": `עובד עיריית ת"א`
}

export const API = axios.create({
        baseURL: `${getProtocol()}://${getHost()}`,
        //responseType: "json"
})

const mock = new MockAdapter(API);

mock.onGet('/me/report_codes')
    .reply(200, {
    "items":[{
            "Code":10,
            "Description":"חופשה מנוחה",
            "ShortDecription":"חופשה",
            "goodFor":2
        },
        {
            "Code":20,
            "Description":"מחלה",
            "ShortDecription":"מחלה",
            "goodFor":2
        },
        {
            "Code":624,
            "Description":"עבודה מהבית",
            "ShortDecription":"ע.מהבית",
            "goodFor":2
        }
    ]        
    })
    
mock.onGet('/me')
    .reply( config => 
        axios.get('/me', config)
    )  

 mock.onGet('/me/is_manager')
    .reply( config =>
        axios.get('/me/is_manager', config)
    )

mock.onGet('/me/pendings/count')
    .reply( config => 
        axios.get('/me/pendings/count', config)
    )

mock.onGet('/me/managers').
    reply( config => 
        axios.get('/me/managers', config)
    )

mock.onGet('/me/signature')
    .reply( config => 
        axios.get('/me/signature', config)
    )

mock.onGet('/me/stamp')
    .reply( config =>
        axios.get('/me/stamp', config)
    )

mock.onGet('/me/direct_manager').
    reply ( config => 
        axios.get('/me/direct_manager', config)
    )

mock.onGet('/daysoff')
    .reply( config => 
        axios.get('/daysoff', config)
    )

mock.onGet('/me/reports/status')
   .reply( config => 
        axios.get('/me/reports/status', config)
    )

mock.onGet('/me/reports/manual_updates')
    .reply( config =>
        axios.get('/me/reports/manual_updates', config)
    )

 mock.onPost('/me/reports/manual_updates')
        .reply( config =>
            axios.post('/me/reports/manual_updates',
                config.data,
                config)
        )

mock.onGet('/me/reports/saved')
    .reply( config =>
        axios.get('/me/reports/saved', config)
    )

mock.onPost('/me/report/save')
    .reply( config => 
        axios.post('/me/report/save', 
                    config.data,
                    config)
    )
