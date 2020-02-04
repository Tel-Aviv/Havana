import React, { useState, useEffect, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import axios from 'axios';

import { useTranslation, Trans } from "react-i18next";

import Pdf from 'react-to-pdf'

import {  Divider, Tag, Button, Typography, Modal } from 'antd';
const { Title } = Typography;          

import { DataContext } from './DataContext';
import TableReport from './components/Reports/TableReport';

import { DECREASE_NOTIFICATIONS_COUNT } from "./redux/actionTypes";

type Props = {
    month: number,
    year: number
}

const ref = React.createRef();

const Confirm = (props: Props) => {
    
    const [month, setMonth] = useState();
    const [year, setYear] = useState();
    const [tableData, setTableData] = useState([])
    const [title, setTitle] = useState();
    const [loadingData, setLoadingData] = useState(false)

    const dataContext = useContext(DataContext)

    const { t } = useTranslation();

    const routeParams = useParams();

    const dispatch = useDispatch();

    useEffect( () => {
        async function fetchData() {

            setMonth(props.month)
            setYear(props.year)

            setLoadingData(true)
            try {
                let url = `http://${dataContext.host}/me/employees/reports/${routeParams.reportId}`;
                const resp = await axios(url, {
                    withCredentials: true
                }); 
                let reportId = 0;
                const data = resp.data.items.map( (item, index ) => {
                        const _item = {...item, key: index};
                        if( reportId === 0 )
                            reportId = item.reportId;
                        return _item;
                })

                setTableData(data)
                setTitle(`דוח נוכחות של ${resp.data.ownerName} ל ${resp.data.month}/${resp.data.year}`);

            } catch(err) {
                console.error(err);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData();
    }, []);

    const action_decreaseNotificationCount = () => ({
        type: DECREASE_NOTIFICATIONS_COUNT
    })

    const onApprove = async(toPdf) => {

        try {
            const url = `http://${dataContext.host}/me/pendings/${routeParams.reportId}`;
            await axios(url, {
                method: "PATCH",
                withCredentials: true
            })

            dispatch(action_decreaseNotificationCount());
        } catch( err ) {
            console.error(err)
        }

        if( toPdf ) {
            toPdf();
        }
    }

    return (
        <>
            <Title className='hvn-title'>{title}</Title>
            <div className='hvn-item-ltr'>
                <Pdf targetRef={ref} filename="report.pdf">
                    {({ toPdf }) => <Button type="primary"
                                            style={{
                                                marginBottom: '8px'
                                            }}   
                                            onClick={ () => onApprove(toPdf) }>
                                        {t('approve')}
                                    </Button>}
                </Pdf>
                <div ref={ref}>
                    <TableReport dataSource={tableData} 
                                loading={loadingData} 
                                editable={false} />

                </div>
            </div>
        </>
    )
}

export default Confirm;