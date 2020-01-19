// @flow
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';

import { Table, Divider, Tag } from 'antd';

import { DataContext } from './DataContext';

const columns = [{
        title: 'שם עובד',
        dataIndex: 'name',
        key: 'name',
    },{
      title: "id",
      dataIndex: "id",
      key: "id"
  }, {
      title: "הערות",
      dataIndex: "comment",
      key: "comment"
  }

]

const ConfirmList = () => {

    const history = useHistory()
    const [tableData, setTableData] = useState([])
    const dataContext = useContext(DataContext)

    useEffect( () =>  {

        async function fetchData() {
            const url = `http://${dataContext.host}/api/v1/pendings`;
            const resp = await axios(url, {
                withCredentials: true
            }); 
            setTableData(resp.data)
        }

        fetchData()

    }, [])

    const onRowClick = (record, index, event) => {
        console.log(record.id)
        history.push(`/confirm/${record.id}`);
    }

    return(
        <>
            <Table dataSource={tableData} columns={columns} size="middle" bordered
                onRow={(record, index) => ({
                        onClick: (event) => { onRowClick(record, index, event) } 
            })}>
            </Table>
        </>
    )
}

export default ConfirmList;