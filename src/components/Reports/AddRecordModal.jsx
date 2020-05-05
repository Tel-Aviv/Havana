// @flow
import React from 'react';
import { Table, Popconfirm, Modal, Form, Icon, Button, 
    Title, Input, Tag, Row, Col } from 'antd';
import { useTranslation } from "react-i18next";   

import CustomTimePicker from '../CustomTimePicker'

const AddRecordModal = (props) => {

    const { t } = useTranslation();

    const { getFieldDecorator } = props.form;

    const visible = props.visible;
    const onCancel = props.onCancel;
    const _addRecord = props.onAddRecord;

    const _onSubmit = e => {

        e.preventDefault();
        props.form.validateFields( (err, values) => {

            if (err) {
                return;
            }

            console.log(values);    
            
            const _values = {
                inTime: values["date-picker-in"],
                outTime: values["date-picker-out"],
                note: values["notes"]
            }   
            
            if( _addRecord )
                _addRecord(_values);
        })
    }    

    return (
        <Modal visible={visible}
              closable={false}
              footer={[]}>
        {/* <Title className='rtl'
            style={{
                marginTop: '12px'
            }}>
            {t('add_record')}
        </Title> */}

            <Form layout="vertical"
                    onSubmit={_onSubmit}>
                <Form.Item label={t('in')} labelAlign="right">
                {getFieldDecorator('date-picker-in', {
                    rules: [{ 
                            type: 'object', 
                            required: true, 
                            message: t('add_entry_error') 
                            }],
                })(
                    <CustomTimePicker />
                )}
                </Form.Item>
                <Form.Item label={t('out')} labelAlign="right">
                    {getFieldDecorator('date-picker-out', {
                        rules: [{ 
                                type: 'object', 
                                required: true, 
                                message: t('add_exit_error') 
                                }],                
                    })(
                        <CustomTimePicker />
                    )}
                </Form.Item>
                <Form.Item label={t('notes')}>
                    {getFieldDecorator('notes', {
                        rules: [{ required: true, message: t('add_notes_error') }],
                    })(
                        <Input />,
                    )}
                </Form.Item>                
                <Form.Item>
                    <Row>
                        <Col offset={12} span={6}>
                        <Button type="primary" htmlType="submit">
                            {t('add_record')}
                        </Button>
                        </Col>
                        <Col span={6}>
                        <Button onClick={onCancel}>
                            {t('cancel')}
                        </Button>
                        </Col>
                    </Row>
                </Form.Item>                 
            </Form>
        </Modal>        
    )
}

export default Form.create()(AddRecordModal)