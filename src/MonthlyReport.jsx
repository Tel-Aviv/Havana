// @flow
import React, {useState, useEffect, useContext} from 'react';
import axios from 'axios';

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { Divider, Tag, Button } from 'antd';

import Table from './components/Table/Table';
import { DataContext } from "./DataContext";

type Props = {
    month: number,
    year: number
}


const MonthlyReport = (props: Props) => {

    const [month, setMonth] = useState(props.month);
    const [year, setYear] = useState(props.year);
    const [tableData, setTableData] = useState([])
    const [loadingData, setLoadingData] = useState(false)

    const dataContext = useContext(DataContext)

    useEffect( () => {  

        async function fetchData() {
            setLoadingData(true)
            //const url = `http://${dataContext.host}/api/report/${dataContext.user.id}?year=${year}&month=${month}`;
            const url = `http://${dataContext.host}/me/reports/?year=2019&month=12`;
            const resp = await axios(url, {
                withCredentials: true
            }); 
            const data = resp.data.map( (item, index ) => {
                    const _item = {...item, key: index};
                    // _item.day = `${item.day} ${item.dayOfWeek}`;
                    return _item;
            })
            setTableData(data)
            setLoadingData(false)
        }
        fetchData()
    }, [])

    return (
        <Content style={{ margin: '0 16px' }}>
            <Table dataSource={tableData} loading={loadingData}/>
        </Content>
    )
}

export default MonthlyReport;