// @flow
import React, {useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import Img from 'react-image';
import uniqid from 'uniqid';

import { useSelector, useDispatch } from 'react-redux';

import { useTranslation } from "react-i18next";

import { Layout, Icon, Popconfirm } from 'antd';
const { Content } = Layout;

import { Button, Tooltip, Modal, 
        Typography, Affix, Table, Tag } from 'antd';
const { Title, Paragraph, Text } = Typography;

import { Tabs, Dropdown, Menu, message  } from 'antd-rtl';
const { TabPane } = Tabs;

import { Alert, Card, 
        Row, Col } from 'antd';
 import { ChartCard, Bar, WaterWave, Pie, Field } from 'ant-design-pro/lib/Charts';        

import ReactToPrint from 'react-to-print';

import TableReport from './components/Reports/TableReport';
import CalendarReport from './components/Reports/CalendarReport';
import YearReport from './components/Reports/YearReport';
import { DataContext } from "./DataContext";
//import ReportPDF from './ReportPDF';
import DocsUploader from './components/DocsUploader';

import { UPDATE_ITEM } from "./redux/actionTypes"

import { DatePicker } from 'antd';
const { MonthPicker } = DatePicker;

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
    // Report Status Alert
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [alertType, setAlertType] = useState<string>('info');
    const [alertMessage, setAlertMessage] = useState<string>('');

    const [validateModalOpen, setValidateModalOpen] = useState<boolean>(false)
    const [invalidReportItems, setInvalidReportItems] = useState();

    const [daysOff, setDaysOff] = useState([]);

    const dataContext = useContext(DataContext);
    const history = useHistory();
    const componentRef = useRef();

    const dispatch = useDispatch();

    const _calendarDate = useSelector(
        store => store.reportDateReducer.reportDate
    );

    const validateReport = () => {
        const res = isReportDataValid();
        if( !res.isValid ) {
            setValidateModalOpen(true);
            const invalidItem = reportData[res.invalidItemIndex]
            setInvalidReportItems([invalidItem]);
        }
        else {
            setValidateModalOpen(false); 
            setInvalidReportItems(null);

            setReportDataValid( true );
            message.info(t('report_validated'));
        }

    }

    const isReportDataValid = () => {

        let invalidItemIndex = -1;
        const res = reportData.some( (item, index) => {

            const workingDay = isWorkingDay(item);
            const hasBoth = hasBothEntryExit(item);
            if( workingDay && !hasBoth && !item.notes ) // must explain missing working day
            {
                invalidItemIndex = index;
                return true;
            }

            const isItemInvalid = workingDay && !hasBoth;
            if( isItemInvalid )
                invalidItemIndex = index;

            return isItemInvalid;
        })

        return {
            isValid: !res,
            invalidItemIndex: invalidItemIndex
        } 

        // reportData.every( (item) => {

        //     console.log(item)

        //     const res = (item.dayOfWeek === 'ש' || item.dayOfWeek === 'ו') ||
        //                 ( item.entry !== '0:00' && item.exit !== '0:00' ) ||
        //                 ( item.entry === '0:00' && item.exit === '0:00' );

        //     return res;
            
        // })
    }

    const isWorkingDay = (item) => {

        const itemDate = new Date();
        itemDate.setMonth(month-1);
        itemDate.setYear(year);
        itemDate.setDate(item.day);
        
        const index = daysOff.find( dayOff => (
             dayOff.getDate() == itemDate.getDate()   
             && dayOff.getMonth() == itemDate.getMonth()
             && dayOff.getFullYear() == itemDate.getFullYear()
        ))
        if( index ) 
            return false;
        else
            return !(item.dayOfWeek === 'ש' || item.dayOfWeek === 'ו');
    }

    const hasBothEntryExit = (item) => {
        return item.entry !== '0:00' && item.exit !== '0:00'
    }

    const _updatedItem = useSelector(
        store => store.reportUpdateReducer.lastUpdatedItem
    )

    useEffect( () => {
        if(_updatedItem){
            const index = reportData.findIndex( item => item.key === _updatedItem.key);
            if ( index > -1 ) {
                reportData[index] = _updatedItem;
                const res = isReportDataValid();
                setReportDataValid( res.isValid );
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

            setReportDataValid( false );
            setLoadingData(true)
            try {

                let _resp;
                let data = [];

                let url = `http://${dataContext.host}/daysoff?year=${year}&month=${month}`;
                _resp = await axios(url);
                data = _resp.data.items.map( item => 
                    new Date( Date.parse(item.date) )
                );
                setDaysOff( data );

                // Get report's status of requested month
                url = `http://${dataContext.host}/me/reports/status?month=${month}&year=${year}`;
                let statusResp = await axios(url, {
                    withCredentials: true
                });

                let reportId = 0;
                
                if( statusResp.data ) {

                    // The status was returned, i.e. there was an updates to the original report
                    if( statusResp.data.saveReportId ) {

                        // There is interim report found. Actually the following call gets
                        // the merged report: saved changes over the original data
                        url = `http://${dataContext.host}/me/reports/saved?savedReportGuid=${statusResp.data.saveReportId}`;  
                        _resp = await axios(url, {
                            withCredentials: true
                        })  
                        // Enable further saves
                        setIsReportEditable(true);
                    }  else {
  
                        reportId = statusResp.data.reportId;
                        url = `http://${dataContext.host}/me/reports/${reportId}/updates`;
                        _resp = await axios(url, {
                            withCredentials: true
                        });
                        // Disable the changes to assigned report
                        setIsReportEditable(false);
                    } 

                    data = _resp.data.items.map( (item, index ) => {
                        const _item = {...item, key: index};
                        return _item;
                    })
                    setTotals(_resp.data.totalHours);

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
                        setIsReportEditable(resp.data.isEditable)

                    }
                }

                setLoadingData(false);
                setReportId(reportId);
                setReportData(data);

                defineAlert(statusResp.data);

            } catch(err) {
                console.error(err);
                setAlertMessage(err.response.data);
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
        
        let message = `דוח שעות לחודש ${month}/${year} נשלח לאישור`;
        
        try {
            
            await axios({
                url: `http://${dataContext.host}/me/reports?month=${month}&year=${year}&reportid=${reportId}`, 
                method: 'post',
                data: reportData,
                withCredentials: true
            })
            
            setReportSubmitted(true);
            setIsReportEditable(false)
            setAlertType("info");
            
        } catch(err) {
            message.error(err.message);
        }

        setAlertMessage(message);
        setShowAlert(true);
    }

    const onShowPDF = () => {
        setPrintModalVisible(!printModalVisible);
    }

    const onSave = async() => {
        try {
            await axios({
                url: `http://${dataContext.host}/me/report/save?month=${month}&year=${year}`,
                method: 'post',
                data: reportData,
                withCredentials: true
            })

            message.success(t('saved'))
        } catch(err) {
            console.error(err);
            message.error(err.message)
        }
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

    const getTotalHoursPercentage = () => {
        return Math.floor( parseFloat(totals) / 160. * 100 );
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
                            <Popconfirm title={t('send_to_approval')} 
                                onConfirm={onSubmit}>
                                {/* <Dropdown.Button type="primary" overlay={menu}
                                                    disabled={ isReportSubmitted || !reportDataValid }
                                    style={{
                                        marginRight: '6px'
                                    }}>
                                    {t('submit')}
                                </Dropdown.Button> */}
                                <Button type="primary"
                                        disabled={ isReportSubmitted || !reportDataValid }
                                         style={{
                                            marginRight: '6px'
                                        }}>
                                    {t('submit')} 
                                </Button>
                            </Popconfirm>
                            <Tooltip placement='bottom' title={t('validate_report')}>
                                <Button onClick={validateReport} style={{
                                            marginRight: '6px'
                                        }}
                                        disabled={loadingData}>
                                    {t('validate')} <Icon type="check-circle" theme="twoTone" />
                                </Button>
                            </Tooltip>
                            <Tooltip placement='bottom' title={t('save_tooltip')}>
                                <Button onClick={onSave}
                                        style={{
                                            marginRight: '6px'
                                        }}
                                        disabled={loadingData}>
                                    {t('save')}<Icon type="save" theme="twoTone"/>
                                </Button>
                            </Tooltip>
                            <Button onClick={onShowPDF}
                                    disabled={loadingData}>
                                PDF <Icon type="file-pdf" theme="twoTone" />
                            </Button>
                        </div>;

    let columns = [
        {
        title: 'יום',
        dataIndex: 'day',
        align: 'right',
        ellipsis: true,
        editable: false,
        },
        {
        title: 'יום בשבוע',
        dataIndex: 'dayOfWeek',
        align: 'right',
        ellipsis: true,
        editable: false,
        },    
        {
        title: 'כניסה',
        dataIndex: 'entry',
        align: 'right',
        editable: true,
        render: (text) => {
            let tagColor = 'green';
            if( text === '0:00' ) {
            tagColor = 'volcano'
            }
            return <Tag color={tagColor}
                    style={{
                        marginRight: '0'
                    }}>
                    {text}
                    </Tag>
        }          
        },
        {
        title: 'יציאה',
        dataIndex: 'exit',
        align: 'right',
        editable: true,
        render: (text) => {
            let tagColor = 'green';
            if( text === '0:00' ) {
            tagColor = 'volcano'
            }
            return <Tag color={tagColor}
                    style={{
                        marginRight: '0'
                    }}>
                    {text}
                    </Tag>
        }
        },
        {
        title: 'סיכום',
        dataIndex: 'total',
        align: 'right',
        editable: false,
        },
        {
        title: 'הערות',
        dataIndex: 'notes',
        align: 'right',
        editable: true,
        render: (text, _) => 
            ( text !== '' ) ?
                <Tag color="volcano"
                style={{
                    marginRight: '0'
                }}>
                {text}
                </Tag>
                : null
        },
        {
        title: '',
        dataIndex: 'operation'
        }
    ];                        
                        
    return (
        <Content>
            <Modal visible={validateModalOpen}
                    closable={true}
                    forceRender={true}
                    onCancel={() => setValidateModalOpen(false)}
                    footer={
                        [<Button type='primary' 
                                key={uniqid()}
                                onClick={() => setValidateModalOpen(false)}>
                                    {t('close')}
                        </Button>]
                    }>
                 <div>
                    <Title className='rtl'
                        style={{
                            marginTop: '12px'
                        }}>
                        {t('invalid_items')}
                    </Title>
                </div>
                <Row>
                    <Col>
                        <Table style={{
                                    direction: 'rtl'
                                }}
                                dataSource={invalidReportItems}
                                columns={columns} 
                                pagination={false}
                                size="small"
                                tableLayout='auto'
                            />
                    </Col>
                </Row>
            </Modal>
            <Row className='hvn-item-ltr' align={'middle'} type='flex'>
                <Col span={8} >
                    {operations}
                </Col>
                <Col span={2} offset={14}>
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
                <Col span={5}>
                    <Row gutter={[40, 32]}>
                        <Col>
                        <Card title='סיכומים' bordered={false}
                                className='rtl' loading={loadingData}>
                                <div>סה"כ { totals } שעות</div>
                                <Pie percent={getTotalHoursPercentage()} total={getTotalHoursPercentage() + '%'} height={140} />
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={t('abs_docs')} bordered={true}
                                className='rtl' loading={loadingData}>
                                <div>ניתן להעלות רק קבצי PNG / PDF</div>
                                <DocsUploader reportId={reportId} 
                                              isOperational={true}/>
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={19}>
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
                                        editable={isReportEditable}>
                                <Affix target={() => container}>
                                    <Button shape='circle' type='primary'>SSS</Button>
                                </Affix>  
                            </TableReport>
                        </TabPane>
                        {/* <TabPane tab={<span>
                                        <Icon type="schedule" />
                                        <span>
                                            {t('calendar')}
                                        </span>
                                    </span>
                                    } 
                                key="2">
                            <CalendarReport tableData={reportData} value={calendarDate}/>
                        </TabPane> */}
                        <TabPane tab={<span>
                                        <Icon type="fund" />
                                        <span>
                                            {t('yearly')}
                                        </span>
                                    </span>
                                    }
                                    key='3'>
                            <YearReport year={year}/>        
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
