// @flow
import React, { useState, useEffect, forwardRef } from 'react';
import axios from 'axios';
import 'antd/dist/antd.css';
import { Table, Form, Popconfirm, Icon, Button, Tag, Modal,
        Card, Row, Col, Input, TimePicker } from 'antd';
// import Form from '@ant-design/compatible'
import moment from 'moment'
import { useTranslation } from "react-i18next";

import { ReportContext } from "./table-context";
import EditableCell from './EditableCell'
import EditIcons from './EditIcons';
import AddIcon from './AddIcon';
import XTimePicker from '../XTimePicker'

const format = 'H:mm';

type ReportRecord = {
  rdate: string,
  key: number,
  entry: moment,
  exit: moment,
  total: moment,
  notes: string,
  valid?: boolean,
  requireChange:? boolean
}

type Props = {
  form: Object,
  dataSource: [ReportRecord],
  editable: boolean,
}

const EditableTable = (props: Props) => {

  const { getFieldDecorator } = props.form;

  const [data, setData] = useState([])
  const [originalData, setOriginalData] = useState([])
  const [editingKey, setEditingKey] = useState('')
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false)
  const [recordToAdd, setRecordToAdd] = useState();
  const [newRecordInTime, setNewRecordInTime] = useState<string>('')
  const [newRecordOutTime, setNewRecordOutTime] = useState<string>('')
  const [addRecordNote, setAddRecordNote] = useState<string>('')

  const [addEntryTimeError, setAddEntryTimeError] = useState<boolean>(false)
  const [addExitTimeError, setAddExitTimeError] = useState<boolean>(false)
  const [addNotesError, setAddNotesError] = useState<boolean>(false)

  const { t } = useTranslation();

  useEffect(() => {
    setOriginalData(props.dataSource)
    setData(props.dataSource.map( record =>  {
        return { 
            ...record, 
            requireChange : isRowEditable(record),
            valid : (record.requireChange)?  false : true,
            rdate : moment(record.rdate).format('DD/MM/YYYY')
        }
      })
    )
  }, [props.dataSource])

  const isRowEditing = record => {
    return record.key === editingKey
  }
  const isRowEditable = record => {
    return props.editable &&  // not manager
            record.notes !== ''
  }

  const edit = (key) => {
    setEditingKey(key);
  }

  const cancel = () => {
    setEditingKey('');
  };

  const save = (form, key) => {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }

      const newData = [...data];
      const index = newData.findIndex(item => key === item.key);
      if (index > -1) {
        const item = newData[index];
        let newItem = {
          ...item,
          ...row,
          entry: (row.entry) ? row.entry.format(format) : item.entry, 
          exit:  (row.exit) ? row.exit.format(format) : item.exit, 
        }
        newItem.total = moment.utc(moment(newItem.exit, format).diff(moment(newItem.entry, format))).format(format)
        newItem.valid = true,
        
        newData.splice(index, 1, newItem);
        props.onChange && props.onChange(newItem);
        setEditingKey('');
        setData(newData)
      }
    });
  }

  const handleAddRow = (record) => {
    console.log(record.rdate + record.dayOfWeek);
    setRecordToAdd(record)
    setAddModalVisible(true)
  }

  const onTimeChanged = (direction, time) => {
    if( direction === 'in' )
      setNewRecordInTime(time)
    else 
      setNewRecordOutTime(time)
  }

  const getTimeField = (item, time) => (
    <XTimePicker item={item} onTimeSelected={onTimeChanged}/>
  )

  const addModalCancel = () => {
      setAddModalVisible(false);
  }

  const validateAddRecord = () => {
    if( !newRecordInTime ) {
      setAddEntryTimeError(true)
      return false;
    } else {
      setAddEntryTimeError(false)
    }

    if( !newRecordOutTime ) {
      setAddExitTimeError(true);
      return false;
    } else {
      setAddExitTimeError(false);
    }

    if( !addRecordNote ) {
      setAddNotesError(true)
      return false
    } else {
      setAddNotesError(false)
    }

    return true
  }

  const addRecord = () => {

    if( !validateAddRecord() )
      return;

    let addedPositions = data.reduce( (accu, current, index) => {
      return {
         key: Math.max(accu.key, parseInt(current.key)),
         position: index
      }
    }, {key:0,
        position: 0});

    const index = data.findIndex( item => 
      item.key == recordToAdd.key
    ) + 1

    let newItem = {
        ...recordToAdd,
        key: addedPositions.key + 1,
        isAdded: true,
        notes: addRecordNote,
        entry: newRecordInTime,
        exit: newRecordOutTime,
    }
    newItem.total = moment.utc(moment(newItem.exit, format).diff(moment(newItem.entry, format))).format(format)

    const newData = [
      ...data.slice(0, index),
      newItem,
      ...data.slice(index)
    ]
    setData(newData);
    setAddModalVisible(false);
  }

  const handleRemoveRecord = (record) => {

    const index = data.findIndex( item => 
      item.key == record.key
    )

    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
  }  

  const addCommentChange = (value) => {
    setAddRecordNote(value)
  }

  const components = {
    body: {
      cell: EditableCell,
    },
  };
  
  let columns = [
      {
        title: '',
        dataIndex: 'add',
        align: 'center',
        dataIndex: 'add',
        render: (text, record) => (

          <Row>
            <Col>
              <Icon type="plus-circle" theme="twoTone" 
                onClick={() => handleAddRow(record)}/>
            </Col>
            <Col>  
              {
                record.isAdded ? 
                  <Popconfirm
                    title={t('sure')}
                    onConfirm={() => handleRemoveRecord(record)}>
                      <Icon type='minus-circle' theme='twoTone' />  
                  </Popconfirm>    
                : null
              }
            </Col>  
          </Row>
        )
      },
      {
        title: 'יום',
        dataIndex: 'day',
        align: 'right',
        ellipsis: true,
        editable: false,
      },
      {
        title: 'יום בשבוע',
        dataIndex: 'dayOfWeek',
        align: 'right',
        ellipsis: true,
        editable: false,
      },    
      {
        title: 'כניסה',
        dataIndex: 'entry',
        align: 'right',
        editable: true,
        render: (text) => {
          let tagColor = 'green';
          if( text === '0:00' ) {
            tagColor = 'volcano'
          }
          return <Tag color={tagColor}
                    style={{
                      marginRight: '0'
                  }}>
                    {text}
                  </Tag>
        }          
      },
      {
        title: 'יציאה',
        dataIndex: 'exit',
        align: 'right',
        editable: true,
        render: (text) => {
          let tagColor = 'green';
          if( text === '0:00' ) {
            tagColor = 'volcano'
          }
          return <Tag color={tagColor}
                    style={{
                      marginRight: '0'
                  }}>
                    {text}
                  </Tag>
        }
      },
      {
        title: 'סיכום',
        dataIndex: 'total',
        align: 'right',
        editable: false,
      },
      {
        title: 'הערות',
        dataIndex: 'notes',
        align: 'right',
        editable: true,
        render: (text, _) => 
          ( text !== '' ) ?
              <Tag color="volcano"
                style={{
                  marginRight: '0'
                }}>
                {text}
              </Tag>
              : null
      },
      {
        title: '',
        dataIndex: 'operation',
        render: (text, record) => 
           (record.requireChange)? 
            (<EditIcons 
              recordId={record.key}
              editing={isRowEditing(record)} 
              disable={editingKey !== ''} 
              edit={edit} 
              save={save} 
              cancel={cancel}
            />): {}
      },
      
    ];


  // columns = columns.map(col => {
  //   if (!col.editable) {
  //     return col;
  //   }
  //   return {
  //     ...col,
  //     onCell: (record, rowIndex) => ({
  //       record,
  //       inputType: (col.dataIndex === 'exit' ||
  //         col.dataIndex === 'entry') ? 'time' : 'text',
  //       dataIndex: col.dataIndex,
  //       title: col.title,
  //       rowEditing: isRowEditing(record),
  //       cellEditbale: col.dataIndex === 'notes' || 
  //                     originalData[rowIndex][col.dataIndex] === '0:00',
  //     }),
  //   };
  // });

  const isValid = !data.some(r => !r.valid)
  if (isValid) {
    props.onValidated && props.onValidated(data)
  }

  
  return (
    <ReportContext.Provider value={props.form}>
      <Modal visible={addModalVisible}
            title={recordToAdd? recordToAdd.rdate: null}
            onCancel={() => {}}
            footer={[
               <Button key='approve' type="primary" onClick={addRecord}>{t('approve')}</Button>,
               <Button key='cancel' onClick={addModalCancel}>{t('cancel')}</Button>
            ]}>

            {/* <Form layout="vertical" className='rtl'>
                <Form.Item label={t('in')} className='rtl'>
                {
                  getFieldDecorator("xTimePicker", {
                    rules: [{ 
                              required: true, 
                              message: t('add_entry_error') 
                            }],
                  })(<XTimePicker />)
                }
               </Form.Item>
               <Form.Item label={t('out')}>
               </Form.Item>
               <Form.Item label={t('notes')}>
                {
                    getFieldDecorator(t('notes'), {
                    rules: [{ 
                              required: true, 
                              message: t('add_notes_error') 
                            }],
                  })(<Input size='small' onChange={ event => addCommentChange(event.target.value)}/>)
                }
               </Form.Item>
            </Form> */}

            <Card type="inner">

              <Row gutter={[16, 16]}>
                <Col span={8} offset={10}>
                {
                    getTimeField('in')
                }
                </Col>               
                <Col span={4}>
                    {t('in')}
                </Col> 
                <Col span={2}>
                  <Icon type="login" />
                </Col>
              </Row>
              {
                addEntryTimeError? 
                  <Row>
                    <Col>{t('add_entry_error')}</Col>
                  </Row>: 
                  null
              }
              <Row gutter={[16, 16]}>
                <Col span={8} offset={10}>
                {
                    getTimeField('out')
                }
                </Col>               
                <Col span={4}>
                    {t('out')}
                </Col> 
                <Col span={2}>
                  <Icon type="logout" />
                </Col>
              </Row>
              {
                addExitTimeError? 
                  <Row>
                    <Col>{t('add_exit_error')}</Col>
                  </Row>:                 
                null
              }
              <Row gutter={[16, 16]}>
                <Col span={20}>
                  <Input size='small' onChange={ event => addCommentChange(event.target.value)}/>
                </Col>
                <Col span={4}>
                    <div className='rtl'>{t('notes')}</div>
                </Col>
              </Row>
              {
                addRecordNote? 
                  <Row>
                    <Col>{t('add_notes_error')}</Col>
                  </Row>:                   
                null
              }
            </Card>
      </Modal>      
      <Table
        {...props}
        style={{ 
                direction: 'rtl', 
                heigth: '600px',
                margin: '12px' 
                }}
        tableLayout='auto'
        bordered={false}
        components={components}
        dataSource={data}
        columns={columns}
        rowClassName="editable-row"
        pagination={false}
        size="small"
        tableLayout={undefined}
      />
    </ReportContext.Provider>
  );
}

export default Form.create()(EditableTable)