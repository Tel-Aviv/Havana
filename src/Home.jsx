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

import { Layout, Icon,  } from 'antd';
const { Content } = Layout;

import { Divider, Tag, Button, List, Modal, 
        Typography, } from 'antd';
const { Title, Paragraph, Text } = Typography;

import { Tabs, Dropdown, Menu, message  } from 'antd-rtl';
const { TabPane } = Tabs;

import { Calendar, Badge, Alert, Card, 
        Row, Col } from 'antd';

import ReactToPrint from 'react-to-print';

import TableReport from './components/Reports/TableReport';
import CalendarReport from './components/Reports/CalendarReport';
import YearReport from './components/Reports/YearReport';
import { DataContext } from "./DataContext";
import ReportPDF from './ReportPDF';
import DocsUploader from './components/DocsUploader';

import { UPDATE_ITEM } from "./redux/actionTypes"

import { DatePicker } from 'antd';
const { MonthPicker } = DatePicker;




function handleButtonClick(e) {
  message.info('Click on left button.');
  console.log('click left button', e);
}



const Home = () => {

    const [month, setMonth] = useState<number>(moment().month()+1);
    const [year, setYear] = useState<number>(moment().year());
    const [reportData, setReportData] = useState([])
    const [managers, setManagers] = useState([])
    const [reportDataValid, setReportDataValid] = useState<boolean>(false);
    const [isReportSubmitted, setReportSubmitted] = useState<boolean>(false);
    const [isReportEditable, setIsReportEditable] = useState<boolean>(true);
    const [reportId, setReportId] = useState<number>(0);
    const [totals, setTotals] = useState<number>(0);
    const [loadingData, setLoadingData] = useState<boolean>(false)
    const [calendarDate, setCalendarDate] = useState<moment>(moment());
    const [printModalVisible, setPrintModalVisible] = useState<boolean>(false);
    const [signature, setSignature] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertType, setAlertType] = useState<string>('info');
    const [alertMessage, setAlertMessage] = useState<string>('');

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

    const { t } = useTranslation();

    const defineAlert = (data) => {
        if( data ) {
            
            setAlertType('info');
            if( !data.submitted ) {
                setAlertMessage(`דוח שעות לחודש ${month}/${year} טרם נשלח לאישור`);
            } else if( !data.approved ) {
                setAlertMessage(`דוח שעות לחודש ${month}/${year} טרם אושר`);
            } else {
                const whenApproved = moment(data.whenApproved).format('DD/MM/YYYY')
                setAlertMessage(`דוח שעות לחודש ${month}/${year} אושר בתאריך ${whenApproved}`);
            }

        } else {
            setAlertMessage(`דוח שעות לחודש ${month}/${year} טרם אושר`);
            setAlertType('warning');
        }

        setShowAlert(true);
    }

    useEffect( () => {
        async function fetchData() {

            try {
                const resp = await axios(`http://${dataContext.host}/me/managers/`, {
                    withCredentials: true
                });

                setManagers(resp.data);

            } catch(err) {
                console.error(err);
            }
        }
        fetchData()
    }, [])

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
                    // The status was returned, i.e. there was an updates to the original report
                    // Get them!
                    reportId = statusResp.data.reportId;
                    url = `http://${dataContext.host}/me/reports/${reportId}/updates`;
                    const _resp = await axios(url, {
                        withCredentials: true
                    });

                    data = _resp.data.items.map( (item, index ) => {
                        const _item = {...item, key: index};
                        return _item;
                    })
                    setTotals(_resp.data.totalHours);
                    setIsReportEditable(false)

                } else {

                    // The status of the report is unknown, i.e. get the original report    
                    url = `http://${dataContext.host}/me/reports/?month=${month}&year=${year}`;
                    const resp = await axios(url, {
                        withCredentials: true
                    }); 

                    if( resp.data
                        && resp.data.items 
                        && resp.data.items.length > 0  ) {

                        data = resp.data.items.map( (item, index ) => {
                                const _item = {...item, key: index};
                                if( reportId === 0 )
                                    reportId = item.reportId;
                                return _item;
                        })
                        
                        setTotals(resp.data.totalHours);
                        setIsReportEditable(true)

                    }
                }

                setLoadingData(false);
                setReportId(reportId);
                setReportData(data);

                defineAlert(statusResp.data);

            } catch(err) {
                console.error(err);
                setAlertMessage(err.message);
                setAlertType('error');
                setShowAlert(true);
            }  finally {
                setLoadingData(false)
            }

            try {
                const resp = await axios(`http://${dataContext.host}/me/signature`, {
                    withCredentials: true
                });
            
                const signature = resp.data;
                if( signature.startsWith('data:') ) {
                    setSignature(signature);
                }
                else {    
                    setSignature(`data:/image/*;base64,${signature}`);
                }                

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
            //TODO: set success Alert
            setReportSubmitted(true);
            setIsReportEditable(false)
        } catch(err) {
            setAlertMessage(err.message);
            setShowAlert(true);
        }
    }

    const onShowPDF = () => {
        setPrintModalVisible(!printModalVisible);
    }

    const handlePrintCancel = () => {
        setPrintModalVisible(false);
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

    const handleMenuClick = (e) => {
        message.info(`הדוח יועבר לאישור ${managers[e.key].userName}`);
    }
    const menu = <Menu onClick={handleMenuClick}>
        {managers.map((manager, index) => (
                <Menu.Item  key={index}>
                    <Icon type="user" />
                    {manager.userName}
                </Menu.Item>
        ))}
    </Menu>
    
    
    
    
    const operations = <div>
                            <Dropdown.Button type="primary" onClick={onSubmit}  overlay={menu}
                                                   disabled={ isReportSubmitted || !reportDataValid}
                                style={{
                                    marginRight: '6px'
                                }}>
                                {t('submit')}
                            </Dropdown.Button>
                            <Button type="primary" onClick={onShowPDF}>PDF</Button>
                        </div>;

    return (
        <Content>
            <Row className='hvn-item-ltr' align={'middle'} type='flex'>
                <Col span={4} >
                    {operations}
                </Col>
                <Col span={2} offset={18}>
                    <MonthPicker onChange={onMonthChange}
                                            disabledDate={disabledDate}
                                            className='ltr'
                                            value={calendarDate}
                                            allowClear={false}
                                            defaultValue={moment()} />
                </Col>
                 
            </Row>
            <Row>
            { showAlert ? (<Alert closable={false}
                                    message={alertMessage}
                                    className='hvn-item-rtl' 
                                    showIcon 
                                    type={alertType} />
                ) : null
            }
            </Row>
            <Row gutter={[32, 32]} style={{
                    margin: '0% 4%' 
                }}>
                <Col span={8}>
                    <Row gutter={[40, 32]}>
                        <Col>
                            <Card title='סיכומים' bordered={false}
                                className='rtl'>
                                <div>סה"כ { totals } שעות</div>
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={t('abs_docs')} bordered={true}
                                className='rtl'>
                                <DocsUploader reportId={reportId} 
                                              isOperational={true}/>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={16}>
                    <Tabs defaultActiveKey="1" 
                        type="line"
                        className='hvn-table-rtl'>
                        <TabPane tab={
                                    <span>
                                        <Icon type="bars" />
                                        <span>
                                            {t('plain')}
                                        </span>
                                    </span>
                                }
                                key="1">
                            <TableReport dataSource={reportData}
                                        loading={loadingData}
                                        scroll={{y: '600px'}}
                                        onChange={( item ) => dispatch(action_updateItem(item)) } 
                                        editable={isReportEditable} />
                        </TabPane>
                        <TabPane tab={<span>
                                        <Icon type="schedule" />
                                        <span>
                                            {t('calendar')}
                                        </span>
                                    </span>
                                    } 
                                key="2">
                            <CalendarReport tableData={reportData} value={calendarDate}/>
                        </TabPane>
                        <TabPane tab={<span>
                                        <Icon type="fund" />
                                        <span>
                                            {t('yearly')}
                                        </span>
                                    </span>
                                    }
                                    key='3'>
                            <YearReport />        
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>
            <Modal title="Print Report"
                    visible={printModalVisible}
                    closable={true}
                    forceRender={true}
                    onCancel={handlePrintCancel}
                    footer={[
                            <ReactToPrint key={uniqid()}
                                copyStyles={true}
                                removeAfterPrint={true}
                                trigger={() => <Button type="primary">{t('print')}</Button>}
                                content={() => componentRef.current}
                            />,
                            <Button key={uniqid()} onClick={handlePrintCancel}>{t('cancel')}</Button>
                        ]}>
                <div ref={componentRef}>
                    <Title level={3} dir='rtl'>{dataContext.user.name}</Title>
                    <Title level={4} dir='rtl'>{t('title')} {t('for_month')} {month}.{year}</Title>
                    <TableReport dataSource={reportData} 
                                 loading={loadingData} 
                                 editable={false} /> 
                    <Img style={{
                        width: '100px'
                    }} src={signature} /> 
                </div>
            </Modal>
            
        </Content>
    )
}

export default Home;