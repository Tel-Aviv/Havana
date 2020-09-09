// @flow
import React, { useState, useContext, useEffect, useReducer  } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { useTranslation } from "react-i18next";

import { Upload, Icon, message } from 'antd';
import { Row, Col, Avatar } from 'antd';
const { Meta } = Card;

import { Typography } from 'antd';
const { Title } = Typography;

import { Menu, Dropdown, Select, Card } from 'antd-rtl';
const { Option } = Select;

import { TextualEmployeKind } from './utils';

import { DataContext } from './DataContext';
import { UPDATE_ITEM, SET_DIRECT_MANAGER } from "./redux/actionTypes"

// Only let to webpack to know which file to consider,
// but you neither can access its rules or its styles.
// So we refer to CSS-class names like compiled CSS-rule
import style from './less/components/settings.less';


const Settings = () => {

    const [me, setMe] = useReducer( 
            (state, newState) => ({...state, ...newState}),
            {
                userName: '',
                userID: '',
                signature: '',
                stamp: '',
                managers: [],
                employeKind: ''
            }

        )

    const [loading, setLoading] = useState();
    const [directManager, setDirectManager] = useState({});
    
    const context = useContext(DataContext);
    const dispatch = useDispatch();
    
    const action_setDirectManager = (manager) => ({
        type: SET_DIRECT_MANAGER,
        data: manager
    })
    const { t } = useTranslation();

    useEffect( () => {

        async function fetchData() {

            try {

                const resp = await context.API.get('/me', { withCredentials: true })

                const signature = resp.data.signature;
                const stamp = resp.data.stamp;

                setMe({
                    userName: resp.data.userName,
                    userID: resp.data.ID,
                    signature: signature.startsWith('data:') ? signature : `data:/image/*;base64,${signature}`,  
                    stamp: stamp.startsWith('data:') ? stamp : `data:/image/*;base64,${stamp}`, 
                    managers: resp.data.managers,
                    employeKind: resp.data.kind
                })

            } catch( err ) {
                console.log(err)
            }
        }

        fetchData()
        
    }, [])

    const _directManager = useSelector(
        store => store.directManagerReducer.directManager
    )

    useEffect( () => {
        if( _directManager ) {
            setDirectManager(_directManager);
        }
        
    }, [_directManager])

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
             message.error('The image must be smaller than 2MB!');
        }

        return isJpgOrPng && isLt2M;
    }

    const getBase64 = (img, callback) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    }

    const uploadStampChange = (info) => {
        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, imageUrl => {
                setLoading(false);
                setStamp(imageUrl);
            })
        }

    }

    const uploadChange  = (info) => {

        if (info.file.status === 'uploading') {
            setLoading(true);
            return;
        }

        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, imageUrl => {
                setLoading(false);
                setSignature(imageUrl);
            })
        }

    }

    const dummyClick = (event) => {
        event.stopPropagation()
    }

    const removeStamp = async (event) => {
        event.stopPropagation()

        await axios.delete(`${context.protocol}://${context.host}/me/stamp`, {
            withCredentials: true
        })
        setStamp(null)        
    }    

    const removeSignature = async (event) => {
        event.stopPropagation()

        await axios.delete(`${context.protocol}://${context.host}/me/signature`, {
            withCredentials: true
        })
        setSignature(null)        
    }    

    const getUserAvatar = () => {
        const source = `data:image/jpeg;base64,${context.user.imageData}`;
        return <Avatar src={source} />
    }

    const uploadProps = {
        action: `${context.protocol}://${context.host}/me/upload_signature`,
        withCredentials: true,
        multiple: false,
        listType: 'picture-card',
        className: 'avatar-uploader',
        showUploadList: false,
        beforeUpload: beforeUpload,
        onChange: uploadChange,
        onRemove: removeSignature
    }

    const uploadStampProps = {
        action: `${context.protocol}://${context.host}/me/upload_stamp`,
        withCredentials: true,
        multiple: false,
        listType: 'picture-card',
        className: 'avatar-uploader',
        showUploadList: false,
        beforeUpload: beforeUpload,
        onChange: uploadStampChange,
        onRemove: removeStamp
    }

    const uploadButton = (
        <>
            <Icon type={loading ? 'loading' : 'plus'} />
            <div className="ant-upload-text">Upload</div>
        </>
    )

    const handleManagersMenuClick = (e) => {
        // setAssignee(managers[e.key].userId);
        console.log( me.managers[e.key].userId )
        // message.info(`הדוח יועבר לאישור ${managers[e.key].userName}`);
    }

    const onDirectManagerChanged = (val) => {
        const _directManager = me.managers[val];
        dispatch(action_setDirectManager(_directManager));
    }

    const managersMenu = <Menu onClick={handleManagersMenuClick}>
        { me.managers.map( (manager, index) => (
                <Menu.Item  key={index}>
                    <Icon type="user" />
                    {manager.userName}
                </Menu.Item>
        ))}
    </Menu>

    return (
        <div className='hvn-item-rtl'>
            
            <Row style={{
                    margin: '0% 4%' 
                }}>
                <Title level={2}>{t('setting_title')}</Title>
            </Row>
            <Row gutter={[32, 32]} style={{
                    margin: '0% 2%' 
                }}>
                <Col span={8}>
                    <Card title={t('stamp')}
                    actions={[
                        <Icon type="setting" key="setting" />,
                        <Icon type="edit" key="edit" />,
                        <Icon type="delete" onClick={ e => removeStamp(e) }/>,
                    ]}>
                        <Upload {...uploadStampProps}>
                            { me.stamp? <img src={me.stamp}  className='avatarUploader' onClick={e => dummyClick(e) }/>
                                    : uploadButton }
                        </Upload> 
                        <Meta title="Uploaded" description="from local store" />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={t('signature')}
                    actions={[
                            <Icon type="setting" key="setting" />,
                            <Icon type="edit" key="edit" />,
                            <Icon type="delete" onClick={ e => removeSignature(e) }/>,
                        ]}>
                        <Upload {...uploadProps}>
                            { me.signature?  <img src={me.signature} className="avatarUploader" onClick={e => dummyClick(e) }/> 
                                        : uploadButton }
                        </Upload>
                        <Meta title="Uploaded" description="from local store" />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={context.user.name}>
                        <Meta 
                            avatar={
                                <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                            }
                            title={'תעודת זהות: ' + me.userID}
                            description={TextualEmployeKind[me.employeKind]}
                        />
                    </Card>
                    <Card title={t('reports_to')}>
                         <Row>
                            <Col span={24}>
                                <Select showSearch
                                        style={{ width: 200 }}
                                        onChange={onDirectManagerChanged}
                                        placeholder={directManager.userName}>
                                    {
                                        me.managers.map((manager, index) => (
                                            <Option key={index}>{manager.userName}</Option>
                                        ))
                                    }
                                </Select>
                            </Col>
                        </Row> 
                    </Card>
                </Col>
            </Row>
        </div>
    )

}

export default Settings;