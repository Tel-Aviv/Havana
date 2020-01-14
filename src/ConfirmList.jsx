// @flow
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';

import { Table, Divider, Tag } from 'antd';

const columns = [{
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },{
      title: "id",
      dataIndex: "id",
      key: "id"
  }, {
      title: "comment",
      dataIndex: "comment",
      key: "comment"
  }

]

const ConfirmList = () => {

    const history = useHistory()
    const [tableData, setTableData] = useState([])

    useEffect( () =>  {

        async function fetchData() {
            const url = `http://localhost:5000/api/v1/pendings`;
            const resp = await axios(url); 
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