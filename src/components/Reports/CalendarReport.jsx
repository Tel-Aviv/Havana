// @flow
import React, { useState, useEffect, useCallback, useRef }  from 'react';
import moment from 'moment';
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import { SET_REPORT_DATE, UPDATE_ITEM } from '../../redux/actionTypes';

import { Divider, Tag, Button, Modal, Icon,
        Calendar, Badge, Card,
        Row, Col, TimePicker, Input
} from 'antd';

import { DatePicker } from 'antd';
const { MonthPicker } = DatePicker;

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
        dispatch(action_SetReportDate(date));
    }

    const componentRef = useRef();

    const onTimeChanged = (item, time) => {
        dispatch(action_ItemChanged({
            id: item.id,
            exit: time,
            type: item.type
        }));
    }

    const getTimeField = (item, time) => (
        time ? 
            <div>{time}</div> :
            <XTimePicker ref={componentRef} item={item} onChanged={onTimeChanged}/>
    )

    const XTimePicker = React.forwardRef( (props, ref) => {
        
        const [open, setOpen] = useState(false);
        const [selectedTime, setSelectedTime] = useState();

        const handleOk = () => {
            setOpen(false)
            if( props.onChanged )
                props.onChanged(props.item, selectedTime);
        }
        const onChange = (time, timeString) => {
            setSelectedTime(timeString);
        }
        return <TimePicker ref={ref}
                    className='ltr'
                    {...props}
                    allowClear={false}
                    format={'H:mm'}
                    open={open}
                    size='small'
                    onChange={onChange}
                    onOpenChange={(e) => setOpen(e)}
                    addon={ () => (
                        <Button size='small' type='primary' 
                                style={{
                                    width: '100%'
                                }}    
                                onClick={handleOk}>OK</Button>
                    )}/>
    })

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
                        <Button key='approve' type="primary" onClick={dayModalOK}>{t('approve')}</Button>,
                        <Divider key='divider' type="vertical" />,
                        <Button key='cancel' onClick={dayModalCancel}>{t('cancel')}</Button>
                    ]
                }
                >
                <Card>
                    <Row gutter={[16, 16]}>
                    {
                        exitTimes.map( item => {
                            return (<>
                                <Col span={8}>
                                    {
                                        getTimeField(item, item.exit)
                                    }
                                </Col>                     
                                <Col span={3}>
                                    {t('out')}
                                </Col>
                                <Col span={1}>
                                    <Icon type="logout" />
                                </Col>
                            </>)
                        })
                    }
                    {
                        entryTimes.map( item => {
                            return (<>
                                    <Col span={8}>
                                    {
                                        getTimeField(item, item.entry)
                                    }
                                    </Col>    
                                    <Col span={3}>
                                        <div>{t('in')}</div>
                                    </Col>
                                    <Col span={1}>
                                        <Icon type="login" />
                                    </Col>
                            </>)
                        })
                    }
                    </Row>
                    <br />
                    <Row gutter={[16, 16]}>
                        <Col span={20}>
                            <Input size='small' />
                        </Col>
                        <Col span={4}>
                            <div className='rtl'>{t('notes')}</div>
                        </Col>
                    </Row>
                </Card>
            </Modal>
         </>   

}

export default(CalendarReport);