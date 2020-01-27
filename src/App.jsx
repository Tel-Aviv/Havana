// @flow
import React, { useState, useEffect } from 'react';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import i18n from 'i18next';
import { useTranslation, initReactI18next } from "react-i18next";
import { Helmet } from 'react-helmet';

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { version } from 'antd';

import { Typography } from 'antd';
const { Title } = Typography;

import { Row, Col } from 'antd';

import { Avatar, Badge } from 'antd';
import "antd/dist/antd.css";

import { Tooltip } from 'antd';

import { blue } from '@ant-design/colors';

import ConfirmList from './ConfirmList';
import Confirm from './Confirm';
import Home from './Home';
import ReportPDF from './ReportPDF';
import Settings from './Settings';

import { DataContext } from "./DataContext";
import { getUserFromHtml, getHost } from './utils';
import translations from './translations';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: true
  })

const App = () => {

    const history = useHistory();

    const [month, setMonth] = useState(moment().month());
    const [year, setYear] = useState(moment().year());
    const [isManager, setIsManager] = useState(false);
    const [pendingsCount, setPendingsCount] = useState()
    const context = {
        user : getUserFromHtml(),
        host : getHost()
    }

    const { t } = useTranslation();

    useEffect( () => {
        async function fetchData() {
            let res = await axios(`http://${context.host}/api/users/${context.user.id}`, {
                withCredentials: true
            });
            const isManager = res.data.isManager;
            setIsManager(isManager)

            if( isManager ) {
                res = await axios(`http://${context.host}/me/pendings/count`,{
                    withCredentials: true
                })
                setPendingsCount(res.data.count);
            }
        }
        fetchData();
    }, [isManager])

    const onMonthChange = (date, dateString) => {
        if( date ) {
            const month = date.month()
            setMonth(month)

            const year = date.year()
            setYear(year)
        }
    }

    const onApprovalClicked = () => {
        history.push(`/confirmlist`);
    }

    const goSettings = () => {
        history.push(`/settings`);
    }

    const goHome = () => {
        history.push('/');
    }

    return (
        <>
        <Helmet>
            <title>{t('title')}</title>
            <meta name="description" content={t('title')} />
        </Helmet>        
        <Layout> 
            <Layout.Header className='rtl' style={{
                backgroundColor: 'white',
                padding: '0',
                height: '60px',
                boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 8px 0px'
            }}>                
                <Menu mode="horizontal" style={{
                    padding: '0 5%'
                }}>  
                    <Menu.Item style={{
                            top: '12px'
                        }}>
                            <Tooltip title={t('settings')}>
                                <div onClick={goSettings}>
                                    <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                                    <span>{context.user.name}</span>
                                </div>
                            </Tooltip>
                    </Menu.Item>
                    <Menu.Item key="setting" style={{
                        float: 'left',
                        marginTop: '12px'
                        }}>
                        <Tooltip title={t('home')}>
                            <Icon type="home" 
                                theme="outlined"
                                style={{
                                    fontSize: '24px'
                                }} 
                                onClick={goHome}
                            />
                        </Tooltip>      
                    </Menu.Item>                    
                    <Menu.Item style={{
                            marginTop: '12px',
                            float: 'left'
                        }}>
                            <Badge count='25' onClick={onApprovalClicked}>
                                <Tooltip title={t('notifications')}>
                                    <Icon type="bell" theme="outlined" 
                                        style={{
                                            fontSize: '24px'
                                        }}/>
                                </Tooltip>
                            </Badge>    
                    </Menu.Item> 
                </Menu>                      
            </Layout.Header>
            <Layout style={{ padding: '24px' }}>
                <DataContext.Provider value={context}>
                    <Switch>
                        <Route exact path='/'
                                render={ (props) => 
                                    <Home />
                                }/>
                        <Route path='/confirmlist' component={ConfirmList} />
                        <Route path='/confirm/:userid'
                                render={ () => 
                                    <Confirm month={month} year={year} />
                                } />
                        <Route path='/pdf' 
                                render={ (props) => 
                                    <ReportPDF tableData={props} />
                                } />
                        <Route path='/settings'
                                component={Settings} />
                    </Switch>
                </DataContext.Provider>
            </Layout>
        </Layout> 
    </>
    )
}

export default App;