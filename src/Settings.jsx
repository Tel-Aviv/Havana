// @flow
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { Upload, Button, Icon, message } from 'antd';
import { Row, Col } from 'antd';

import { Typography } from 'antd';
const { Title, Paragraph, Text } = Typography;

import { DataContext } from './DataContext';

const Settings = () => {

    const [signature, setSignature] = useState()
    const [stamp, setStamp] = useState();
    const [loading, setLoading] = useState()
    const context = useContext(DataContext)

    useEffect( () => {

        async function fetchData() {
            let resp = await axios(`http://${context.host}/me/signature`,{
                withCredentials: true
            });
            setSignature(`data:/image/*;base64,${resp.data}`)

            resp = await axios(`http://${context.host}/me/stamp`, {
                withCredentials: true
            }) 
            setStamp(resp.data)
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

    const removeSignature = (event) => {
        event.stopPropagation()

        axios.delete(`http://${context.host}/me/signature`, {
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

    const uploadButton = (
        <>
            <Icon type={loading ? 'loading' : 'plus'} />
            <div className="ant-upload-text">Upload</div>
        </>
    )

    return (
        <>
            <Title level={2}>Your Pesrsonal Info</Title>
            <Row gutter={[16, 16]}>
                <Col span={12} className='cbox'>
                    <Text>Signature</Text>
                    <Upload {...uploadProps}>
                        { signature?  <>
                                        <img src={signature} className='avatar-uploader' onClick={e => dummyClick(e) }/> 
                                        <Button onClick={ e => removeSignature(e) }>remove</Button>
                                    </> : 
                                    uploadButton }
                    </Upload>
                    <br /> <br /> <br /> <br />

                </Col>
                <Col span={12} className='cbox'>
                    <Text>Stamp</Text>
                    <Upload {...uploadProps}>
                        <img src={stamp} />
                    </Upload> 
                </Col>

            </Row>
        </>
    )

}

export default Settings;