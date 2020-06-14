// @flow
import React, { useState, useEffect } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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

import NotificationBadge, {Effect} from 'react-notification-badge';
import { Avatar, Tooltip } from 'antd';

// import "antd/dist/antd.css";
import 'antd-rtl/es/tabs/style/index.css'

import ConfirmList from './ConfirmList';
import Confirm from './Confirm';
import Home from './Home';
import ReportPDF from './ReportPDF';
import Settings from './Settings';

import { DataContext } from "./DataContext";
import { getUserFromHtml, getHost } from './utils';
import translations from './translations';

import { SET_NOTIFICATIONS_COUNT } from './redux/actionTypes';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: "he",
    debug: false
  })

const App = () => {

    const history = useHistory();

    const [month, setMonth] = useState(moment().month());
    const [year, setYear] = useState(moment().year());
    const [displayNotifications, setDisplayNotificatios] = useState(false);
    const [notificationsCount, setNotificationsCount] = useState(0);

    const context = {
        user : getUserFromHtml(),
        host : getHost()
    }

    const dispatch = useDispatch();

    const { t } = useTranslation();

    useEffect( () => {
        async function fetchData() {
            let res = await axios(`http://${context.host}/me/is_manager/`, {
                withCredentials: true
            });
            const isManager = res.data;
            const display = isManager ? 'block' : 'none';
            setDisplayNotificatios(display)

            if( isManager ) {
                res = await axios(`http://${context.host}/me/pendings/count`,{
                    withCredentials: true
                })
                dispatch(action_setNotificationCount(res.data));
            }
        }
        fetchData();
    }, [displayNotifications])

    const _notificationsCount = useSelector(
        store => store.notificationsCountReducer.notificationsCount
    )

    useEffect(() => {
        if( _notificationsCount ) {
            setNotificationsCount(_notificationsCount);
        }
    }, [_notificationsCount])

    const onMonthChange = (date, dateString) => {
        if( date ) {
            const month = date.month()
            setMonth(month)

            const year = date.year()
            setYear(year)
        }
    }

    const action_setNotificationCount = (count: number) => ({
        type: SET_NOTIFICATIONS_COUNT,
        data: count
    })

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
                <title>{t('product_name')}</title>
                <meta name="description" content={t('product_name')} />
                <style>{'body { background-color: rgb(240, 242, 245) !important; }'}</style>
            </Helmet> 
            <Layout layout='topmenu' 
                    locale='he-IL'> 
                <Layout.Header className='ant-layout-header rtl'>                
                    <Menu mode="horizontal" className='ant-menu top-nav-menu ant-menu-blue' style={{
                        padding: '0 3%'
                    }}>  
                        <Menu.Item key='settings' style={{
                                top: '6px'
                            }}>
                                <Tooltip title={t('settings')}>
                                    <div onClick={goSettings}>
                                        <Avatar size="large" src={`data:image/jpeg;base64,${context.user.imageData}`}
                                            style={{
                                                marginRight: '0'
                                            }}
                                            onError={ () => true} />
                                        <span style={{
                                            padding: '0 12px'
                                        }}>{context.user.name}</span>        
                                    </div>
                                </Tooltip>
                        </Menu.Item>
                        <Menu.Item key='home' style={{
                            float: 'left',
                            marginTop: '8px'
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
                        <Menu.Item key='notifications' style={{
                                marginTop: '8px',
                                float: 'left',
                                display: displayNotifications
                            }}>
                                <div>
                                    <NotificationBadge count={parseInt(notificationsCount)} effect={Effect.SCALE}>
                                    </NotificationBadge>                                
                                </div>
                                <Tooltip title={t('notifications')}>
                                    <Icon type="bell" theme="outlined" onClick={onApprovalClicked} 
                                        style={{
                                            fontSize: '24px'
                                        }}/>
                                </Tooltip>
                        </Menu.Item> 
                    </Menu>   
                </Layout.Header>
            <Layout style={{ 
                    padding: '17px 24px 24px 24px'
                }}>
                <DataContext.Provider value={context}>
                    <Switch>
                        <Route exact path='/'
                                render={ (props) => 
                                    <Home />
                                }/>
                        <Route path='/confirmlist' component={ConfirmList} />
                        <Route path='/confirm/:userid/:saveReportId' component={Confirm}/>
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
