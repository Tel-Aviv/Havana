// @flow
import React, {useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Img from 'react-image';
import i18n from 'i18next';
import { useTranslation, Trans } from "react-i18next";

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { Table, Divider, Tag, Button, Modal } from 'antd';
import { Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

import ReactToPrint from 'react-to-print';

import { DataContext } from "./DataContext";
import ReportPDF from './ReportPDF';

type Props = {
    month: number,
    year: number
}

const columns = [{
        title: 'תאריך',
        dataIndex: 'day',
        key: 'day'
    }, {
        title: "כניסה",
        dataIndex: "entry",
        key: "entry"
    }, {
        title: "יציאה",
        dataIndex: "exit",
        key: "exit"
    }, {
        title: "סה",
        dataIndex: "total",
        key: "total"
    },{
        title: "הערות",
        dataIndex: "notes",
        key: "notes",
        render: (notes, record) => {
            let note = !record.entry ? 'no_entry' : '';
            if( !note ) {
                note = !record.exit ? 'no_exit' : '';
            }
            
            return (<span>
                <Tag color='volcano'>
                    <Trans i18nKey={note} />
                </Tag>
            </span>)
        }
    }
];

const MonthlyReport = (props: Props) => {

    const [month, setMonth] = useState(props.month);
    const [year, setYear] = useState(props.year);
    const [tableData, setTableData] = useState([])
    const [modalVisible, setModalVisible] = useState(false);
    const [signature, setSignature] = useState()

    const dataContext = useContext(DataContext);
    const history = useHistory();
    const componentRef = useRef();

    const { t } = useTranslation();

    useEffect( () => {

        async function fetchData() {
            
            setMonth(props.month)
            setYear(props.year)

            const url = `http://${dataContext.host}/api/v1/report/${dataContext.user.id}?m=${month}&y=${year}`;
            let resp = await axios(url, {
                withCredentials: true
            }); 
            const data = resp.data.map( (item, index ) => {
                    const _item = {...item, key: index};
                    _item.day = `${item.day} ${item.dayOfWeek}`;
                    return _item;
            })
            setTableData(data)

            resp = await axios('http://localhost:5000/me/signatute', {
                withCredentials: true
            });
            setSignature(resp.data)

        }
        fetchData()
    }, [props])

    const onShowPDF = () => {
        //history.push('/pdf');
        setModalVisible(!modalVisible);
    }

    const handlePrintCancel = () => {
        setModalVisible(false);
    }

    return(
        <Content style={{ margin: '0 16px' }}>
            <Title level={2} dir='rtl'>{t('title')} {t('for_month')} {month+1}.{year}</Title>
            <Table dataSource={tableData} columns={columns}
                    pagination={false} bordered={true}>
            </Table>
            
            <Modal title="Print Report"
                    visible={modalVisible}
                    footer={[
                            <ReactToPrint removeAfterPrint={true}
                                trigger={() => <Button type="primary">Print</Button>}
                                content={() => componentRef.current}
                            />,
                            <Button onClick={handlePrintCancel}>Cancel</Button>
                        ]}>
                <div ref={componentRef}>
                    <Title level={3} dir='rtl'>{dataContext.user.name}</Title>
                    <Title level={4} dir='rtl'>{t('title')} {t('for_month')} {month+1}.{year}</Title>
                    <Table dataSource={tableData} columns={columns}
                            pagination={false} bordered={true}>
                    </Table>                     
                    <Img src={signature} /> 
                </div>
            </Modal>
            <Button type="primary">{t('submit')}</Button>
            <Button type="primary" onClick={onShowPDF}>PDF</Button>
        </Content>
    )
}

export default MonthlyReport;