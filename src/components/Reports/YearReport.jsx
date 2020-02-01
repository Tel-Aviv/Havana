import React from 'react';
import { Chart, Axis, Geom, Legend, Coord, Tooltip } from 'bizcharts';
import 'ant-design-pro/dist/ant-design-pro.css';
import { ChartCard, Bar, WaterWave, Field } from 'ant-design-pro/lib/Charts';

import { Row, Col, Card, Icon } from 'antd';

const data = [
  { genre: 'יאנואר', hours: 205 },
  { genre: 'פברואר', hours: 215},
  { genre: 'מרץ', hours: 220 },
  { genre: 'אפריל', hours: 150 },
  { genre: 'מאי', hours: 168 }
];

const cols = {
  hours: { 
            alias: 'hours',
            tickInterval: 20 },
  genre: { alias: 'months' }
};

const YearReport = () => {
    return (
        <Row>
            <Col offset={4} span={4}>
                <ChartCard className='ltr'>
                    <WaterWave height={161} title="נשאר בסל השעות" percent={34} />
                </ChartCard>
            </Col>
            <Col span={12}>
                <Chart width={600} height={400} data={data} scale={cols}>
                    <Axis name="genre" title/>
                    <Axis name="hours" title/>
                    <Legend position="top" dy={-20} />
                    <Tooltip />
                    <Geom type="interval" position="genre*hours" color="genre" />
                </Chart>
                {/* <Bar height={200} data={data}/> */}
            </Col>
            <Col span={4}>
            </Col>   
        </Row>        
    )
}

export default YearReport;