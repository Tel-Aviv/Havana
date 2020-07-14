// @flow
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import { Chart, Axis, Geom, Legend, Coord, Tooltip } from 'bizcharts';
import 'ant-design-pro/dist/ant-design-pro.css';
import { ChartCard, Bar, WaterWave, Field } from 'ant-design-pro/lib/Charts';

import { Row, Col, Card, Icon } from 'antd';

import { DataContext } from "../../DataContext";
  
const scale = {
    hours: { 
              alias: 'hours',
              tickInterval: 20 
          },
    month: { 
        alias: 'months' 
    }
  };

type Props = {
    year: number
}

const YearReport = (props: Props) => {

    const [reportData, setReportData] = useState([]);
    const [annualLeft, setAnnualLett] = useState<string>();
    const [annualLeftPecentage, setAnnualLeftPercentage] = useState<number>();

    const { t } = useTranslation();

    const context = useContext(DataContext);

    useEffect( () => {
        async function fetchData() {
            try {
                const resp = await axios(`${context.protocol}://${context.host}/me/reports/yearly?year=${props.year}`, {
                    withCredentials: true
                });
                const data = resp.data.items.map( item => {
                    return {
                        month: item.month,
                        hours_decimal: item.hoursDecimal,
                        hours: `${Math.floor(item.hoursDecimal)}:${Math.round(item.hoursDecimal % 1 * 60)}` 
                    }}
                )
                
                setReportData(data);
                const totalAnnual = parseFloat(resp.data.annualHoursBar)
                const hours = parseFloat(resp.data.hoursTotal);
                const perc = Math.floor( hours /totalAnnual * 100 );
                setAnnualLeftPercentage(perc);
                setAnnualLett(resp.data.annualHoursLeft);
 
            } catch(err) {
                console.error(err);
            }
        }
        fetchData()
    }, [props.year])

    return (
        <Row>
            <Col offset={1} span={7}>
                <ChartCard className='ltr'>
                    <WaterWave height={161} title="ניצול תקן שנתי" percent={annualLeftPecentage} />
                </ChartCard>
            </Col>
            <Col span={16}>
                <Chart width={600} height={400} 
                    data={reportData} 
                    scale={scale} 
                    forceFit={true}
                    >
                        <Axis name="חודשים" title/>
                        <Axis name="שעות" title/>
                        {/* <Legend position="top" dy={-20} /> */}
                        <Tooltip />
                        <Geom type="interval" position="month*hours_decimal" color="month"
                            tooltip={['month*hours', (month, hours) => {
                                return {
                                    name: '',//`${month}`,
                                    value: hours
                                }
                            }]} />
                </Chart>
            </Col>
        </Row>        
    )
}

export default YearReport;
