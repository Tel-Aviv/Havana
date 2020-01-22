// @flow
import React from 'react'
import { Input, InputNumber, Form, Button } from 'antd';
var moment = require('moment');

import { ReportContext } from "./table-context";
import CustomTimePicker from '../CustomTimePicker'
const format = 'H:mm';

type Props = {
    inputType: string
}

type State = {

}

export default class EditableCell extends React.Component<Props, State> {
    getInput = () => (this.props.inputType !== 'time') ?
                        <Input /> :
                        <CustomTimePicker />
    cellEditable = (inputType, val) => { 
        return ( inputType !== 'time' ||  !val)
    }
    
    render() {
        return <ReportContext.Consumer>
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
        </ReportContext.Consumer>;
    }
}