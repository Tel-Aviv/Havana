// @flow
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import moment from 'moment'

import { Table, Alert, 
        Row, Col, Icon, Tag, Checkbox } from 'antd';
import { useTranslation } from "react-i18next";
import { Tabs } from 'antd-rtl';
const { TabPane } = Tabs;
import { Layout } from 'antd';
const { Content } = Layout;
import { DataContext } from './DataContext';
import Ellipsis from 'ant-design-pro/lib/Ellipsis';

const monthsFilter = [...Array(12).keys()].map( i => ({
                                                        text: i+1,
                                                        value: i + 1
                                                    })
                                              )
const yearsFilter = [2019, 2020, 2021, 2022, 2023].map( i => ({
                                                            text: i,
                                                            value: i
                                                        })
                                                    )                                              

const columns = [{
        title: 'שם עובד',
        dataIndex: 'userName',
        align: 'right',
        key: 'name'
    },{
      title: "שנה",
      dataIndex: "year",
      align: 'right',
      key: "year",
      filters: yearsFilter,
      onFilter: (value, record) => {
          return record.year === value
      }      
   },{
      title: "חודש",
      dataIndex: "month",
      align: 'right',
      key: "month",
      filters: monthsFilter,
      onFilter: (value, record) => {
          return record.month === value
      }      
   },{
      title: "תאריך שליחה",
      dataIndex: "whenSubmitted",
      align: 'right',
      key: "submitted"
   },{
      title: "הערות",
      dataIndex: "notes",
      align: 'right',
      key: "comment",
      render: (text, _) => 
          <Tag color='volcano'
                style={{
                    marginRight: '0'
                }}>
            {
                text && text.length > 42 ?
                    <Tooltip title={text}>
                        <Ellipsis length={42}>{text}</Ellipsis> 
                    </Tooltip> :
                    <div>{text}</div>
            }
          </Tag>
  }, {
      title: "סטטוס",
      dataIndex: "reSubmitted",
      align: 'right',
      key: "resubmitted",
      render: (value, _) => 
        <Tag color='blue'
        style={{
            marginRight: '0'
        }}>
            {
                value ? 
                <div>נשלח מחדש</div> :
                <div>ממתין לאישור</div>
            }
        </Tag>
  }

]


const ConfirmList = () => {

    const history = useHistory()
    const [pendingList, setPendingList] = useState([])
    const [pendingCount, setPendingCount] = useState(0)
    const [approvedList, setApprovedList] = useState([])
    const [approvedCount, setApprovedCount] = useState(0)
    const [rejectedList, setRejectedList] = useState([])
    const [rejectedCount, setRejectedCount] = useState(0)
    const [namesFilter, setNamesFilter] = useState({})
    const context = useContext(DataContext)

    const { t } = useTranslation();

    const approvedTableColumns = [{
        title: "שם עובד",
        dataIndex: "reportOwner",
        align: 'right',
        key: "name",
        filters: namesFilter,
        onFilter: (value, record) => {
            return record.reportOwner.indexOf(value) === 0
        }
    },
    ...columns.slice(1, columns.length - 1),
    {
        title: "תאריך אישור",
        dataIndex: "whenApproved",
        align: 'right',
        key: "approved"
    }];
    
    const rejectedTableColumns = [{
        title: "שם עובד",
        dataIndex: "reportOwner",
        align: 'right',
        key: "name",
        filters: namesFilter,
        onFilter: (value, record) => {
        } 
    },
    ...columns.slice(1, columns.length - 1),
    {
        title: "תאריך דחיה",
        dataIndex: "whenRejected",
        align: 'right',
        key: "approved" 
    }
    ]

    useEffect( () =>  {

        async function fetchData() {

            try {

                const resp = await axios.all([
                    context.API.get('/me/pendings', { withCredentials: true }),
                    context.API.get('/me/approved', { withCredentials: true }),
                    context.API.get('/me/pendings/rejected', { withCredentials: true })
                ])

                const pendingReports = resp[0].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format('DD/MM/YYYY'),
                        key: index
                    }
                })
                setPendingCount(pendingReports.length);
                setPendingList(pendingReports);

                const approvedReports = resp[1].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format('DD/MM/YYYY'),
                        whenApproved: moment(item.whenApproved).format('DD/MM/YYYY'),
                        key: index
                    }
                });
                setApprovedCount(approvedReports.length);
                setApprovedList(approvedReports);

                const names = new Set(); // will be unique
                resp[1].data.forEach( item => names.add(item.reportOwner) )

                const _namesFilter = [...names].map( item => (
                    {
                        text: item,
                        value: item
                    }
                ))
                setNamesFilter(_namesFilter);

                const _rejectedList = resp[2].data.map( (item, index) => {
                    return {
                        ...item,
                        whenSubmitted: moment(item.whenSubmitted).format('DD/MM/YYYY'),
                        whenRejected: moment(item.whenRejected).format('DD/MM/YYYY'),
                        key: index
                    }
                });
                setRejectedCount(_rejectedList.length);
                setRejectedList(_rejectedList);

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

    const onRejectedRowClick = (record, index, event) => {
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
                                <Icon type="schedule" theme="twoTone"/>
                                <span>
                                    {t('pending_reports')} ({pendingCount})
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
                                <Icon type="carry-out" theme="twoTone"/>
                                <span>
                                    {t('approved_reports')} ({approvedCount})
                                </span>
                            </span>
                        }
                        key='2'>
                            <Table dataSource={approvedList} 
                                style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                                columns={approvedTableColumns}
                                size='middle'
                                bordered={true}
                                pagination={false}
                                onRow = { (record, index) => ({
                                    onClick: (event) => { onApprovedRowClick(record, index, event) }
                                })}>

                            </Table>
                        </TabPane>
                        <TabPane tab={
                            <span>
                                <Icon type="alert" theme="twoTone" />
                                <span>
                                    {t('rejected_reports')} ({rejectedCount})
                                </span>
                            </span>
                        }
                            key='3'>
                                <Table dataSource={rejectedList}
                                    style={{ direction: 'rtl', heigth: '600px', cursor: 'pointer' }}
                                    columns={rejectedTableColumns}
                                    size='middle'
                                    bordered={false}
                                    pagination={false}
                                    onRow = { (record, index) => ({
                                        onClick: (event) => { onRejectedRowClick(record, index, event) }
                                    })}
                                    />
                        </TabPane>
                    </Tabs>
                </Col>
            </Row>            
        </Content>
    )
}

export default ConfirmList;