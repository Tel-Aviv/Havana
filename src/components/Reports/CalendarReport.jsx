// @flow
import React, { useState, useEffect, useCallback }  from 'react';
import moment from 'moment';
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from 'react-redux';
import { SET_REPORT_DATE } from '../../redux/actionTypes';

import {  Divider, Tag, Button, Modal } from 'antd';
import { Calendar, Badge, Card } from 'antd';
import { Row, Col } from 'antd';

type Props = {
    tableData: [],
    value: moment
}

const CalendarReport = (props: Props) => {

    const [tableData, setTableData] = useState(props.tableData);
    const [calendarDate, setCalendarDate] = useState(props.value);
    const [selectedDay, setSelectedDay] = useState();
    const [dayModalVisible, setDayModalVisible] = useState(false);

    const dispatch = useDispatch();
    // const incrementCounter = useCallback(
    //     () => dispatch({ type: SET_REPORT_DATE }),
    //     [dispatch]
    // )    

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
        const tableDataItem = tableData.find( item => {
            const itemDate = moment(item.date);
            return value.isSame(itemDate, 'day');
        })
        if( tableDataItem ) {
            setDayModalVisible(true);
        }
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

        const tableDataItem = tableData.find( item => {
            const itemDate = moment(item.date);
            return value.isSame(itemDate, 'day');
        })
        if( !tableDataItem ) {
            // console.error(`DataTable item not found for ${value.toString()}`);
            return;
        }
        const { date, total, notes } = tableDataItem;

        const badge = <Badge status='error' text={notes} />;
        if( !total )
            return (
                <ul className="events">
                    <li>
                        <Badge status='error' text={notes} />
                    </li>
                </ul>
            )
        else {    
            return (
                <ul className="events">
                    <li>
                        <Badge status='success' text={notes} />
                    </li>
                </ul>
            )
        }
    }

    const onChange = (date: moment) => {
        setCalendarDate(date);
        dispatch(setReportDate(date));
    }

    return <>
        <Calendar dateCellRender={dateCellRender} 
                    defaultValue={moment()}
                    value={calendarDate}
                    onChange={onChange}
                    fullscreen={true}
                    onSelect={onCalendarDaySelected}/>
        <Modal title={selectedDay}
                visible={dayModalVisible}
                footer={
                    [
                        <Button type="primary" onClick={dayModalOK}>OK</Button>,
                        <Button onClick={dayModalCancel}>{t('cancel')}</Button>
                    ]
                }>
                <Row gutter={[16, 16]}>
                    <Col>
                        <div>In</div>
                        <div>10:44</div>
                    </Col>
                    <Col>
                        <div>Out</div>
                        <div>10:45</div>
                    </Col>                    
                </Row>
            </Modal>
         </>   

}

export default(CalendarReport);