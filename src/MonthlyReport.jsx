// @flow
import React, {useState, useEffect} from 'react';
import axios from 'axios';

import { Layout, Menu, Breadcrumb, Icon } from 'antd';
const { Header, Content, Footer, Sider } = Layout;

import { Table, Divider, Tag } from 'antd';

type Props = {
    month: number,
    year: number
}

const columns = [{
        title: 'תאריך',
        key: 'name',
         render: text => <a>{text}</a>,
    }, {
        title: 'Age',
        key: 'age',
    }
];

const MonthlyReport = (props: Props) => {

    const {month, year} = props;
    const [tableData, setTableData] = useState()

    // useEffect(async () => {
    //     setTableData(1)
    // })

    return(
        <Content style={{ margin: '0 16px' }}>
            <Table  columns={columns}>
            </Table>
        </Content>
    )
}

export default MonthlyReport;