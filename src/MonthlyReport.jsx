// @flow
import React, {useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Img from 'react-image';
import i18n from 'i18next';

import { useTranslation } from "react-i18next";

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import {  Divider, Tag, Button, Modal } from 'antd';
import { Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

import { Tabs } from 'antd';
const { TabPane } = Tabs;

import { Calendar, Badge } from 'antd';
import { Row, Col } from 'antd';

import ReactToPrint from 'react-to-print';

import Report from './components/Report/Report';
import { DataContext } from "./DataContext";
import ReportPDF from './ReportPDF';

type Props = {
    month: number,
    year: number
}

const MonthlyReport = (props: Props) => {

    const [month, setMonth] = useState(props.month);
    const [year, setYear] = useState(props.year);
    const [tableData, setTableData] = useState([])
    const [reportId, setReportId] = useState();
    const [loadingData, setLoadingData] = useState(false)

    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [dayModalVisible, setDayModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState();
    const [signature, setSignature] = useState();

    const dataContext = useContext(DataContext);
    const history = useHistory();
    const componentRef = useRef();

    const { t } = useTranslation();

    useEffect( () => {
        async function fetchData() {

            setMonth(props.month)
            setYear(props.year)

            setLoadingData(true)
            try {
                const url = `http://${dataContext.host}/me/reports?month=${props.month + 1}&year=${props.year}`;
                const resp = await axios(url, {
                    withCredentials: true
                }); 
                let reportId = 0;
                const data = resp.data.map( (item, index ) => {
                        const _item = {...item, key: index};
                        if( reportId === 0 )
                            reportId = item.reportId;
                        return _item;
                })
                setLoadingData(false)
                setReportId(reportId);
                setTableData(data)
            } catch(err) {
                console.error(err);
            }  finally {
                setLoadingData(false)
            }

            try {
                const resp = await axios(`http://${dataContext.host}/me/signature`, {
                    withCredentials: true
                });
                setSignature(resp.data)
            } catch(err) {
                console.error(err);
            }
        }
        fetchData()
    }, [props])

  
    const onSubmit = async () => {
        try {
            await axios({
                url: `http://${dataContext.host}/me/reports?month=${month + 1}&year=${year}&reportid=${reportId}`, 
                method: 'post',
                data: tableData,
                withCredentials: true
            })
        } catch(err) {
            console.error(err);
        }
    }

    const onShowPDF = () => {
        //history.push('/pdf');
        setPrintModalVisible(!printModalVisible);
    }

    const handlePrintCancel = () => {
        setPrintModalVisible(false);
    }


    const operations = <Text>{t('title')} {t('for_month')} {month+1}.{year}</Text>;

    const dateCellRender = (value) => {
        const { date, total, notes } = tableData[0];
        const tableDataItem = tableData.find( item => {
            const itemDate = moment(item.date);
            return value.isSame(itemDate, 'day');
        })
        if( tableDataItem ) {
            console.log(tableDataItem);
        }

        const badge = <Badge status='error' text={notes} />;
        if( !total )
            return (
                <ul className="events">
                    <li>
                        <Badge status='error' text={notes} />
                    </li>
                </ul>
            )
        else {    
            return (
                <ul className="events">
                    <li>
                        <Badge status='success' text={notes} />
                    </li>
                </ul>
            )
        }
    }

    const onCalendarDaySelected = (value) => {
        setSelectedDay(value.format('DD/MM/YYYY'))
        const tableDataItem = tableData.find( item => {
            const itemDate = moment(item.date);
            return value.isSame(itemDate, 'day');
        })
        if( tableDataItem ) {
            setDayModalVisible(true);
        }
    }

    const dayModalCancel = () => {
        setDayModalVisible(false);
    }

    const dayModalOK = () => {
        setDayModalVisible(false);
    }

    return (
        <Content style={{ margin: '0 16px' }}>

            {/* <Title level={2} dir='rtl'>{t('title')} {t('for_month')} {month+1}.{year}</Title> */}
            <Tabs defaultActiveKey="1" tabBarExtraContent={operations}
                  type="line">
                <TabPane tab={
                    <span>
                        <Icon type="bars" />
                        {t('plain')}
                    </span>
                }
                key="1">
                    <Report dataSource={tableData} loading={loadingData} editable={true}/>
                </TabPane>
                <TabPane tab={
                    <span>
                        <Icon type="schedule" />
                        {t('calendar')}
                    </span>
                    }
                    key="2">
                    <Calendar dateCellRender={dateCellRender} onSelect={onCalendarDaySelected}/>
                </TabPane>
            </Tabs>
            
            <Modal title="Print Report"
                    visible={printModalVisible}
                    footer={[
                            <ReactToPrint removeAfterPrint={true}
                                trigger={() => <Button type="primary">Print</Button>}
                                content={() => componentRef.current}
                            />,
                            <Button onClick={handlePrintCancel}>{t('cancel')}</Button>
                        ]}>
                <div ref={componentRef}>
                    <Title level={3} dir='rtl'>{dataContext.user.name}</Title>
                    <Title level={4} dir='rtl'>{t('title')} {t('for_month')} {month+1}.{year}</Title>
                    <Report dataSource={tableData} loading={loadingData} editable={true}/>                   
                    <Img src={signature} /> 
                </div>
            </Modal>
            <Modal title={selectedDay}
                visible={dayModalVisible}
                footer={
                    [
                        <Button type="primary" onClick={dayModalOK}>OK</Button>,
                        <Button onClick={dayModalCancel}>{t('cancel')}</Button>
                    ]
                }>
                <Row gutter={[16, 16]}>
                    <Col>
                        <div>In</div>
                        <div>10:44</div>
                    </Col>
                    <Col>
                        <div>Out</div>
                        <div>10:45</div>
                    </Col>                    
                </Row>
            </Modal>
            
            <Button type="primary" onClick={onSubmit}>{t('submit')}</Button>
            <Button type="primary" onClick={onShowPDF}>PDF</Button>
        </Content>
    )
}

export default MonthlyReport;