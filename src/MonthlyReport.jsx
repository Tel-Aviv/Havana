// @flow
import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { Table, Divider, Tag, Button } from 'antd';

import { DataContext } from "./DataContext";

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

    const dataContext = useContext(DataContext)

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

        }
        fetchData()
    }, [])

    return(
        <Content style={{ margin: '0 16px' }}>
            <Table dataSource={tableData} columns={columns}>
            </Table>
            <Button type="primary">Submit</Button>
        </Content>
    )
}

export default MonthlyReport;