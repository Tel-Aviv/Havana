import React from 'react';
import { Chart, Axis, Geom, Legend, Coord, Tooltip } from 'bizcharts';
import 'ant-design-pro/dist/ant-design-pro.css';
import { ChartCard, Bar, WaterWave, Field } from 'ant-design-pro/lib/Charts';

import { Row, Col, Card, Icon } from 'antd';

const data = [
  { genre: 'January', hours: 205 },
  { genre: 'February', hours: 215},
  { genre: 'March', hours: 220 },
  { genre: 'April', hours: 150 },
  { genre: 'May', hours: 168 }
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
            <Col span={12}>
                <ChartCard  title="fff">
                    <WaterWave height={161} title="Hours remaining" percent={34} />
                </ChartCard>
            </Col>    
        </Row>        
    )
}

export default YearReport;