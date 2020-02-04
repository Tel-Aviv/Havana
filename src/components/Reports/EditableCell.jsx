// @flow
import React from 'react'
import { Input, Form, Button } from 'antd';
var moment = require('moment');

import { ReportContext } from "./table-context";
import CustomTimePicker from '../CustomTimePicker'
const format = 'H:mm';

type Props = {
    inputType: string
}

type State = {

}

const EditableCell = (props) => {

    const getInput = () => ( props.inputType !== 'time') ?
        <Input /> :
        <CustomTimePicker />

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
            } = props;
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
                                initialValue: (record[dataIndex] && props.inputType === 'time') ?
                                            moment.utc(record[dataIndex], format) : undefined
                            })(getInput())}
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