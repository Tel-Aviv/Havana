// @flow
import React, { useState, useEffect } from 'react';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { Typography } from 'antd';
const { Title } = Typography;

import { Row, Col } from 'antd';

import { Badge } from 'antd';
import "antd/dist/antd.css";

import { blue } from '@ant-design/colors';

import { DatePicker } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

import ConfirmList from './ConfirmList';
import Confirm from './Confirm';
import MonthlyReport from './MonthlyReport';

import { DataContext } from "./DataContext";
import { getUserFromHtml, getHost } from './utils';

const App = (props) => {

    const history = useHistory();

    const [month, setMonth] = useState(moment().month());
    const [year, setYear] = useState(moment().year());
    const [isManager, setIsManager] = useState(false);
    const [pendingsCount, setPendingsCount] = useState()
    const context = {
        user : getUserFromHtml(),
        host : getHost()
    }


    useEffect( () => {
        async function fetchData() {
            let res = await axios(`http://${context.host}/api/v1/user/${context.user.id}`);
            const isManager = res.data.isManager;
            setIsManager(isManager)

            res = await axios(`http://${context.host}/api/v1/pendings/count`)
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

    return (
        <>
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="header">
                <Row>
                    <Col span={4}><MonthPicker onChange={onMonthChange}/></Col>
                    <Col span={4}>
                        <Badge count={pendingsCount} onClick={onApprovalClicked} hidden={!isManager}>
                            <Icon type="setting" theme="outlined" 
                                    style={{ fontSize: '28px', color: 'wheat' }}
                                 />
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
                    </Switch>
                </DataContext.Provider>
            </Layout>
         </Layout>
        </> 
    )
}

export default App;