// @flow
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';

import { Upload, Button, Icon } from 'antd';
import { Row, Col } from 'antd';

import { Typography } from 'antd';
const { Text } = Typography;

import { DataContext } from './DataContext';

const Settings = () => {

    const [signature, setSignature] = useState()
    const context = useContext(DataContext)

    useEffect( () => {

        async function fetchData() {
            const resp = await axios('http://localhost:5000/me/signatute', {
                withCredentials: true
            });
            setSignature(resp.data)

        }

        fetchData()
    }, [])

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  
    }

    const uploadProps = {
        action: `http://${context.host}/me/upload_signature`,
        withCredentials: true,
        multiple: false,
        listType: 'picture',
        className: 'upload-list-inline',
        beforeUpload: beforeUpload,
        onChange: function(e) {
            console.log(e);
        },
        onRemove: function(file) {
            axios.delete(`http://${context.host}/me/signatute`, {
                withCredentials: true
            })
            setSignature(null)
        }
    }

    return (
        <>
            <Row>
                <img src={signature} /> 
                <Upload {...uploadProps}>
                    <Button>
                        <Icon type="upload" /> Upload
                    </Button>
                </Upload>            
            </Row>
        </>
    )

}

export default Settings;