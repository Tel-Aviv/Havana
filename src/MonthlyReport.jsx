// @flow
import React, {useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Img from 'react-image';
import i18n from 'i18next';

import { useTranslation } from "react-i18next";

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import {  Divider, Tag, Button, Modal } from 'antd';
import { Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

import ReactToPrint from 'react-to-print';

import Report from './components/Report/Report';
import { DataContext } from "./DataContext";
import ReportPDF from './ReportPDF';

type Props = {
    month: number,
    year: number
}

const MonthlyReport = (props: Props) => {

    const [month, setMonth] = useState(props.month);
    const [year, setYear] = useState(props.year);
    const [tableData, setTableData] = useState([])
    const [reportId, setReportId] = useState();
    const [loadingData, setLoadingData] = useState(false)

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

            setLoadingData(true)
            try {
                const url = `http://${dataContext.host}/me/reports?month=${props.month + 1}&year=${props.year}`;
                const resp = await axios(url, {
                    withCredentials: true
                }); 
                let reportId = 0;
                const data = resp.data.map( (item, index ) => {
                        const _item = {...item, key: index};
                        if( reportId === 0 )
                            reportId = item.reportId;
                        return _item;
                })
                setLoadingData(false)
                setReportId(reportId);
                setTableData(data)
            } catch(err) {
                console.error(err);
            }  finally {
                setLoadingData(false)
            }

            try {
                const resp = await axios(`http://${dataContext.host}/me/signature`, {
                    withCredentials: true
                });
                setSignature(resp.data)
            } catch(err) {
                console.error(err);
            }
        }
        fetchData()
    }, [props])

  
    const onSubmit = async () => {
        try {
            await axios({
                url: `http://${dataContext.host}/me/reports?month=${month + 1}&year=${year}&reportid=${reportId}`, 
                method: 'post',
                data: tableData,
                withCredentials: true
            })
        } catch(err) {
            console.error(err);
        }
    }

    const onShowPDF = () => {
        //history.push('/pdf');
        setModalVisible(!modalVisible);
    }

    const handlePrintCancel = () => {
        setModalVisible(false);
    }

    return (
        <Content style={{ margin: '0 16px' }}>

            <Title level={2} dir='rtl'>{t('title')} {t('for_month')} {month+1}.{year}</Title>
            <Report dataSource={tableData} loading={loadingData} editable={true}/>
            
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
                    <Report dataSource={tableData} loading={loadingData} editable={true}/>                   
                    <Img src={signature} /> 
                </div>
            </Modal>
            <Button type="primary" onClick={onSubmit}>{t('submit')}</Button>
            <Button type="primary" onClick={onShowPDF}>PDF</Button>
        </Content>
    )
}

export default MonthlyReport;