// @flow
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from "react-i18next";

import { Upload, Button, Icon, message } from 'antd';
import { Row, Col, Card, Avatar } from 'antd';
const { Meta } = Card;

import { Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

import { DataContext } from './DataContext';

const Settings = () => {

    const [signature, setSignature] = useState()
    const [stamp, setStamp] = useState();
    const [loading, setLoading] = useState()
    const context = useContext(DataContext)

    const { t } = useTranslation();

    useEffect( () => {

        async function fetchData() {

            let resp = await axios(`http://${context.host}/me/signature`,{
                withCredentials: true
            });
            const signature = resp.data;
            if( signature.startsWith('data:') ) {
                setSignature(signature);
            }
            else {    
                setSignature(`data:/image/*;base64,${signature}`);
            }

            resp = await axios(`http://${context.host}/me/stamp`, {
                withCredentials: true
            })
            const stamp = resp.data;
            if( stamp.startsWith('data:') ) {
                setStamp(stamp)
            } else {
                setStamp(`data:/image/*;base64,${stamp}`);
            }
            
        }

        fetchData()
        
    }, [])

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
             message.error('Image must smaller than 2MB!');
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

        await axios.delete(`http://${context.host}/me/stamp`, {
            withCredentials: true
        })
        setStamp(null)        
    }    

    const removeSignature = async (event) => {
        event.stopPropagation()

        await axios.delete(`http://${context.host}/me/signature`, {
            withCredentials: true
        })
        setSignature(null)        
    }    

    const uploadProps = {
        action: `http://${context.host}/me/upload_signature`,
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
        action: `http://${context.host}/me/upload_stamp`,
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

    return (
        <div className='hvn-item-rtl'>
            <Title level={2}>{t('setting_title')}</Title>
            <Row gutter={[16, 16]}>
                <Col span={8}>
                    <Card title={t('stamp')}
                    actions={[
                        <Icon type="setting" key="setting" />,
                        <Icon type="edit" key="edit" />,
                        <Icon type="delete" onClick={ e => removeStamp(e) }/>,
                    ]}>
                        <Upload {...uploadStampProps}>
                            { stamp? <img src={stamp}  className='avatar-uploader' onClick={e => dummyClick(e) }/>
                                    : uploadButton }
                        </Upload> 
                        <Meta title="Uploaded" description="from www.instagram.com" />
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
                            { signature?  <img src={signature} className='avatar-uploader' onClick={e => dummyClick(e) }/> 
                                        : uploadButton }
                        </Upload>
                        <Meta title="Uploaded" description="from local store" />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card title={context.user.name}>
                        <Avatar size={64} src={`data:image/jpeg;base64,${context.user.imageData}`}/>
                        <br /><br /><br />
                        <Meta title="Interaction Expert" 
                            description='No one can do this like you'/>
                    </Card>
                </Col>
            </Row>
        </div>
    )

}

export default Settings;