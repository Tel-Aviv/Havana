// @flow
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'antd/dist/antd.css';
import { Table, Popconfirm, Form, Icon, Button, Tag } from 'antd';
var moment = require('moment');

import { ReportContext } from "./table-context";
import EditableCell from './EditableCell'
import EditIcons from './EditIcons';

const format = 'H:mm';

const EditableTable = (props) => {
  const [data, setData] = useState([])
  const [originalData, setOriginalData] = useState([])
  const [editingKey, setEditingKey] = useState('')

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

  const components = {
    body: {
      cell: EditableCell,
    },
  };
  
  let columns = [
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
  
  return (
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
  );
}

export default Form.create()(EditableTable)
