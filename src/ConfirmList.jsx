// @flow
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Route, Switch, withRouter, Link, useHistory } from 'react-router-dom';
import moment from 'moment'

import { Table, Alert, 
        Row, Col, Icon } from 'antd';
import { useTranslation } from "react-i18next";
import { Tabs } from 'antd-rtl';
const { TabPane } = Tabs;
import { Layout } from 'antd';
const { Content } = Layout;
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

const approvedTableColumns = [{
        title: "שם עובד",
        dataIndex: "reportOwner",
        align: 'right',
        key: "name"
    }, 
    // {
    //     title: "dd",
    //     dataIndex: "reportOwnerId",
    //     align: 'right',
    //     key: 'ownerId'
    // },
    ...columns.slice(1),
    {
        title: "תאריך אישור",
        dataIndex: "whenApproved",
        align: 'right',
        key: "approved"
    }    
];

const ConfirmList = () => {

    const history = useHistory()
    const [pendingList, setPendingList] = useState([])
    const [approvedList, setApprovedList] = useState([])
    const dataContext = useContext(DataContext)

    const { t } = useTranslation();

    useEffect( () =>  {

        async function fetchData() {

            try {

                const resp = await axios.all([
                    axios(`http://${dataContext.host}/me/pendings`, {
                        withCredentials: true
                    }),
                    axios(`http://${dataContext.host}/me/approved`, {
                        withCredentials: true
                    })
                ])

                const pendingReports = resp[0].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format('DD/MM/YYYY'),
                        key: index
                    }
                })
                setPendingList(pendingReports);

                const approvedReports = resp[1].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format('DD/MM/YYYY'),
                        whenApproved: moment(item.whenApproved).format('DD/MM/YYYY'),
                        key: index
                    }
                });
                setApprovedList(approvedReports)

            } catch(error) { // 😨
                console.log(error.message);
            }
        }

        fetchData()

    }, [])

    const onRowClick = (record, index, event) => {
        history.push(`/confirm/${record.userId}/${record.saveReportId}`);
    }

    const onApprovedRowClick = (record, index, event) => {
        history.push(`/confirm/${record.reportOwnerId}/${record.saveReportId}`);
    }

    return(
        <Content>
            <Row>
                <Alert closable={false}
                    className='hvn-item-rtl'
                    message={t('approvals_list')}/>
            </Row>
            <Row gutter={[32, 32]} style={{
                    margin: '0% 4%' 
                }}>
                <Col span={24}>
                    <Tabs defaultActiveKey="1" 
                        type="line"
                        className='hvn-table-rtl'>
                        <TabPane tab={
                            <span>
                                <Icon type="schedule" />
                                <span>
                                {t('pending_reports')}
                                </span>
                            </span>
                        }
                        key='1'>
                            <Table dataSource={pendingList} 
                                    style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                                    columns={columns} 
                                    size='middle' 
                                    bordered={false}
                                    pagination={false}
                                    onRow={(record, index) => ({
                                                onClick: (event) => { onRowClick(record, index, event) } 
                                            })}>
                            </Table>
                        </TabPane>
                        <TabPane tab={
                            <span>
                                <Icon type="carry-out" />
                                <span>
                                    {t('approved_reports')}
                                </span>
                            </span>
                        }
                        key='2'>
                            <Table dataSource={approvedList} 
                                style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                                columns={approvedTableColumns}
                                size='middle'
                                bordered={false}
                                pagination={false}
                                onRow={ (record, index) => ({
                                    onClick: (event) => { onApprovedRowClick(record, index, event) }
                                })}>

                            </Table>
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>            
        </Content>
    )
}

export default ConfirmList;