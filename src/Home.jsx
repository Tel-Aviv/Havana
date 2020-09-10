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

import { Tooltip, Modal, Button,
        Typography, Table, Tag } from 'antd';
const { Title } = Typography;

import { Tabs, Dropdown, Menu, message  } from 'antd-rtl';
const { TabPane } = Tabs;

import { Alert, Card, 
        Row, Col } from 'antd';
import { Pie } from 'ant-design-pro/lib/Charts';        

import ReactToPrint from 'react-to-print';

import TableReport from './components/Reports/TableReport';
import YearReport from './components/Reports/YearReport';
import { DataContext } from "./DataContext";
import DocsUploader from './components/DocsUploader';

import { UPDATE_ITEM, SET_DIRECT_MANAGER } from "./redux/actionTypes"

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
    const [isReportRejected, setIsReportRejected] = useState<bool>(false);
    const [reportId, setReportId] = useState<number>(0);
    const [totals, setTotals] = useState<string>(0);
    const [userCompanyCode, setUserCompanyCode] = useState<number>(0);

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
    const [manualUpdates, setManualUpdates] = useState();
    const [assignee, setAssignee] = useState({
                                            userId:'direct'
                                        });
    const [reportCodes, setReportCodes] = useState([]);
    const [employeKind, setEmployeKind] = useState()

    const dataContext = useContext(DataContext);
    const history = useHistory();
    const componentRef = useRef();

    const dispatch = useDispatch();

    const action_setDirectManager = (manager: object) => ({
        type: SET_DIRECT_MANAGER,
        data: manager
    })

    const _directManager = useSelector(
        store => store.directManagerReducer.directManager
    )

    useEffect( () => {
        if( _directManager ) {
            setAssignee(_directManager);
        }
        
    }, [_directManager])

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
            const hasTotal = isTotalled(item);

            const isItemInvalid = workingDay && !hasTotal && !item.notes || item.notes.startsWith('*');
            if( isItemInvalid ) {
                invalidItemIndex = index;
                return true;
            }

            return isItemInvalid;
        })

        return {
            isValid: !res,
            invalidItemIndex: invalidItemIndex
        } 
    }

    const isWorkingDay = (item) => {

        const itemDate = moment(item.rdate);
        
        const index = daysOff.find( dayOff => (
             dayOff.getDate() == itemDate.date()   
             && dayOff.getMonth() == itemDate.month()
             && dayOff.getFullYear() == itemDate.year()
        ))
        if( index ) 
            return false;
        else
            return !(item.dayOfWeek === 'ש' || item.dayOfWeek === 'ו');
    }

    const isTotalled = (item) => {
        const tokens = item.total.split(':');
        const hours = parseInt(tokens[0]);
        const minutes = parseInt(tokens[1]);
    
        //return item.entry !== '0:00' && item.exit !== '0:00'
        return item.total != '0:00';
    }

    const _updatedItem = useSelector(
        store => store.reportUpdateReducer.lastUpdatedItem
    )

    useEffect( () => {

        async function applyEffect() {
 
            if( reportData.length > 0 ) { // skip for first time

                const _totals = recalculateTotals();
                setTotals(_totals);

                await onSave();
            }
        }

        applyEffect();

    }, [reportData]);  

    useEffect( () => {
        
        if(_updatedItem){
            const index = reportData.findIndex( item => item.key === _updatedItem.key);
            if ( index > -1 ) {
                const updatedReportData =
                 [...reportData.slice(0, index), _updatedItem, ...reportData.slice(index+1)];
                const res = isReportDataValid();
                setReportDataValid( res.isValid );
                setReportData(updatedReportData);
                
            }
        }

    }, [_updatedItem])

    const _addedData= useSelector(
        store => store.reportUpdateReducer.addedData
    )

    useEffect( () => {

        if( _addedData ) {

            const index = _addedData.index;

            const newData = [
                ...reportData.slice(0, index),
                _addedData.item,
                ...reportData.slice(index)
            ];
            setReportData(newData);

            const addedManualUpdates = [{
                    Day: _addedData.item.day,
                    Inout: true,
                }, {
                    Day: _addedData.item.day,
                    Inout: false,
                }
            ]
            
            setManualUpdates([...manualUpdates, ...addedManualUpdates]);
        }

    }, [_addedData])    


    const _deletedData = useSelector(
        store => store.reportUpdateReducer.deletedData
    )

    useEffect( () => {

        if( _deletedData ) {
            const index = _deletedData.index;
            const newData = [...reportData.slice(0, index), ...reportData.slice(index + 1)];
            setReportData(newData);

            
        }

    }, [_deletedData]);

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

                if ( data.rejected ) {
                    setAlertType('error');
                    setAlertMessage(t('rejected_note') + data.note)
                } else {

                    let _alertMessage = `דוח שעות לחודש ${month}/${year} טרם אושר`
                    if( data.assignedToName ) {
                        _alertMessage += ` ע"י ${data.assignedToName}`;
                    }
                    setAlertMessage(_alertMessage);
                }
            } else {
                const whenApproved = moment(data.whenApproved).format('DD/MM/YYYY')
                setAlertMessage(`דוח שעות לחודש ${month}/${year} אושר בתאריך ${whenApproved} ע"י ${data.assignedToName}`);
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

                const resp = await dataContext.API.get('/me', { withCredentials: true })
                setManagers(resp.data.managers);
            
                const signature = resp.data.signature;
                if( signature.startsWith('data:') ) {
                    setSignature(signature);
                }
                else {    
                    setSignature(`data:/image/*;base64,${signature}`);
                }   
                
                if( assignee.userId === 'direct' ) {
                    const directManager = resp.data;
                    if( directManager ) {
                        setAssignee(directManager);
                        dispatch(action_setDirectManager(directManager));
                    }
                }

                setEmployeKind(resp.data.kind);

            } catch( {response} ) {
                console.error( response.data );
            }
        }
        fetchData()
    }, [])

    useEffect( () => {

        const fetchData = async () => { 

            setReportDataValid( false );
            setLoadingData(true);

            try {

                let data = [];

                let respArr = await axios.all([
                    dataContext.API.get('/daysoff',  {
                        params: {
                            year: year,
                            month: month
                        }, 
                        withCredentials: true
                    }),
                    dataContext.API.get(`/me/reports/status`, {
                        params: {
                            year: year,
                            month: month
                        },
                        withCredentials: true
                    }),
                    dataContext.API.get(`/me/reports/manual_updates`, {
                        params: {
                            year: year,
                            month: month
                        },
                        withCredentials: true
                    })
                ]);
                // process work off days
                data = respArr[0].data.items.map( item => 
                    new Date( Date.parse(item.date) )
                );
                setDaysOff( data );

                // process manual updates
                if( respArr[2].data ) {
                    setManualUpdates(respArr[2].data.items)
                }
 
                // process report data
                let reportId = 0;
                if( respArr[1].data ) {
                    // The status was returned, i.e. there was an updates to the original report

                    const saveReportId = respArr[1].data.saveReportId;
                    if( saveReportId ) {

                        // Interim report found. Actually the following call gets
                        // the merged report: saved changes over the original data
                        const reportStatus = respArr[1].data;
                        setIsReportEditable( !reportStatus.approved );
                        setIsReportRejected( reportStatus.rejected );
                        const employerCode = reportStatus.employerCode || 0;
                        setUserCompanyCode( employerCode );

                        // Get report codes
                        let resp = await dataContext.API.get(`/me/report_codes`, {
                            params: {
                                id : dataContext.user.userID,
                                employerCode: employerCode,
                                year: year,
                                month: month
                            },
                            withCredentials: true
                        })
                        setReportCodes(resp.data.items);

                        // Now get the report items
                        resp = await dataContext.API.get(`/me/reports/saved`, {
                            params: {
                                savedReportGuid: saveReportId
                            }, 
                            withCredentials: true
                        })  
                        data = resp.data.items.map( (item, index ) => {
                            
                            const reportCode = reportCodes.find( (el) => 
                                el.ShortDescription === item.reportType
                            );
                            const reportType = reportCode? reportCode.Description : item.reportType;

                            const _item = {...item, 
                                            key: index,
                                            reportType: reportType || t('usual')
                                        };
                            return _item;
                        })
                        setTotals(`${Math.floor(resp.data.totalHours)}:${Math.round(resp.data.totalHours % 1 * 60)}`);

                    }  

                } else {

                    // The status of the report is unknown, i.e. get the original report    
                    const resp = await dataContext.API.get(`/me/reports/${year}/${month}`, {
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
                        
                        setTotals(`${Math.floor(resp.data.totalHours)}:${Math.round(resp.data.totalHours % 1 * 60)}`);
                        setUserCompanyCode(resp.data.employerCode);
                        setIsReportEditable(resp.data.isEditable);

                    }
                }

                setReportId(reportId);
                setReportData(data);

                defineAlert(respArr[1].data);

            } catch( {response} ) { // 😨

                if( response.data ) {
                    setAlertMessage(response.data);
                } else {
                    setAlertMessage('Something went wrong')
                }
                
                setAlertType('error');
                setShowAlert(true);
            } finally {
                setLoadingData(false)
            }

        }
        
        fetchData()
    }, [month, year])

    const recalculateTotals = () => {

        const lTotal = reportData.reduce( ( accu, item ) => {
            
            const dayDuration = moment.duration(item.total);
            return accu.add(dayDuration);

        }, moment.duration('00:00'))
      
        return `${Math.floor(lTotal.asHours())}:${lTotal.minutes().toString().padStart(2, '0')}`;
        
    }

    const action_updateItem = (item) => ({
        type: UPDATE_ITEM,
        item
    })
  
    const onSubmit = async () => {
        
        let _message = `דוח שעות לחודש ${month}/${year} נשלח לאישור`;
        
        try {
            
            await dataContext.API.post(`/me/reports?month=${month}&year=${year}&assignee=${assignee.userAccountName}`,
                reportData,
                {
                    withCredentials: true
                });
            
            setReportSubmitted(true);
            setIsReportEditable(false)
            setAlertType("info");
            
        } catch( {response} ) {
            if( response && response.data )
                message.error(response.data);
            else
                message.error("Something went wrong on submission")
        }

        setAlertMessage(_message);
        setShowAlert(true);
    }

    const onShowPDF = () => {
        setPrintModalVisible(!printModalVisible);
    }

    const onSave = async() => {
        try {
            await dataContext.API.post(`/me/report/save`, 
                reportData,
                {
                    params: {
                        month: month,
                        year: year,
                        employerCode: userCompanyCode
                    },
                    withCredentials: true
                });

            // post to the server the manual update
            const manualUpdate = {
                Year: year,
                Month: month,
                UserID: dataContext.user.account_name,
                items: manualUpdates
            }
            await dataContext.API.post(`/me/reports/manual_updates`, 
                manualUpdate,
                {
                 withCredentials: true
                });              

            //message.success(t('saved'))
        } catch( {response} ) {
            console.error(response.data);
            message.error(response.data)
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
        setAssignee(managers[e.key].userId);
        message.info(`הדוח יועבר לאישור ${managers[e.key].userName}`);
    }
    const menu = 
        <Menu onClick={handleMenuClick}>
            {
                managers ? 
                managers.map((manager, index) => (
                        <Menu.Item  key={index}>
                            <Icon type="user" />
                            {manager.userName}
                        </Menu.Item>
                )) : 
                null
            }
        </Menu>
    
    const getSubmitTitle = () => {
        if( assignee ) {
            return `הדוח יעבור לאישור ע"י ${assignee.userName}`;
        } else {
            return t('no_direct_manager');
        }
      
    }        

    const operations = <div>
                            <Tooltip placement='bottom' title={getSubmitTitle}>
                                <Popconfirm title={t('send_to_approval')} 
                                    onConfirm={onSubmit}>
                                    <Dropdown.Button type="primary" overlay={menu}
                                                        disabled={ isReportSubmitted || !reportDataValid }
                                        style={{
                                            marginRight: '6px'
                                        }}>
                                        {t('submit')}
                                    </Dropdown.Button>
                                </Popconfirm>
                            </Tooltip>
                            <Tooltip placement='bottom' title={t('validate_report')}>
                                <Button onClick={validateReport} 
                                        icon='check-circle'
                                        disabled={loadingData}>
                                    {t('validate')} 
                                </Button>
                            </Tooltip>
                            <Button onClick={onShowPDF}
                                    disabled={loadingData}
                                    icon='printer'
                                    style={{
                                        marginLeft: '4px'
                                    }}>
                                    {t('print')}
                            </Button>
                        </div>;

    let columns = [
        {
            title: 'יום',
            dataIndex: 'day',
            align: 'right',
            ellipsis: true,
            editable: false,
        }, {
            title: 'יום בשבוע',
            dataIndex: 'dayOfWeek',
            align: 'right',
            ellipsis: true,
            editable: false,
        }, {
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
        }, {
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
        }, {
            title: 'סיכום',
            dataIndex: 'total',
            align: 'right',
            editable: false,
        }, {
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
        }, {
            title: '',
            width: '3%',
            dataIndex: 'operation'
        }
    ];                        
                    
    const printReportTitle = () => (
        <div style={{
            margin: '0 auto'
        }}>
            {t('print_report')}
        </div>
    )

    const onReportDataChanged = async ( item, inouts ) => {
        dispatch(action_updateItem(item)) 

        let items = []
        if( inouts[0] ) { // entry time was changed for this item
            const foundIndex = manualUpdates.findIndex( arrayItem => {
                return arrayItem.day === item.day
                    && arrayItem.InOut === true
            });
            if( foundIndex === -1 ) {
                items = [...items, {
                    "Day": item.day,
                    "InOut": true
                }]
            }
    
        }
        if( inouts[1] ) { // exit time was changed
            const foundIndex = manualUpdates.findIndex( arrayItem => {
                return arrayItem.day === item.day
                    && arrayItem.InOut === false
            });
            if( foundIndex )
                items = [...items, {
                    "Day": item.day,
                    "InOut": false
                }]                            
        }
  
        setManualUpdates([...manualUpdates, ...items]);
    } 

    const getMonthName = (monthNum) => {
        return t('m'+monthNum)
    }

    const alertOpacity = loadingData ? 0.2 : 1.0;

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
                <Col span={10} >
                    {operations}
                </Col>
                <Col span={3} offset={11}>
                    <MonthPicker onChange={onMonthChange}
                                            disabledDate={disabledDate}
                                            className='ltr'
                                            value={calendarDate}
                                            allowClear={false}
                                            defaultValue={moment()} />
                </Col>
            </Row>
            <Row>
            { 
                <Alert closable={false}
                        style={{
                            opacity: alertOpacity,
                        }}
                        message={alertMessage}
                        className='hvn-item-rtl' 
                        showIcon 
                        type={alertType} />
            }
            </Row>
            <Row gutter={[32, 32]}>
                <Col span={5}>
                    <Row gutter={[40, 32]}>
                        <Col>
                            <Card title={ `סיכום חודשי: ${getMonthName(month)} ${year} ` } bordered={false}
                                className='rtl' loading={loadingData}>
                                <Pie percent={getTotalHoursPercentage()} 
                                     total={getTotalHoursPercentage() + '%'} 
                                     animate={false}
                                     subTitle={ `${totals} שעות`}
                                     height={180} />
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={t('abs_docs')} bordered={true}
                                className='rtl' loading={loadingData}>
                                <div style={{
                                    marginBottom: '12px'
                                }}>ניתן להעלות קבצי JPG/PNG/PDF</div>
                                <DocsUploader year={year} month={month} 
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
                                        employeKind={employeKind}
                                        reportCodes={reportCodes}
                                        daysOff={daysOff}
                                        manualUpdates={manualUpdates}
                                        loading={loadingData}
                                        scroll={{y: '400px'}}
                                        onChange={( item, inouts ) => onReportDataChanged(item, inouts) } 
                                        editable={isReportEditable}>
                            </TableReport>
                        </TabPane>
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
            <Modal title={printReportTitle()}
                    width='64%'
                    visible={printModalVisible}
                    closable={true}
                    forceRender={true}
                    onCancel={handlePrintCancel}
                    footer={[
                            <ReactToPrint key={uniqid()}
                                copyStyles={true}
                                removeAfterPrint={true}
                                trigger={() => <Button type="primary">{t('print')}</Button>}
                                documentTitle={`attendance report ${month}/${year}`}
                                content={() => componentRef.current}
                            />,
                            <Button key={uniqid()} onClick={handlePrintCancel}>{t('cancel')}</Button>
                        ]}>
                <div ref={componentRef} style={{textAlign: 'center'}} className='pdf-container'>
                    <div className='pdf-title'>{dataContext.user.name}</div>
                    <div className='pdf-title'>{t('summary')} {month}/{year}</div>
                    <TableReport dataSource={reportData}
                                employeKind={employeKind}
                                reportCodes={reportCodes}
                                daysOff={daysOff}
                                loading={loadingData} 
                                manualUpdates={manualUpdates}
                                editable={false} />
                    <Row>
                        <Col span={9} style={{
                            display: 'flex',
                            justifyContent: 'flex-end'
                        }}>
                            <Img className='footer-signature' src={signature} /> 
                        </Col>
                        <Col span={3}>
                            <div className='footer-print'>{t('signature')}</div>        
                        </Col>
                        <Col span={6}>
                            <div className='footer-print'>סה"כ { totals } שעות</div>
                        </Col>
                        <Col span={6}>
                            <div className='footer-print'>{t('printed_when')} {moment().format('DD/MM/YYYY')}</div>
                        </Col>
                    </Row>
                </div>
            </Modal>
        </Content>
    )
}

export default Home;
