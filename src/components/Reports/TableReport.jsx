// @flow
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ADD_ITEM } from '../../redux/actionTypes';
import 'antd/dist/antd.css';
import { Table, Popconfirm, Modal, Form, Icon, Button, 
        Tag, Row, Col } from 'antd';
var moment = require('moment');
import { useTranslation } from "react-i18next";

import { ReportContext } from "./table-context";
import EditableCell from './EditableCell'
import EditIcons from './EditIcons';
import CustomTimePicker from '../CustomTimePicker'
import AddRecordModal from './AddRecordModal';

const format = 'H:mm';

const EditableTable = (props) => {

  const { getFieldDecorator, getFieldError, isFieldTouched } = props.form;

  const [data, setData] = useState([])
  const [originalData, setOriginalData] = useState([])
  const [editingKey, setEditingKey] = useState('')

  const dispatch = useDispatch();

  const action_ItemAdded = (item, index) => ({
    type: ADD_ITEM,
    addIndex: index,
    addItem: item
  });  

  // States for adding nee record
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false)
  const [recordToAdd, setRecordToAdd] = useState();

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
    return props.editable 
            //&&  record.notes !== ''
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
    setRecordToAdd(record);
    setAddModalVisible(true)
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
      width: '5%',
      editable: false,
      render: (text, record) => 
        props.editable? (
          <Row>
            <Col span={12}>
              <Icon type="plus-circle" theme="twoTone" 
                    onClick={() => handleAddRow(record)}/>
            </Col>
            <Col span={12}>
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
        ) : null
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
        title: t('in'),
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
        title: t('out'),
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
        title: t('notes'),
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
            />): null
      },
    ];


  columns = columns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record, rowIndex) => ({
        record,
        inputType: (col.dataIndex === 'exit' ||
          col.dataIndex === 'entry') ? 'time' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        rowEditing: isRowEditing(record),
        cellEditbale: col.dataIndex === 'notes' || 
             data[rowIndex][col.dataIndex] === '0:00'
      }),
    };
  });

  const isValid = !data.some(r => !r.valid)
  if (isValid) {
    props.onValidated && props.onValidated(data)
  }

  const handleAddSubmit = e => {

    e.preventDefault();
    props.form.validateFields( (err, values) => {
      
      console.log(values);
      
      if( !err ) {
        setAddModalVisible(false);
        const _values = {
          inTime: values["date-picker-in"],
          outTime: values["date-picker-out"],
          note: values["notes"]
        }
        addRecord(_values);
      }
      
    })
  }

  const onCancelAdd = () => 
    setAddModalVisible(false);

  const addRecord = ({inTime, outTime, note}) => {
    
    setAddModalVisible(false);

    let addedPositions = data.reduce( (accu, current, index) => {
      return {
        key: Math.max(accu.key, parseInt(current.key)),
        position: index
     }      
    },  {key:0,
      position: 0})

    const index = data.findIndex( item => 
        item.key == recordToAdd.key
      ) + 1     
      
    let newItem = {
        ...recordToAdd,
        key: addedPositions.key + 1,
        isAdded: true,
        notes: note,
        entry: inTime.format(format),
        exit: outTime.format(format)
    }      

    newItem.total = moment.utc(moment(newItem.exit, format).diff(moment(newItem.entry, format))).format(format)    

    dispatch(
      action_ItemAdded(newItem, index)
    );  

    const newData = [
      ...data.slice(0, index),
      newItem,
      ...data.slice(index)
    ]    

    setData(newData);
  }

  const handleRemoveRecord = (record) => {
    
    const index = data.findIndex( item => 
      item.key == record.key
    )    

    const newData = [...data.slice(0, index), ...data.slice(index + 1)];
    setData(newData);
  }
  
  return (
      <>
        <AddRecordModal 
              visible={addModalVisible}
              onCancel={onCancelAdd}
              onAddRecord={addRecord}
        />

        <ReportContext.Provider value={props.form}>
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
    </>
  );
}

export default Form.create({
  name: "report_table"
})(EditableTable)
