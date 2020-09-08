import React from 'react';

import { Layout } from 'antd';

import { Menu, Icon } from 'antd';
import { Tabs } from 'antd';

import { Avatar, Tooltip, Badge, Calendar, Table } from 'antd';

const { Header, Footer, Sider, Content } = Layout;
const { TabPane } = Tabs;

const App2 = () => {
    return (
            <Layout>
                <Layout.Header className='rtl' style={{
                    backgroundColor: 'white',
                    padding: '0',
                    height: '60px',
                    boxShadow: 'rgba(0, 0, 0, 0.15) 0px 2px 8px 0px'
                }}>
                    <Menu mode="horizontal" style={{
                        padding: '0 5%'
                    }}>
                        <Menu.Item style={{
                            top: '-8px'
                        }}>
                            <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                        </Menu.Item>
                        <Menu.Item style={{
                            marginTop: '12px',
                        }}>
                            <Badge count='25'>
                                <Tooltip title='Notifications'>
                                    <Icon type="notification" theme="outlined" 
                                        style={{
                                            fontSize: '24px'
                                        }}/>
                                </Tooltip>
                            </Badge>    
                        </Menu.Item>
                        <Menu.Item key="setting" style={{
                            float: 'left',
                            marginTop: '12px'
                            }}>
                            <Tooltip title='Settings'>
                                <Icon type="setting" 
                                    theme="outlined"
                                    style={{
                                        fontSize: '24px'
                                    }}/>
                            </Tooltip>      
                        </Menu.Item>
                    </Menu>
                </Layout.Header>
                <Content>
                        <Tabs defaultActiveKey="1" style={{
                            margin: '1% 5%',
                            backgroundColor: 'white',
                            padding: '10px',
                            direction: 'ltr'
                        }}>
                            <TabPane tab={
                                <span>
                                    <Icon type="bars" />
                                    טבלה
                                </span>
                                } key="1">
                                <Table />
                            </TabPane>
                            <TabPane tab={<span>
                                <Icon type="schedule" />
                                לוח חודשי
                            </span>
                            } key="2">
                                <Calendar className='rtl' />
                            </TabPane>
                        </Tabs>
                </Content>
            </Layout>
    )
}

export default App2;