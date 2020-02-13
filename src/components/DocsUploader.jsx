// @flow
import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import { Upload, Button, Icon, message } from 'antd'
// import { Upload } from 'antd-rtl';

import { DataContext } from "../DataContext";

const DocsUploader = ({reportId}: {reportId : number}) => {

    const [docs, setDocs] = useState([]);
    const dataContext = useContext(DataContext);

    const { t } = useTranslation();

    useEffect( () => {

        async function fetchData() {

            try {

                const res = await axios(`http://${dataContext.host}/me/reports/${reportId}/docs/`, {
                    withCredentials: true
                })
                const _docs = res.data.map( (item, index) => {
                    return {
                        uid: index,
                        status: 'done',
                        name: item.name
                    }
                })
                setDocs(_docs);

            } catch( err ) {
                console.error(err);
            }
        }

        if( reportId != 0 )
            fetchData();
    }, [reportId])

    const removeDoc = async(file) => {
        
        try {
            const docName = file.name;
            await axios.delete(`http://${dataContext.host}/me/reports/${reportId}/docs/${docName}`, {
                withCredentials: true
            })
        } catch(err) {
            console.error(err)
        }
        
    } 

    const beforeUpload = (file) => {

        // prevent uploading files with the same name
        var alreadyUploaded = docs.find( doc => {
             return doc.name === file.name
        });
        if( alreadyUploaded ) {
            message.error('The file with the same name is already uploaded');
            return false;
        }

        const isValidForUpload = file.type === 'image/jpeg' 
                            || file.type === 'image/png' 
                            || file.type === 'application/pdf';
        if (!isValidForUpload) {
            message.error('You can only upload JPG/PNG/PDF files!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
             message.error('Image must smaller than 2MB!');
        }

        return isValidForUpload && isLt2M;
    }

    const docsUploadProps = {

        action: `http://${dataContext.host}/me/reports/${reportId}/docs/`,
        onChange({ file, fileList }) {
            fileList = fileList.map(file => {
                  if (file.response) {
                    // Component will show file.url as link
                    file.url = file.response.url;
                  }
                  return file;
                });

            if( file. status )    
                setDocs(fileList);
        },
        withCredentials: true,
        defaultFileList: docs,
        beforeUpload: beforeUpload,
        onRemove: removeDoc

    }

    return (
        <Upload fileList={docs} className='rtl'
                    {...docsUploadProps} className='ltr'>
            <Button>
                <Icon type="upload" /> {t('upload')}
            </Button>
        </Upload>
    )

}

export default DocsUploader;