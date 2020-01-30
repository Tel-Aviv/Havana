// @flow
import React from 'react'
import axios from 'axios';
import 'antd/dist/antd.css';
import { Table, Popconfirm, Form, Icon, Button } from 'antd';
var moment = require('moment');

import { ReportContext } from "./table-context";
import EditableCell from './EditableCell'
import EditIcons from './EditIcons';

const format = 'H:mm';

const columns =[
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
        width: '15%',
        align: 'right',
        editable: true,
      },
      {
        title: 'יציאה',
        dataIndex: 'exit',
        width: '15%',
        align: 'right',
        editable: true,
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
        width: '40%',
        align: 'right',
        editable: true,
      },
      {
        title: '',
        width: '8%',
        dataIndex: 'operation',
        render: (text, record) => 
           (record.requireChange)? 
            (<EditIcons 
              recordId={record.key}
              editing={this.isRowEditing(record)} 
              disable={this.state.editingKey !== ''} 
              edit={this.edit.bind(this)} 
              save={this.save.bind(this)} 
              cancel={this.cancel.bind(this)}
            />): {}
      },
]

class EditableTable extends React.Component {

  constructor(props) {
    
    super(props);

    this.state = { 
      data: [],
      originalData: [],
      editingKey: '' 
    };
  }

  componentDidUpdate(prevProps, prevState ){
      if(this.props.dataSource != prevProps.dataSource) {
        this.setState({
          ...this.state,
          originalData: this.props.dataSource,
          data: this.props.dataSource.map( record =>  {
            return { 
                ...record, 
                requireChange : this.isRowEditable(record),
                valid : (record.requireChange)?  false : true,
                rdate : moment(record.rdate).format('DD/MM/YYYY')
            }
          }),
        })
      }
  }

  isRowEditing = record => {
    return record.key === this.state.editingKey
  }

  isRowEditable = record => {
    return this.props.editable &&  // not manager
      record.notes !== ''
  }
  cancel = () => {
    this.setState({ editingKey: '' });
  };

  save(form, key) {
    form.validateFields((error, row) => {
      if (error) {
        return;
      }
      const newData = [...this.state.data];
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
        this.props.onChange && this.props.onChange(newItem);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }
  
  edit(key) {
    this.setState({ editingKey: key });
  }
  
  render() {
    const components = {
      body: {
        cell: EditableCell,
      },
    };
    
    const columns = this.columns.map(col => {
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
          rowEditing: this.isRowEditing(record),
          cellEditbale: col.dataIndex === 'notes' || 
                        this.state.originalData[rowIndex][col.dataIndex] === '0:00',
        }),
      };
    });

    const isValid = !this.state.data.some(r => !r.valid)
    if (isValid) {
      this.props.onValidated && this.props.onValidated(this.state.data)
    }
    return (
      <ReportContext.Provider value={this.props.form}>
        <Table
          style={{ direction: 'rtl', heigth: '600px' }}
          {...this.props}
          tableLayout='auto'
          bordered={false}
          components={components}
          dataSource={this.state.data}
          columns={columns}
          rowClassName="editable-row"
          pagination={false}
          size="small"
          tableLayout={undefined}
          scroll={{y: '600px'}}
        />
      </ReportContext.Provider>
    );
  }
}


export default Form.create()(EditableTable)