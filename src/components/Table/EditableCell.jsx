// @flow
import React, { useState } from 'react'
import { Input, InputNumber, Form, Button } from 'antd';
var moment = require('moment');

import { EditableContext } from "./table-context";
import DatePicker from '../TimePicker'
const format = 'H:mm';




export default class EditableCell extends React.Component {
    getInput = () => (this.props.inputType !== 'time') ?
                        <Input /> :
                        <DatePicker />
    cellEditable = (inputType, val) => { 
        return ( inputType !== 'time' ||  !val)
    }
    
    render() {
        return <EditableContext.Consumer>
            {({ getFieldDecorator }) => {
                const {
                    rowEditing,
                    dataIndex,
                    title,
                    inputType,
                    record,
                    index,
                    children,
                    cellEditbale,
                    ...restProps
                } = this.props;
                return (
                    <td {...restProps}>
                        {rowEditing && cellEditbale ?  (
                            <Form.Item style={{ margin: 0 }}>
                                {getFieldDecorator(dataIndex, {
                                    rules: [
                                        {
                                            required: true,
                                            message: `אנא הזן ${title}!`,
                                        },
                                    ],
                                    initialValue: (record[dataIndex] && this.props.inputType === 'time') ?
                                                moment.utc(record[dataIndex], format) : undefined
                                })(this.getInput())}
                            </Form.Item>
                        ) : (
                                children
                            )}
                    </td>
                );
            }}
        </EditableContext.Consumer>;
    }
}