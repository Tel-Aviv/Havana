// @flow
import React, { useState, useEffect } from 'react';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';
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

import Confirm from './Confirm';
import MonthlyReport from './MonthlyReport';

const App = (props) => {

    const history = useHistory();

    const [month, setMonth] = useState(moment().month());
    const [year, setYear] = useState(moment().year());
    const elem = document.getElementById('USER_NAME');
    const userName = elem.textContent;

    const onMonthChange = (date, dateString) => {
        if( date ) {
            const month = date.month()
            setMonth(month)

            const year = date.year()
            setYear(year)
        }
    }

    const onApprovalClicked = () => {
        history.push(`/confirm`);
    }

    return (
        <>
        <Layout style={{ minHeight: '100vh' }}>
            <Header className="header">
                <Row>
                    <Col span={4}><MonthPicker onChange={onMonthChange}/></Col>
                    <Col span={4}>
                        <Badge count={25} onClick={onApprovalClicked}>
                            <Icon type="setting" theme="outlined" 
                                    style={{ fontSize: '28px', color: 'wheat' }}
                                 />
                        </Badge>    
                    </Col>
                    <Col span={4} style={{color:'wheat'}}>שלום {userName}</Col>
                </Row>
            </Header>
            <Layout style={{ padding: '0 24px 24px' }}>
                <Switch>
                    <Route exact path='/' component={MonthlyReport} />
                    <Route path='/confirm' component={Confirm} />
                </Switch>

            </Layout>
         </Layout>
        </> 
    )
}

export default withRouter(App);