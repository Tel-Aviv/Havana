import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';

import { HashRouter } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import heIL from 'antd/es/locale/he_IL';

import { Provider } from 'react-redux'

import moment from 'moment';
import 'moment/locale/he';

import store from './redux/store';
import App from './App'
import App2 from './App2'

moment.locale('he');

ReactDOM.render(<Provider store={store}>
                    <HashRouter>
                        <ConfigProvider direction='rtl' 
                              locale={heIL}>
                             <App />
                             </ConfigProvider>    
                    </HashRouter>
                </Provider>,
                document.getElementById('root'));
