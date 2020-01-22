// @flow
import React, {useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Img from 'react-image';
import i18n from 'i18next';

import { useSelector, useDispatch } from 'react-redux';

import { useTranslation } from "react-i18next";

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { Divider, Tag, Button, Modal } from 'antd';
import { Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

import { Tabs } from 'antd';
const { TabPane } = Tabs;

import { Calendar, Badge, Card } from 'antd';
import { Row, Col } from 'antd';

import { Alert } from 'antd';

import ReactToPrint from 'react-to-print';

import TableReport from './components/Reports/TableReport';
import CalendarReport from './components/Reports/CalendarReport';
import { DataContext } from "./DataContext";
import ReportPDF from './ReportPDF';

import { DatePicker } from 'antd';
const { MonthPicker, RangePicker, WeekPicker } = DatePicker;

const MonthlyReport = () => {

    const [month, setMonth] = useState(moment().month()+1);
    const [year, setYear] = useState(moment().year());
    const [reportData, setReportData] = useState([])
    const [reportId, setReportId] = useState();
    const [loadingData, setLoadingData] = useState(false)
    const [calendarDate, setCalendarDate] = useState(moment());
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [signature, setSignature] = useState();
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState();

    const dataContext = useContext(DataContext);
    const history = useHistory();
    const componentRef = useRef();

    const _calendarDate = useSelector(
        store => {
            return ( store ) ? store.reportDate : store;
        }
    );

    useEffect( () => {

        if( _calendarDate ) {
            setCalendarDate(_calendarDate)
            setMonth(_calendarDate.month()+1)
            setYear(_calendarDate.year())
        }
    }, [_calendarDate]);

    const { t } = useTranslation();

    useEffect( () => {
        async function fetchData() {

            setLoadingData(true)
            try {
                const url = `http://${dataContext.host}/me/reports?month=${month}&year=${year}`;
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
                setReportData(data)
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
                data: reportData,
                withCredentials: true
            })
        } catch(err) {
            setErrorMessage(err);
            setShowError(true);
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

    const onCloseError = () => {
        setShowError(false);
    }

    const onMonthChange = (date, dateString) => {
        if( date ) {
            const month = date.month()
            setMonth(month+1)

            const year = date.year()
            setYear(year)

            const calendarDate = moment().set({
                month: month,
                year: year
            })
            setCalendarDate(calendarDate);
        }
    }

    const disabledDate = (current) => {
        return current && 
                ( current > moment().endOf('day') )
                || (current < moment().add(-12, 'month'))
    }

    return (
        <Content style={{ margin: '0 16px' }}>
            { showError ? (<Alert closable message={errorMessage}
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
                                 value={calendarDate}
                                 allowClear={false}
                                 defaultValue={moment()} />
                    <TableReport dataSource={reportData} loading={loadingData} editable={true} />
                </TabPane>
                <TabPane tab={<span>
                                <Icon type="schedule" />
                                {t('calendar')}
                            </span>
                            } key="2">
                    <CalendarReport tableData={reportData} value={calendarDate}/>
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
                    <TableReport dataSource={reportData} loading={loadingData} editable={true}/>                   
                    <Img src={signature} /> 
                </div>
            </Modal>
            
        </Content>
    )
}

export default MonthlyReport;