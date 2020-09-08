// @flow
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import moment from 'moment';
import uniqid from 'uniqid';

import { useTranslation } from "react-i18next";

import { Button, Typography, 
        Row, Col, Card, Tooltip, 
        Icon, Collapse, Alert } from 'antd';
const { Panel } = Collapse;
import { Input, Modal } from 'antd-rtl';

const { Title } = Typography;    

import { Layout } from 'antd';
const { Content } = Layout;
import { Pie } from 'ant-design-pro/lib/Charts';        
import ReactToPrint from 'react-to-print';

import { DataContext } from './DataContext';
import TableReport from './components/Reports/TableReport';
import DocsUploader from './components/DocsUploader';

import { DECREASE_NOTIFICATIONS_COUNT,
         INCREASE_NOTIFICATION_COUNT } from "./redux/actionTypes";

type Props = {
    month: number,
    year: number
}

const ref = React.createRef();

const Confirm = (props: Props) => {
    
    const [month, setMonth] = useState<number>(0);
    const [year, setYear] = useState<number>(0);
    const [savedReportId, setSavedReportId] = useState<number>(0);
    const [reportOwnerName, setReportOwnerName] = useState<string>('');
    const [totals, setTotals] = useState<number>(0);
    const [tableData, setTableData] = useState([])
    const [title, setTitle] = useState<string>('');
    const [isReportApproved, setIsReportApproved] = useState<bool>(false);
    const [isReportRejected, setReportRejected] = useState<bool>(false);
    const [isReportResubmitted, setReportResubmitted] = useState<bool>(false);
    const [reportNote, setReportNote] = useState<string>('')
    const [whenApproved, setWhenApproved] = useState();
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [notesModalVisible, setNotesModalVisible] = useState<boolean>(false);
    const [printModalVisible, setPrintModalVisible] = useState<boolean>(false);
    const [note, setNote] = useState<string>('');
    const [approvalSending, setApprovalSending] = useState<boolean>(false);
    const [manualUpdates, setManualUpdates] = useState();

    const history = useHistory();
    const componentRef = useRef();
    const context = useContext(DataContext)
    const { t } = useTranslation();
    const routeParams = useParams();
    const dispatch = useDispatch();

    useEffect( () => {

        async function fetchData() {

            setSavedReportId(routeParams.saveReportId);
            setLoadingData(true)
            try {

                const resp = context.API.get(`/me/employees/reports/${routeParams.saveReportId}`, {
                    withCredentials: true
                }); 

                const data = resp.data.items.map( (item, index ) => {
                    const _item = {...item, key: index};
                    return _item;
                })
                setTableData(data);            
                setTotals(`${Math.floor(resp.data.totalHours)}:${Math.round(resp.data.totalHours % 1 * 60).toString().padStart(2, '0')}`);   
                setIsReportApproved(resp.data.isApproved);
                setMonth(resp.data.month);
                setYear(resp.data.year);
                setReportOwnerName(resp.data.ownerName);
                setWhenApproved(moment(resp.data.whenApproved));
                setReportRejected(resp.data.isRejected);
                setReportResubmitted(resp.data.reSubmitted);
                setReportNote(resp.data.note);
                setTitle(`אישור דוח נוכחות של ${resp.data.ownerName} ל ${resp.data.month}/${resp.data.year}`);

                resp = await context.API.get(`/me/employees/manual_updates/${routeParams.userid}?year=${resp.data.year}&month=${resp.data.month}`, {
                    withCredentials: true
                })
                setManualUpdates(resp.data.items)

            } catch(err) {
                console.error(err);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData();
    }, []);

    const action_decreaseNotificationCount = () => ({
        type: DECREASE_NOTIFICATIONS_COUNT
    })

    const action_increaseNotificationCount = () => ({
        type: INCREASE_NOTIFICATION_COUNT
    })

    const onContinue = () => {
        setNotesModalVisible(true);
    }    

    const onForward = async() => {
        try {
        
            const _note = note || '';
            await context.API.get(`/me/forwardSavedReport?savedReportGuid=${savedReportId}&note=${_note}`, {
                withCredentials: true
            })

            dispatch(action_decreaseNotificationCount());

        } catch(err) {
            console.error(err)
        } finally {

            const timer = setTimeout(() => {
                setApprovalSending(false);
                setNotesModalVisible(false);

                clearTimeout(timer);
                
                history.push(`/confirmlist`);
            }, 2500);            
        }

    }

    const onApprove = async() => {

        try {

            setApprovalSending(true);
            const timer = setTimeout(() => {
                setApprovalSending(false);
                setNotesModalVisible(false);

                clearTimeout(timer);
                
                history.push(`/confirmlist`);
            }, 4000);

            dispatch( action_decreaseNotificationCount() );

            await context.API.patch(`/me/pendings/saved/${savedReportId}?note=${note}`, {
                    html: ref.current.outerHTML
                }, 
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                })
            
        } catch( err ) {
            console.error(err.message)
        }
    }

    const onReject = async() => {
        try {

            setApprovalSending(true);
            const timer = setTimeout(() => {
                setApprovalSending(false);
                setNotesModalVisible(false);

                clearTimeout(timer);
                
                history.push(`/confirmlist`);
            }, 4000);

            await context.API.patch(`/me/pendings/rejected/${savedReportId}?note=${note}`, 
                {}, 
                { withCredentials: true })
            
        } catch( err ) {
            console.error(err.message)
        }
    }

    
    const onNotesModalClosed = () => {
        setNotesModalVisible(false)
    }

    const onNotesChanged = evt => {
        setNote(evt.target.value)
    }

    const getTotalHoursPercentage = () => {
        return Math.floor( parseFloat(totals) / 160. * 100 );
    }

    const onPrint = () => {
        setPrintModalVisible(!printModalVisible);
    }

    const handlePrintCancel = () => {
        setPrintModalVisible(false);
    }

    const formatAlertMessage = () => {
        if( isReportResubmitted )
            return `${t('resubmitted_header')} : ${reportNote}`;
        else if( isReportRejected )
            return `${t('rejected_note')} : ${reportNote}`;
        else    
            return t('approval_status');
    }

    return (
        <Content>
            <Title level={1} className='hvn-title'>{title}</Title>
                <Row  className='hvn-item-ltr' align={'middle'} type='flex'>
                    <Col span={2} >
                        {
                            isReportApproved ? (
                                    <Button
                                    icon='printer'
                                    onClick={onPrint}>
                                        {t('print')}
                                    </Button>
                                )
                                : (
                                    <Button type='primary' loading={approvalSending}
                                            onClick={ () => onContinue() }>
                                                {t('continue')}
                                    </Button>                
                                )
                        }
                    </Col>
                    <Col span={22}>
                        <Alert closable={false} 
                            message={formatAlertMessage()}
                            showIcon 
                            className='hvn-item-rtl' 
                            type={ isReportRejected ? 'error' : 'info'}/>
                    </Col>
                </Row>
            <Row gutter={[32, 32]} style={{
                    margin: '0% 4%' 
                }}>
                <Col span={8}>
                    <Row gutter={[40, 32]}>
                        <Col>
                            <Card title='סיכום חודשי' bordered={false}
                                className='rtl' loading={loadingData}>
                                    <div>סה"כ { totals } שעות</div>
                                    <Pie percent={getTotalHoursPercentage()} total={getTotalHoursPercentage() + '%'} height={140} />
                            </Card>                
                        </Col>
                    </Row>
                    <Row gutter={[32, 32]}>
                        <Col>
                            <Card title={t('abs_docs')} bordered={true}
                                className='rtl'>
                                <DocsUploader year={year} month={month} 
                                            employeeId={routeParams.userid}
                                            isOperational={false}/>
                            </Card>
                        </Col>                    
                    </Row>
                </Col>
                <Col span={16}>
                    <div className='hvn-item'>
                        <div ref={ref}>
                            <TableReport dataSource={tableData} 
                                        loading={loadingData} 
                                        manualUpdates={manualUpdates}
                                        scroll={{y: '400px'}}
                                        editable={false} />

                        </div>
                    </div>
                </Col>
            </Row>
            <Modal width='54%'
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
                <div className='pdf-title'>{reportOwnerName}</div>
                    <div className='pdf-title'>{t('summary')} {month}/{year}</div>
                    <TableReport dataSource={tableData} 
                                        loading={loadingData} 
                                        manualUpdates={manualUpdates}
                                        editable={false} />
                    <Row>
                        <Col span={6}>
                            <div className='footer-print'>סה"כ { totals } שעות</div>
                        </Col>
                        <Col span={6}>
                            { 
                                whenApproved ?
                                    <div className='footer-print'>{t('approved_when')} {whenApproved.format('DD/MM/YYYY')}</div> :
                                    null
                            }
                        </Col>                        
                    </Row>
                </div>                                        
            </Modal>
            <Modal closable={false} 
                    className='rtl'
                    visible={notesModalVisible}
                    title={t('notes_for_report')}
                    footer={
                        [
                            <Button key='cancel' onClick={onNotesModalClosed} style={{
                                marginRight: '8px'
                            }}>{t('cancel')}</Button>,
                            <Tooltip key='reject' title={t('reject_tooltip')}>
                                <Button onClick={onReject} type='danger' style={{
                                    marginLeft: '8px'
                                }}>
                                    {t('reject')}
                                </Button>
                            </Tooltip>,
                            <Tooltip key='forward' title={t('forward_tooltip')}>
                                <Button type="primary"
                                        style={{
                                            direction: 'ltr',
                                            marginRight: '8px'
                                        }} onClick={onForward}>
                                    {t('move_to')}
                                </Button>
                            </Tooltip>        ,
                            <Tooltip key='approve' title={t('approve_tooltip')}>
                                <Button type="primary" 
                                    style={{
                                        direction: 'ltr'
                                    }}
                                     onClick={onApprove} >
                                         {t('approve')}
                                </Button> 
                            </Tooltip>                                    
                        ]
                    }
                   >
                <div>   
                    <Input placeholder='הזן הערות במידת הצורך'
                        className='rtl' 
                        onChange={onNotesChanged} />
                    <div style={{
                        marginTop: '8px'
                    }}>הערות תשלחנה בדוא"ל לבעל הדוח</div>
                </div>       
            </Modal>
        </Content>
    )
}

export default Confirm;