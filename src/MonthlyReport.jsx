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

import { Calendar, Badge, Card } from 'antd';
import { Row, Col } from 'antd';

import { Alert } from 'antd';

import ReactToPrint from 'react-to-print';

import Report from './components/Report/Report';
import { DataContext } from "./DataContext";
import ReportPDF from './ReportPDF';

import { DatePicker } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

const MonthlyReport = () => {

    const [month, setMonth] = useState(moment().month()+1);
    const [year, setYear] = useState(moment().year());
    const [tableData, setTableData] = useState([])
    const [reportId, setReportId] = useState();
    const [loadingData, setLoadingData] = useState(false)

    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [dayModalVisible, setDayModalVisible] = useState(false);
    const [selectedDay, setSelectedDay] = useState();
    const [signature, setSignature] = useState();
    const [showError, setShowError] = useState(false);

    const dataContext = useContext(DataContext);
    const history = useHistory();
    const componentRef = useRef();

    const { t } = useTranslation();

    useEffect( () => {
        async function fetchData() {

            setLoadingData(true)
            try {
                const url = `http://${dataContext.host}/me/reports?month=${month + 1}&year=${year}`;
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
                setShowError(true);
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
    }, [month, year])

  
    const onSubmit = async () => {
        try {
            await axios({
                url: `http://${dataContext.host}/me/reports?month=${month}&year=${year}&reportid=${reportId}`, 
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


    const operations = <div>
                            <Button type="primary" onClick={onSubmit}>{t('submit')}</Button>
                            <Button type="primary" onClick={onShowPDF}>PDF</Button>
                        </div>;

    const dateCellRender = (value) => {

        if( tableData.length === 0 )
            return null;

        const tableDataItem = tableData.find( item => {
            const itemDate = moment(item.date);
            return value.isSame(itemDate, 'day');
        })
        if( !tableDataItem ) {
            console.error(`DataTable item not found for ${value.toString()}`);
            return;
        }
        const { date, total, notes } = tableDataItem;

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

    const onCloseError = () => {
        setShowError(false);
    }

    const onMonthChange = (date, dateString) => {
        if( date ) {
            const month = date.month()
            setMonth(month)

            const year = date.year()
            setYear(year)
        }
    }

    const disabledDate = (current) => {
        return current && current > moment().endOf('day');
    }

    return (
        <Content style={{ margin: '0 16px' }}>
            { showError ? (<Alert closable message='error' 
                onClose={onCloseError}
                showIcon type='error' />
                ) : null
            }
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
                    <MonthPicker onChange={onMonthChange}
                                    disabledDate={disabledDate}
                                    defaultValue={moment()} />
                    <Report dataSource={tableData} loading={loadingData} editable={true}/>
                </TabPane>
                <TabPane tab={
                    <span>
                        <Icon type="schedule" />
                        {t('calendar')}
                    </span>
                    }
                    key="2">
                        <Calendar dateCellRender={dateCellRender} 
                        fullscreen={true}
                        onSelect={onCalendarDaySelected}/>
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
                    <MonthPicker onChange={onMonthChange}
                                    disabledDate={disabledDate}
                                    defaultValue={moment()} />

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