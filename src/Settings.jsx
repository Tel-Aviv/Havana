// @flow
import React, { useState } from 'react';
import axios from 'axios';

import { Upload, Button, Icon } from 'antd';

import { Typography } from 'antd';
const { Text } = Typography;

const Settings = () => {

    // const [file, setFile] = useState();
    // const [fileName, setFileName] = useState('Choose Image File');
    // const [uploadedFile, setUploadedFile] = useState({});

    // const onDrop = async (pictures, pictureDataURL) => {
    //     if( pictures.length == 0 )
    //         return

    //     console.log(pictures[0]);
    //     setFileName(pictures[0].name);

    //     const formData = new FormData()
    //     formData.append('signatureFile', pictures[0]);

    //     try {
    //         const res = await axios.post('http://localhost:5000/me/upload_signature', formData);
    //         const { fileName, filePath } = res.data;
    //         setUploadedFile({ fileName, filePath });
    //     } catch(err) {
    //         console.log(err)
    //     }
    // }

    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  
    }

    const uploadProps = {
        action: 'http://localhost:5000/me/upload_signature',
        listType: 'picture',
        className: 'upload-list-inline',
        beforeUpload: beforeUpload
    }

    return (
        <>
            <Upload {...uploadProps}>
                <Button>
                    <Icon type="upload" /> Upload
                </Button>
            </Upload>            
        </>
    )

}

export default Settings;