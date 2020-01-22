import React from 'react';
import ReactDOM from 'react-dom';

import { HashRouter } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import heIL from 'antd/es/locale/he_IL';

import { Provider } from 'react-redux'

import moment from 'moment';
import 'moment/locale/he';
moment.locale('he');

import store from './redux/store';
import App from './App'

ReactDOM.render(<ConfigProvider locale={heIL}>
                  <Provider store={store}>
                        <HashRouter>
                             <App />
                        </HashRouter>
                   </Provider>     
                </ConfigProvider>,
                document.getElementById('root'));
