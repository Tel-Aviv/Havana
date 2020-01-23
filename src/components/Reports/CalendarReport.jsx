// @flow
import React, { useState, useEffect, useCallback }  from 'react';
import moment from 'moment';
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import { SET_REPORT_DATE } from '../../redux/actionTypes';

import { Divider, Tag, Button, Modal, Icon,
        Calendar, Badge, Card,
        Row, Col, TimePicker 
} from 'antd';

import CustomTimePicker from '../CustomTimePicker'

type Props = {
    tableData: [],
    value: moment
}

const CalendarReport = (props: Props) => {

    const [tableData, setTableData] = useState(props.tableData);
    const [calendarDate, setCalendarDate] = useState(props.value);
    const [selectedDay, setSelectedDay] = useState();
    const [dayModalVisible, setDayModalVisible] = useState(false);
    const [entryTimes, setEntryTimes] = useState([]);
    const [exitTimes, setExitTimes] = useState([]);

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const setReportDate = (date: moment) => ({ 
        type: SET_REPORT_DATE,
        data: date
    });

    useEffect( () => {
        setCalendarDate(props.value);
        setTableData(props.tableData);
    }, [props])

    const onCalendarDaySelected = (value) => {
        setSelectedDay(value.format('DD/MM/YYYY'))
        const tableDataItems = tableData.filter( item => {
            const itemDate = moment(item.rdate);
            return value.isSame(itemDate, 'day');
        })
        if( tableDataItems.length == 0 ) 
            return;

        setEntryTimes(tableDataItems.map( item => item.entry));
        setExitTimes(tableDataItems.map( item => item.exit));
        setDayModalVisible(true);
    }

    const dayModalCancel = () => {
        setDayModalVisible(false);
    }

    const dayModalOK = () => {
        setDayModalVisible(false);
    }

    const dateCellRender = (value) => {

        if( tableData.length === 0 )
            return null;

        const tableDataItems = tableData.filter( item => {
            const itemDate = moment(item.rdate);
            return value.isSame(itemDate, 'day');
        })
        if( tableDataItems.length == 0 ) 
            return;

        return <ul className="events" dir='rtl'>
            {
                tableDataItems.map( (tableDataItem, index) => {

                    const { total, notes, exit, entry } = tableDataItem;
                    let _notes = ( exit ===  '') ? t('missing_out') : notes;
                    _notes = ( entry === '' )? t('missing_in') : _notes;

                    return <li key={index}><Badge status='error' text={_notes} /></li>
                })
            }
        </ul>;

    }

    const onReportDateChange = (date: moment) => {
        setCalendarDate(date);
        dispatch(setReportDate(date));
    }

    const onTimeChange = () => {
        console.log('ddd');
        
    }

    const getTimeField = (time) => (        
        time ? 
            <div>{time}</div> :
            <TimePicker allowClear={false} 
                        format={'H:mm'}
                        size="small"
                        addon={() => (
                            <Button size="small" type="primary" onClick={onTimeChange}>
                                Ok
                            </Button>
                        )}/>
    )

    return <>
        <Calendar dateCellRender={dateCellRender} 
                    defaultValue={moment()}
                    value={calendarDate}
                    onChange={onReportDateChange}
                    fullscreen={true}
                    validRange={[moment().add(-12, 'month'), moment()]}
                    onSelect={onCalendarDaySelected}/>
        <Modal closable={false} 
                className='rtl'
                title={selectedDay}
                visible={dayModalVisible}
                footer={
                    [
                        <Button type="primary" onClick={dayModalOK}>OK</Button>,
                        <Button onClick={dayModalCancel}>{t('cancel')}</Button>
                    ]
                }>
                <div>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Row gutter={[16, 16]}>
                            {
                                exitTimes.map( item => (
                                    <>
                                            <Col span={16}>{getTimeField(item)}</Col>
                                            <Col span={5}>{t('out')}</Col>
                                            <Col span={1}><Icon type="logout" /></Col>

                                    </>    
                                ))
                            }
                            </Row>
                        </Col>                    

                        <Col span={12}>
                            <Row gutter={[16, 16]}>
                            {
                                entryTimes.map( item => (
                                    <>
                                        <Col span={16}>{ getTimeField(item) }</Col>
                                        <Col span={5}>{t('in')}</Col>
                                        <Col span={1}><Icon type="login" /></Col>
                                    </>
                                ))
                            }
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Modal>
         </>   

}

export default(CalendarReport);