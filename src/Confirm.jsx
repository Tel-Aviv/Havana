// @flow
import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import uniqid from 'uniqid';

import { useTranslation, Trans } from "react-i18next";

import {  Divider, Tag, Button, Typography, 
        Row, Col, Card, Modal } from 'antd';
import { Input } from 'antd-rtl';

const { Title } = Typography;    

import { Layout } from 'antd';
const { Content } = Layout;
import { Pie } from 'ant-design-pro/lib/Charts';        

import { DataContext } from './DataContext';
import TableReport from './components/Reports/TableReport';
import DocsUploader from './components/DocsUploader';

import { DECREASE_NOTIFICATIONS_COUNT } from "./redux/actionTypes";

type Props = {
    month: number,
    year: number
}

const ref = React.createRef();

const Confirm = (props: Props) => {
    
    const [month, setMonth] = useState<number>(0);
    const [year, setYear] = useState<number>(0);
    const [reportId, setReportId] = useState<number>(0);
    const [savedReportId, setSavedReportId] = useState<number>(0);
    const [totals, setTotals] = useState<number>(0);
    const [tableData, setTableData] = useState([])
    const [title, setTitle] = useState<string>('');
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [notesModalVisible, setNotesModalVisible] = useState<boolean>(false);
    const [note, setNote] = useState<string>('');
    const [approvalSending, setApprovalSending] = useState<boolean>(false);

    const history = useHistory();

    const dataContext = useContext(DataContext)

    const { t } = useTranslation();

    const routeParams = useParams();

    const dispatch = useDispatch();

    useEffect( () => {

        async function fetchData() {

            setMonth(props.month)
            setYear(props.year)

            setLoadingData(true)
            try {

                let resp;
                if( routeParams.reportId == 0 ) {

                    resp = await axios(`http://${dataContext.host}/me/reports/saved?savedReportGuid=${routeParams.saveReportId}`, {
                        withCredentials: true
                    }); 
                    setSavedReportId(routeParams.saveReportId);

                    const data = resp.data.items.map( (item, index ) => {
                        const _item = {...item, key: index};
                        // if( reportId === 0 )
                        //     reportId = item.reportId;
                        return _item;
                    })
                    setTableData(data);
                    setReportId(0);

                } else {

                    resp = await axios(`http://${dataContext.host}/me/employees/reports/${routeParams.reportId}`, {
                        withCredentials: true
                    }); 

                    let reportId = 0;
                    const data = resp.data.items.map( (item, index ) => {
                        const _item = {...item, key: index};
                        if( reportId === 0 )
                            reportId = item.reportId;
                        return _item;
                    })
                    setTableData(data);               
                    setReportId(reportId);
                }

                setTotals(resp.data.totalHours);
                setTitle(`אישור דוח נוכחות של ${resp.data.ownerName} ל ${resp.data.month}/${resp.data.year}`);

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

    const onContinue = () => {
        setNotesModalVisible(true);
    }    

    const onForward = async() => {
        try {
        
            const _note = note || '';
            if( reportId == 0 ) {
                await axios( `http://${dataContext.host}/me/forwardSavedReport?savedReportGuid=${savedReportId}&note=${_note}`, {
                    withCredentials: true
                })

            }
            else {
                await axios( `http://${dataContext.host}/me/forwardReport?reportId=${routeParams.reportId}&note=${_note}`, {
                    withCredentials: true
                })
            }

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
            }, 2500);

            let url = `http://${dataContext.host}/me/pendings/${routeParams.reportId}?note=${note}`;
            if( reportId == 0 )
            {
                url = `http://${dataContext.host}/me/pendings/saved/${savedReportId}?note=${note}`
            }

            await axios.patch(url, {html: ref.current.outerHTML}, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            })

            dispatch(action_decreaseNotificationCount());

            
        } catch( err ) {
            console.error(err)
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

    return (
        <Content>
            <Title level={1} className='hvn-title'>{title}</Title>
            <Row  className='hvn-item-ltr' align={'middle'} type='flex'>
                <Col span={4} >
                    <Button type="primary" loading={approvalSending}
                            style={{
                                marginBottom: '8px'
                            }}   
                            onClick={ () => onContinue() }>
                                {t('continue')}
                    </Button>                
                </Col>
            </Row>
            <Row gutter={[32, 32]} style={{
                    margin: '0% 4%' 
                }}>
                <Col span={8}>
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
                                className='rtl'>
                                <DocsUploader reportId={reportId} 
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
                                        editable={false} />

                        </div>
                    </div>
                </Col>
            </Row>
            <Modal closable={false} 
                    className='rtl'
                    visible={notesModalVisible}
                    title={t('notes_for_report')}
                    footer={
                        [
                            <Button key='approve' type="primary" 
                                    style={{
                                        direction: 'ltr'
                                    }}
                                     onClick={onApprove} >{t('approve')}</Button>,
                            <Button key='forward' type="danger"
                                    style={{
                                        direction: 'ltr',
                                        marginRight: '8px'
                                    }} onClick={onForward}>{t('move_to')}</Button>,
                            <Button key='cancel' onClick={onNotesModalClosed} style={{
                                marginRight: '8px'
                            }}>{t('cancel')}</Button>
                        ]
                    }
                   >
                <div>   
                    <Input placeholder='הזן הערות במידת הצורך'
                        className='rtl' 
                        onChange={onNotesChanged} />
                    <div style={{
                        marginTop: '8px'
                    }}>הערות תשלחנה בדוא"ל לבעל הדוח רק במקרה של אישור</div>
                </div>       
            </Modal>
        </Content>
    )
}

export default Confirm;