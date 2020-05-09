// @flow
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';
import moment from 'moment'

import { Table, Divider, Tag } from 'antd';

import { DataContext } from './DataContext';

const columns = [{
        title: 'שם עובד',
        dataIndex: 'userName',
        align: 'right',
        key: 'name',
    },{
      title: "שנה",
      dataIndex: "year",
      align: 'right',
      key: "year"
   },{
      title: "חודש",
      dataIndex: "month",
      align: 'right',
      key: "month"
   },{
      title: "תאריך שליחה",
      dataIndex: "whenSubmitted",
      align: 'right',
      key: "submitted"
   },{
      title: "הערות",
      dataIndex: "comment",
      align: 'right',
      key: "comment"
  }

]

const ConfirmList = () => {

    const history = useHistory()
    const [tableData, setTableData] = useState([])
    const dataContext = useContext(DataContext)

    useEffect( () =>  {

        async function fetchData() {
            const url = `http://${dataContext.host}/me/pendings`;
            const resp = await axios(url, {
                withCredentials: true
            }); 
            const tableData = resp.data.map( (item, index) => {
                return {
                    ...item,
                    whenSubmitted: moment(item.whenSubmitted).format('DD/MM/YYYY'),
                    key: index
                }
            })
            setTableData(tableData)
        }

        fetchData()

    }, [])

    const onRowClick = (record, index, event) => {
        history.push(`/confirm/${record.userId}/${record.reportId}/${record.saveReportId}`);
    }

    return(
        <div style={{
                        margin: '1% 5%',
                        backgroundColor: 'white',
                        padding: '10px',
                        direction: 'ltr'
                    }}>
            <Table dataSource={tableData} 
                    style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                    columns={columns} 
                    size="middle" 
                    bordered={false}
                    pagination={false}
                    onRow={(record, index) => ({
                                onClick: (event) => { onRowClick(record, index, event) } 
                            })}>
            </Table>
        </div>
    )
}

export default ConfirmList;