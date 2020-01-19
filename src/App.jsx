// @flow
import React, { useState, useEffect } from 'react';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import i18n from 'i18next';
import { useTranslation, initReactI18next } from "react-i18next";

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { version } from 'antd';

import { Typography } from 'antd';
const { Title } = Typography;

import { Row, Col } from 'antd';

import { Badge } from 'antd';
import "antd/dist/antd.css";

import { Tooltip } from 'antd';

import { blue } from '@ant-design/colors';

import { DatePicker } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

import ConfirmList from './ConfirmList';
import Confirm from './Confirm';
import MonthlyReport from './MonthlyReport';
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
            let res = await axios(`http://${context.host}/api/v1/user/${context.user.id}`, {
                withCredentials: true
            });
            const isManager = res.data.isManager;
            setIsManager(isManager)

            res = await axios(`http://${context.host}/api/v1/pendings/count`, {
                withCredentials: true
            })
            setPendingsCount(res.data.count);
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

    const disabledDate = (current) => {
        return current && current > moment().endOf('day');
    }

    return (
        <>
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="header">
                <Row>
                    <Col span={4}>
                        <Tooltip title={t('home')}>
                            <Icon type="home" theme="outlined" 
                                style={{ fontSize: '28px', color: 'wheat' }}
                                onClick={goHome}/>
                        </Tooltip>
                        <MonthPicker onChange={onMonthChange}
                                    disabledDate={disabledDate}
                                    defaultValue={moment()} />
                    </Col>
                    <Col span={4}>
                        <Tooltip title={t('settings')}>
                            <Icon type="setting" theme="outlined" 
                                style={{ fontSize: '28px', color: 'wheat' }}
                                onClick={goSettings}/>
                        </Tooltip>    
                        <Badge count={pendingsCount} onClick={onApprovalClicked} hidden={!isManager}>
                            <Tooltip title={t('notifications')}>
                                <Icon type="notification" theme="outlined" 
                                        style={{ fontSize: '28px', color: 'wheat' }}
                                    />
                            </Tooltip>       
                        </Badge>    
                    </Col>
                    <Col span={4} style={{color:'wheat'}}>שלום {context.user.name}</Col>
                </Row>
            </Header>
            <Layout style={{ padding: '0 24px 24px' }}>
                <DataContext.Provider value={context}>
                    <Switch>
                        <Route exact path='/'
                                render={ (props) => 
                                    <MonthlyReport month={month} year={year} />
                                }/>
                        <Route path='/confirmlist' component={ConfirmList} />
                        <Route path='/confirm/:userid' component={Confirm} />
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