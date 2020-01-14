import React from 'react';
import ReactDOM from 'react-dom';

import { HashRouter } from 'react-router-dom';

import { ConfigProvider } from 'antd';
import heIL from 'antd/es/locale/he_IL';

import App from './App'

ReactDOM.render(<ConfigProvider locale={heIL}>
                        <HashRouter>
                                <App />
                        </HashRouter>
                </ConfigProvider>,
                document.getElementById('root'));
