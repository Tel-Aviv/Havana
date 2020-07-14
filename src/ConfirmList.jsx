// @flow
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import moment from 'moment'

import { Table, Alert, 
        Row, Col, Icon } from 'antd';
import { useTranslation } from "react-i18next";
import { Tabs } from 'antd-rtl';
const { TabPane } = Tabs;
import { Layout } from 'antd';
const { Content } = Layout;
import { DataContext } from './DataContext';

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
        key: 'name',
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
      dataIndex: "comment",
      align: 'right',
      key: "comment"
  }

]

const ConfirmList = () => {

    const history = useHistory()
    const [pendingList, setPendingList] = useState([])
    const [approvedList, setApprovedList] = useState([])
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
    ...columns.slice(1),
    {
        title: "תאריך אישור",
        dataIndex: "whenApproved",
        align: 'right',
        key: "approved"
    }    
    ];

    useEffect( () =>  {

        async function fetchData() {

            try {

                const resp = await axios.all([
                    axios(`${context.protocol}://${context.host}/me/pendings`, {
                        withCredentials: true
                    }),
                    axios(`${context.protocol}://${context.host}/me/approved`, {
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
                setApprovedList(approvedReports);

                const names = new Set(); // will bw unique
                resp[1].data.forEach( item => names.add(item.reportOwner) )

                const _namesFilter = [...names].map( item => (
                    {
                        text: item,
                        value: item
                    }
                ))
                
                setNamesFilter(_namesFilter);

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