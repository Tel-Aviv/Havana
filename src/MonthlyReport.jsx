// @flow
import React, {useState, useEffect, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import Img from 'react-image'

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { Table, Divider, Tag, Button, Modal } from 'antd';

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
        title: "Total",
        dataIndex: "total",
        key: "total"
    },{
        title: "הערות",
        dataIndex: "notes",
        key: "notes"
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

    useEffect( () => {

        async function fetchData() {
            
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
    }, [])

    const onShowPDF = () => {
        //history.push('/pdf');
        setModalVisible(!modalVisible);
    }

    const handlePrintCancel = () => {
        setModalVisible(false);
    }

    return(
        <Content style={{ margin: '0 16px' }}>
            <Table dataSource={tableData} columns={columns}>
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
                    <Table dataSource={tableData} columns={columns}>
                    </Table>                     
                    <Img src={signature} /> 
                </div>
            </Modal>
            <Button type="primary">Submit</Button>
            <Button type="primary" onClick={onShowPDF}>PDF</Button>
        </Content>
    )
}

export default MonthlyReport;