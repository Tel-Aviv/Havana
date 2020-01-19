// @flow
import React from 'react'
import axios from 'axios';
import 'antd/dist/antd.css';
import { Table, Popconfirm, Form, Icon, Button } from 'antd';
var moment = require('moment');

import { EditableContext } from "./table-context";
import EditableCell from './EditableCell'
import Axios from 'axios';

const format = 'H:mm';


const iconStyle = {
  margin: 8,
  fontSize: '100%'
}

class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      data: [],
      editingKey: '' 
    };
    this.columns = [
      {
        title: 'יום',
        dataIndex: 'day',
        ellipsis: true,
        editable: false,
      },
      // {
      //   title: 'יום',
      //   dataIndex: 'dayOfWeek',
      //   ellipsis: true,
      //   align: 'center',
      //   editable: false,
      // },
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
        render: (text, record) => {
          const { editingKey } = this.state;
          const editable = record.requireChange;
          const editing = this.isRowEditing(record);
          return !editable ? {} :
          editing ? (
            <span>
              <Popconfirm title="האם ברצונך לבטל את השינויים ?" onConfirm={() => this.cancel(record.key)}>
                <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96" style={iconStyle} />
              </Popconfirm>
              <EditableContext.Consumer>
                {form => (
                  <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a"
                    onClick={() => this.save(form, record.key)}
                    style={iconStyle} />
                )}
              </EditableContext.Consumer>
            </span>
          ) : (
              editingKey === '' ?
                (<Icon type="edit" theme="twoTone"
                  onClick={() => this.edit(record.key)} type="edit" style={iconStyle} />)
                : (
                  <Icon type="edit" style={iconStyle} />
                )

            );
        },
      },
    ];
  }

  componentDidUpdate(prevProps, prevState ){
      if(this.props.dataSource != prevProps.dataSource) {
        this.setState({
          ...this.state,
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
    return true &&  // not manager
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
      } else {
        newData.push(row);
        this.setState({ data: newData, editingKey: '' });
      }
    });
  }
  edit(key) {
    this.setState({ editingKey: key });
  }
  submit() {
     axios({
       method: 'post',
       data: this.state.data,
       url: `http://${dataContext.host}/me/reports/?year=2019&month=12`,
       withCredentials: true
     }) 
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
        onCell: record => ({
          record,
          inputType: (col.dataIndex === 'exit' ||
            col.dataIndex === 'entry') ? 'time' : 'text',
          dataIndex: col.dataIndex,
          title: col.title,
          rowEditing: this.isRowEditing(record),
        }),
      };
    });

    const isValid = !this.state.data.some(r => !r.valid)
    return (
      <EditableContext.Provider value={this.props.form}>
        <Table
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
        <Button disabled={!isValid} onClick={() => this.submit()} type="primary">Submit</Button>
      </EditableContext.Provider>
    );
  }
}


export default Form.create()(EditableTable)