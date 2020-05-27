// @flow
import React from 'react'
import 'antd/dist/antd.css';
import { Popconfirm, Icon, Tooltip } from 'antd';
import { useTranslation } from "react-i18next";

import { ReportContext } from "./table-context";

const iconStyle = {
    margin: 8,
    fontSize: '100%'
}

export default ({recordId, display, editing, disable, edit, save, cancel}) => {

    const {t} = useTranslation();

    return editing ? (
      <span>
        <Popconfirm title="האם ברצונך לבטל את השינויים ?" onConfirm={() => cancel(recordId)}
                    className='rtl'>
          <Icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96" style={iconStyle} />
        </Popconfirm>
        <ReportContext.Consumer>
          {form => (
            <Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a"
              onClick={() => save(form, recordId)}
              style={iconStyle} />
          )}
        </ReportContext.Consumer>
      </span>
    ) : (
          disable ?
            (<Icon type="edit" style={iconStyle} />) :
            (<Tooltip title={t('edit_record')}>
                <Icon type="edit" theme="twoTone"
                onClick={() => edit(recordId)} type="edit" style={iconStyle} />
              </Tooltip>) 
    )
  }
