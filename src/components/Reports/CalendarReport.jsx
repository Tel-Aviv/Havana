// @flow
import React, { useState, useEffect, useCallback }  from 'react';
import moment from 'moment';
import { useTranslation } from "react-i18next";
import uniqid from 'uniqid';
import { useSelector, useDispatch } from 'react-redux';
import { SET_REPORT_DATE, UPDATE_ITEM } from '../../redux/actionTypes';

import {
    LoginOutlined,
    LogoutOutlined
} from '@ant-design/icons';

import { Divider, Tag, Button, Modal,
        Calendar, Badge, Card,
        Row, Col, TimePicker, Input
} from 'antd';


import XTimePicker from '../XTimePicker'

type Props = {
    tableData: [],
    value: moment
}

const CalendarReport = (props: Props) => {

    const [tableData, setTableData] = useState(props.tableData);
    const [selectedDayItems, setSelectedDayItems] = useState([]);
    const [calendarDate, setCalendarDate] = useState(props.value);
    const [selectedDay, setSelectedDay] = useState();
    const [dayModalVisible, setDayModalVisible] = useState(false);
    const [entryTimes, setEntryTimes] = useState([]);
    const [exitTimes, setExitTimes] = useState([]);

    const dispatch = useDispatch();

    const { t } = useTranslation();

    const action_SetReportDate = (date: moment) => ({ 
        type: SET_REPORT_DATE,
        data: date
    });

    const action_ItemChanged = (item) => ({
        type: UPDATE_ITEM,
        item: item
    });

    useEffect( () => {

        setCalendarDate(props.value);
        const _tableDataItems = props.tableData.map( item => {
                return {
                    ...item,
                    validationPassed: true,
                    isValid : () => {
                        const res = item.exit !== "0:00" && item.entry !== "0:00";
                        return res;
                    }
                }
        })

        setTableData(_tableDataItems);
    }, [props])

    const onCalendarDaySelected = (value) => {

        setSelectedDay(value.format('DD/MM/YYYY'))
        const tableDataItems = tableData.filter( item => {
            const itemDate = moment(item.rdate);
            return value.isSame(itemDate, 'day');
        })
        if( tableDataItems.length == 0 ) 
            return;

        setSelectedDayItems(tableDataItems)

        setEntryTimes(tableDataItems.map( item => (
                                            {
                                                id: item.id,
                                                entry: item.entry,
                                                type: 'entry'
                                            })));
        setExitTimes(tableDataItems.map( item => (
                                            {
                                                id: item.id,
                                                exit: item.exit,
                                                type: 'exit'
                                            })));
        setDayModalVisible(true);
    }

    const dayModalCancel = () => {
        setDayModalVisible(false);
    }

    const dayModalOK = () => {

        if( validateData() ) {
            dispatch(
                action_ItemChanged({
                                    id: item.id,
                                    exit: time,
                                    type: item.type
                                    })
            );            
            setDayModalVisible(false);
        }
    }

    const validateData = () => {

        let result = selectedDayItems.reduce( (isValid, item) => {
            const _isValid = item.isValid();
            item.validationPassed = _isValid;
            return _isValid;
        }, false);

        return result;
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
                    const tagColor = ( notes ===  '')? 'green' : 'volcano';
                    const _text = ( notes ===  '')? `סה"כ: ${total}` : notes;

                    return (
                        <li key={index}
                                    style={{
                                            float: 'right',
                                            marginRight: '13%'
                                    }}>
                                <Tag color={tagColor}>{_text}</Tag>
                        </li>)

                })
            }
        </ul>;

    }

    const onReportDateChange = (date: moment) => {
        setCalendarDate(date);
        dispatch(action_SetReportDate(date));
    }

    const onTimeChanged = (item, time) => {
    }

    const getTimeField = (item, time) => (
        time !== '0:00' ? 
            <div>{time}</div> :
            <XTimePicker item={item} onTimeSelected={onTimeChanged}/>

    )

    return <>
        <Calendar  className='rtl'
                    dateCellRender={dateCellRender} 
                    defaultValue={moment()}
                    value={calendarDate}
                    onChange={onReportDateChange}
                    fullscreen={true}
                    validRange={[moment().add(-12, 'month'), moment()]}
                    onSelect={onCalendarDaySelected}/>
        <Modal closable={true} 
                className='rtl'
                title={selectedDay}
                visible={dayModalVisible}
                footer={
                    [
                        <Button key='approve' type="primary" onClick={dayModalOK}>{t('approve')}</Button>,
                        <Button key='cancel' onClick={dayModalCancel} style={{
                                marginRight: '8px'
                            }}>{t('cancel')}</Button>
                    ]
                }
                >
                <Card>
                    {
                        selectedDayItems.map( item => {
                        return (
                                <React.Fragment key={uniqid()}>
                                <Card type="inner" hoverable>
                                    <Row>
                                        <Col span={12}>
                                            <Row style={{
                                                display: 'flex'
                                            }}>
                                                <Col span={2}>
                                                    <LogoutOutlined />
                                                </Col>
                                                <Col span={5}>
                                                    {t('out')}
                                                </Col>
                                                <Col span={5}>
                                                {
                                                    getTimeField(item, item.exit)
                                                }
                                                </Col>
                                            </Row>
                                        </Col>
                                        <Col span={12}>
                                            <Row style={{
                                                display: 'flex'
                                            }}>
                                                <Col span={2}>
                                                    <LoginOutlined />
                                                </Col>
                                                <Col span={5}>
                                                    {t('in')}
                                                </Col>
                                                <Col span={5} >
                                                {
                                                    getTimeField(item, item.entry)
                                                }
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    {
                                        ( !item.isValid() ) ?
                                        <>
                                            <Row gutter={[16, 16]}>
                                                <Col span={20}>
                                                    <Input size='small' />
                                                </Col>
                                                <Col span={4}>
                                                    <div className='rtl'>{t('notes')}</div>
                                                </Col>
                                            </Row>
                                            {
                                                ( !item.validationPassed) ? 
                                                    <Row>
                                                        <Col span={20}>
                                                            <div className='label-has-error'>{t('missing_notes')}</div>
                                                        </Col>
                                                    </Row>: null
                                            }
                                        </> : null
                                    }
                                </Card>
                                <br />
                                </React.Fragment >
                            )
                            }
                        )}
                </Card>
            </Modal>
         </>   

}

export default(CalendarReport);