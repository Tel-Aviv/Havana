import React from 'react';
import { useParams } from 'react-router-dom';

import { useTranslation, Trans } from "react-i18next";

import {  Divider, Tag, Button, Modal } from 'antd';

import Report from './components/Report/Report';

type Props = {
    month: number,
    year: number
}

const Confirm = (props: Props) => {
    
    const [tableData, setTableData] = useState([])
    const [loadingData, setLoadingData] = useState(false)

    const { t } = useTranslation();

    const routeParams = useParams();
    console.log(routeParams.userid);

    useEffect( () => {
        async function fetchData() {

            setMonth(props.month)
            setYear(props.year)

            setLoadingData(true)
            try {
                const url = `http://${dataContext.host}/me/employees/reports/${routeParams.userid}?month=${props.month + 1}&year=${props.year}`;
                const resp = await axios(url, {
                    withCredentials: true
                }); 

            } catch(err) {
                console.error(err);
            } finally {
                setLoadingData(false)
            }
        }

        fetchData();
    });

    const onApprove = async() => {
        try {
            await axios.post(`http://${dataContext.host}me/pendings/`)
        } catch( err ) {
            console.log(err)
        }
    }

    return (
        <>
            <Report dataSource={tableData} loading={loadingData} editable={false} />
            <Button type="primary" onClick={onApprove}>{t('approve')}</Button>
        </>
    )
}

export default Confirm;