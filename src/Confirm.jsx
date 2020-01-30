import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { useTranslation, Trans } from "react-i18next";

import {  Divider, Tag, Button, Modal } from 'antd';

import { DataContext } from './DataContext';
import TableReport from './components/Reports/TableReport';

type Props = {
    month: number,
    year: number
}

const Confirm = (props: Props) => {
    
    const [month, setMonth] = useState();
    const [year, setYear] = useState();
    const [tableData, setTableData] = useState([])
    const [loadingData, setLoadingData] = useState(false)

    const dataContext = useContext(DataContext)

    const { t } = useTranslation();

    const routeParams = useParams();

    useEffect( () => {
        async function fetchData() {

            setMonth(props.month)
            setYear(props.year)

            setLoadingData(true)
            try {
                const url = `http://${dataContext.host}/me/employees/reports/${routeParams.userid}/${routeParams.reportId}`;
                const resp = await axios(url, {
                    withCredentials: true
                }); 
                let reportId = 0;
                const data = resp.data.map( (item, index ) => {
                        const _item = {...item, key: index};
                        if( reportId === 0 )
                            reportId = item.reportId;
                        return _item;
                })

                setTableData(data)

            } catch(err) {
                console.error(err);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData();
    }, []);

    const onApprove = async() => {
        try {
            const url = `http://${dataContext.host}/me/pendings/${routeParams.reportId}`;
            await axios(url, {
                method: "PATCH",
                withCredentials: true
            })
        } catch( err ) {
            console.error(err)
        }
    }

    return (
        <>
            <TableReport dataSource={tableData} loading={loadingData} editable={false} />
            <Button type="primary" onClick={onApprove}>{t('approve')}</Button>
        </>
    )
}

export default Confirm;