import renderer from 'react-test-renderer';
import axios from 'axios';

test('get monthly report', async() => {
    const month = 12;
    const year = 2019;
    const url = `http://localhost:5000/me/reports?month=${month}&year=${year}`;
    
    try {
        const resp = await axios(url, {
            withCredentials: true
        }); 
    } catch(err) {
        console.error(err.message);
    }

})
