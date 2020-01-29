// @flow
import React, {useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Img from 'react-image';
import i18n from 'i18next';
import uniqid from 'uniqid';

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
import YearReport from './components/Reports/YearReport';
import { DataContext } from "./DataContext";
import ReportPDF from './ReportPDF';

import { UPDATE_ITEM } from "./redux/actionTypes"

import { DatePicker } from 'antd';
const { MonthPicker } = DatePicker;

const Home = () => {

    const [month, setMonth] = useState(moment().month()+1);
    const [year, setYear] = useState(moment().year());
    const [reportData, setReportData] = useState([])
    const [reportDataValid, setReportDataValid] = useState(false);
    const [isReportSubmitted, setReportSubmitted] = useState(false);
    const [reportId, setReportId] = useState();
    const [loadingData, setLoadingData] = useState(false)
    const [calendarDate, setCalendarDate] = useState(moment());
    const [printModalVisible, setPrintModalVisible] = useState(false);
    const [signature, setSignature] = useState();
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState();
    const [alertMessage, setAlertMessage] = useState();

    const dataContext = useContext(DataContext);
    const history = useHistory();
    const componentRef = useRef();

    const dispatch = useDispatch();

    const _calendarDate = useSelector(
        store => store.reportDateReducer.reportDate
    );

    const isReportDataValid = () => (

        reportData.every( (item) => {

            return (item.dayOfWeek === 'ש' || item.dayOfWeek === 'ו') ||
                   ( item.entry !== '0:00' && item.exit !== '0:00' ) ||
                   ( item.entry === '0:00' && item.exit === '0:00' );
            
        })
    )

    const _updatedItem = useSelector(
        store => store.reportUpdateReducer.lastUpdatedItem
    )

    useEffect( () => {
        if(_updatedItem){
            const index = reportData.findIndex( item => item.id === _updatedItem.id);
            if (index > -1) {
                reportData[index] = _updatedItem;
                const res = isReportDataValid();
                console.log(`validation result: ${res}`);
                setReportDataValid( res );
                setReportData(reportData);
            }
        }
    }, [_updatedItem])


    useEffect( () => {

        if( _calendarDate ) {
            setCalendarDate(_calendarDate)
            setMonth(_calendarDate.month()+1)
            setYear(_calendarDate.year())
        }
    }, [_calendarDate]);

    // useEffect( () => {
    //     const reportItem = reportData.find( item => (
    //         item.id === _reportItem.id
    //     ));
    //     if( reportItem ) {
    //         if( _reportItem.type === 'exit') {
    //             reportItem.exit = _reportItem.exit
    //         } else if( _reportItem.type === 'entry') {
    //             reportItem.exit = _reportItem.entry
    //         }
    //         console.log(reportItem);
    //     }
    // }, [_reportItem])

    const { t } = useTranslation();

    const defineAlert = (data) => {
        if( data ) {
            
            setAlertType('info');
            if( !data.approved ) {
                setAlertMessage(`דוח שעות לחודש ${month}/${year} טרם אושר`);
            } else {
                setAlertMessage(`דוח שעות לחודש ${month}/${year} בתאריך אושר ${data.approved_when}`);
            }

        } else {
            setAlertMessage(`דוח שעות לחודש ${month}/${year} טרם אושר`);
            setAlertType('warning');
        }

        setShowAlert(true);
    }

    useEffect( () => {
        async function fetchData() {

            setLoadingData(true)
            try {

                // Get report's status of requested month
                let url = `http://${dataContext.host}/me/reports/status?month=${month}&year=${year}`;
                let statusResp = await axios(url, {
                    withCredentials: true
                });

                let reportId = 0;
                let data = [];
                
                if( statusResp.data ) {
                    // The status was returned, i.e. there were an updates to the original report
                    // Get them!
                    reportId = statusResp.data.reportId;
                    url = `http://${dataContext.host}/me/reports/${reportId}/updates`;
                    const resp = await axios(url, {
                        withCredentials: true
                    });

                    data = resp.data.map( (item, index ) => {
                        const _item = {...item, key: index};
                        return _item;
                    })

                } else {

                    // The status of the report is unknown, i.e. get the original report    
                    url = `http://${dataContext.host}/me/reports/?month=${month}&year=${year}`;
                    const resp = await axios(url, {
                        withCredentials: true
                    }); 
                    
                    data = resp.data.map( (item, index ) => {
                            const _item = {...item, key: index};
                            if( reportId === 0 )
                                reportId = item.reportId;
                            return _item;
                    })
                }

                setLoadingData(false);
                setReportId(reportId);
                setReportData(data);

                defineAlert(statusResp.data);

            } catch(err) {
                console.error(err);
                setShowAlert(true);
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

    const action_updateItem = (item) => ({
        type: UPDATE_ITEM,
        item
    })
  
    const onSubmit = async () => {
        try {
            await axios({
                url: `http://${dataContext.host}/me/reports?month=${month}&year=${year}&reportid=${reportId}`, 
                method: 'post',
                data: reportData,
                withCredentials: true
            })
            //TODO set success Alert
            setReportSubmitted(true);
        } catch(err) {
            setErrorMessage(err.message);
            setShowAlert(true);
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
                            <Button type="primary" onClick={onSubmit}
                                                   disabled={ isReportSubmitted || !reportDataValid}
                             >
                                {t('submit')}
                            </Button>
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
        <Content>
            { showAlert ? (<Alert closable={false}
                                    message={alertMessage}
                                    className='hvn-item-rtl' 
                                    onClose={onCloseError}
                                    showIcon 
                                    type={alertType} />
                ) : null
            }
            {/* <Title level={2} dir='rtl'>{t('title')} {t('for_month')} {month+1}.{year}</Title> */}
            <Tabs defaultActiveKey="1" 
                  tabBarExtraContent={operations}
                  type="line"
                  className='hvn-item-ltr'>
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
                    <TableReport dataSource={reportData} loading={loadingData} onChange={( item ) => dispatch(action_updateItem(item)) } editable={true} />
                </TabPane>
                <TabPane tab={<span>
                                <Icon type="schedule" />
                                {t('calendar')}
                            </span>
                            } key="2">
                    <CalendarReport tableData={reportData} value={calendarDate}/>
                </TabPane>
                <TabPane tab={<span>
                                <Icon type="fund" />
                                {t('yearly')}
                            </span>
                            }
                            key='3'>
                    <YearReport />        
                </TabPane>
            </Tabs>
            
            <Modal title="Print Report"
                    visible={printModalVisible}
                    footer={[
                            <ReactToPrint key={uniqid()}
                                removeAfterPrint={true}
                                trigger={() => <Button type="primary">Print</Button>}
                                content={() => componentRef.current}
                            />,
                            <Button key={uniqid()} onClick={handlePrintCancel}>{t('cancel')}</Button>
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

export default Home;