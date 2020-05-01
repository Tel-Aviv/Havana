import React from 'react';
import { Chart, Axis, Geom, Legend, Coord, Tooltip } from 'bizcharts';
import 'ant-design-pro/dist/ant-design-pro.css';
import { ChartCard, Bar, WaterWave, Field } from 'ant-design-pro/lib/Charts';

import { Row, Col, Card, Icon } from 'antd';

const data = [
  { month: 'יאנואר', hours: 205.3 },
  { month: 'פברואר', hours: 215},
  { month: 'מרץ', hours: 220 },
  { month: 'אפריל', hours: 150 },
  { month: 'מאי', hours: 168.4 }
];

const scale = {
  hours: { 
            alias: 'hours',
            tickInterval: 20 
        },
  month: { 
      alias: 'months' 
  }
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
                <Chart width={600} height={400} data={data} scale={scale}>
                {/* <Chart width={600} height={400} data={data}> */}
                    <Axis name="month" title/>
                    <Axis name="hours" title/>
                    <Legend position="top" dy={-20} />
                    <Tooltip />
                    <Geom type="interval" position="month*hours" color="month" />
                </Chart>
                {/* <Bar height={200} data={data}/> */}
            </Col>
            <Col span={4}>
            </Col>   
        </Row>        
    )
}

export default YearReport;
