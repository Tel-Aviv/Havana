// @flow
import React from 'react'
import 'antd/dist/antd.css';

import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined
} from '@ant-design/icons';
import { Popconfirm  } from 'antd';
import { ReportContext } from "./table-context";

const iconStyle = {
    margin: 8,
    fontSize: '100%'
}

export default ({recordId, display, editing, disable, edit, save, cancel}) => {
    return editing ? (
      <span>
        <Popconfirm title="האם ברצונך לבטל את השינויים ?" onConfirm={() => cancel(recordId)}>
          <CloseCircleOutlined theme="twoTone" twoToneColor="#eb2f96" style={iconStyle}/>
        </Popconfirm>
        <ReportContext.Consumer>
          {form => (
            <CheckCircleOutlined theme="twoTone" twoToneColor="#52c41a"
              onClick={() => save(form, recordId)}
              style={iconStyle} />
          )}
        </ReportContext.Consumer>
      </span>
    ) : (
          disable ?
            (<EditOutlined style={iconStyle} />) :
            (<EditOutlined theme="twoTone"
                onClick={() => edit(recordId)} type="edit" style={iconStyle} />) 
    )
  }