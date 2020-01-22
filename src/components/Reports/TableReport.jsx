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

]

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [],
      originalData: [],
      editingKey: '' 
    };
    this.columns = [
      {
        title: 'יום',
        dataIndex: 'day',
        align: 'right',
        ellipsis: true,
        editable: false,
      },
      {
        title: 'כניסה',
        dataIndex: 'entry',
        width: '15%',
        align: 'center',
        editable: true,
      },
      {
        title: 'יציאה',
        dataIndex: 'exit',
        width: '15%',
        align: 'center',
        editable: true,
      },
      {
        title: 'סיכום',
        dataIndex: 'total',
        width: '10%',
        align: 'center',
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
    ];
  }

  componentDidUpdate(prevProps, prevState ){
      if(this.props.dataSource != prevProps.dataSource) {
        this.setState({
          ...this.state,
          originalData: this.props.dataSource,
          data: this.props.dataSource.map( record =>  {
            record.requireChange = this.isRowEditable(record);
            record.valid = (record.requireChange)?  false : true;
            return record
          }),
        })
      }
  }

  isRowEditing = record => {
    return record.key === this.state.editingKey
  }

  isRowEditable = record => {
    return this.props.editable &&  // not manager
      record.dayOfWeek != "ז" &&
      record.dayOfWeek != "ו" && (  
        !record.entry || !record.exit  
      )
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
        this.setState({ data: newData, editingKey: '' });
        this.props.onChange && this.props.onChange(newData)
      }
    });
  }
  edit(key) {
    this.setState({ editingKey: key });
  }
  submit() {

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
          cellEditbale: col.dataIndex == 'notes' || 
                        !this.state.originalData[rowIndex][col.dataIndex],
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
          style={{ direction: 'rtl' }}
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
          
        />
      </ReportContext.Provider>
    );
  }
}


export default Form.create()(EditableTable)