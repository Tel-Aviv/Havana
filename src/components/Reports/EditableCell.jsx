// @flow
import React, { useState } from 'react'
import { Input, Dropdown, Select,
        Icon, Form, Button, Menu } from 'antd';
const { Option } = Select;       
const moment = require('moment');
import uniqid from 'uniqid';

import { ReportContext } from "./table-context";
import CustomTimePicker from '../CustomTimePicker'
const format = 'H:mm';

const EditableCell = (props) => {

    const [reportCodes, setReportCodes] = useState([]);
    
    const getInput = (type) => {
        const controls = {
            time: () => {
                return  <CustomTimePicker />;
            },
            select: () => {
                return <Select size="small" style={{margin: '2px'}}> 
                            {
                                reportCodes.map( item => 
                                    <Option key={uniqid()} value={item.Code}>{item.Description}</Option>)
                            }
                        </Select>;
            },
            default: () => {
                return <Input size="small"/>;
            }
        }

        return (controls[type] || controls['default'])();
    }

    return <ReportContext.Consumer>
        {( {form, codes} ) => {
            const {
                rowEditing,
                dataIndex,
                title,
                inputType,
                record,
                index,
                children,
                ...restProps
            } = props;

            setReportCodes(codes);

            return (
                <td {...restProps}>
                    {rowEditing /*&& cellEditable*/ ?  (
                        <Form.Item style={{ margin: 0 }}>
                            {form.getFieldDecorator(dataIndex, {
                                rules: [
                                    {
                                        required: true,
                                        message: `אנא הזן ${title}!`,
                                    },
                                ],
                                initialValue: (record[dataIndex] && props.inputType === 'time') ?
                                            moment.utc(record[dataIndex], format) : (record[dataIndex])
                            })
                                (getInput(inputType))
                            }
                        </Form.Item>
                    ) : (
                            children
                        )}
                </td>
            );
        }}
    </ReportContext.Consumer>;
}

export default EditableCell