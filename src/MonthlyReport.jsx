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
            const resp = await axios(url); 
            const data = resp.data.map( (item, index ) => {
                    const _item = {...item, key: index};
                    _item.day = `${item.day} ${item.dayOfWeek}`;
                    return _item;
            })
            setTableData(data)

            const _resp = await axios('http://localhost:5000/me/signatute');
            // setSignature(btoa(_resp.data));
            var fileReader = new FileReader();
            fileReader.onload = function(fileLoadedEvent) {
                var srcData = fileLoadedEvent.target.result;
                console.log(srcData);
            }
            // fileReader.readAsDataURL('http://localhost:5000/me/signatute');

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

    // const signatureSrc = 'data:image/png;base64,' + signature;

    return(
        <Content style={{ margin: '0 16px' }}>
            <Table dataSource={tableData} columns={columns}
                    ref={componentRef}>
            </Table>
            <Img src='data:image/png;base64,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' decode={false} />
            <Modal title="Print Report"
                    visible={modalVisible}
                    footer={[
                            <ReactToPrint removeAfterPrint={true}
                                trigger={() => <Button type="primary">Print</Button>}
                                content={() => componentRef.current}
                            />,
                            <Button onClick={handlePrintCancel}>Cancel</Button>
                        ]}>
            </Modal>
            <Button type="primary">Submit</Button>
            <Button type="primary" onClick={onShowPDF}>PDF</Button>
        </Content>
    )
}

export default MonthlyReport;