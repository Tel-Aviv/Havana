import React, { useState } from 'react';

import { Button, TimePicker  } from 'antd';

const XTimePicker = ( (props) => {
    
    const [open, setOpen] = useState(false);
    const [selectedTime, setSelectedTime] = useState();

    const handleOk = () => {
        setOpen(false)
        if( props.onTimeSelected ) 
            props.onTimeSelected(props.item, selectedTime);
    }
    const onChange = (time, timeString) => {
        setSelectedTime(timeString);
    }
    return <TimePicker
                className='ltr'
                {...props}
                allowClear={false}
                format={'H:mm'}
                open={open}
                size='small'
                onChange={onChange}
                onOpenChange={(e) => setOpen(e)}
                addon={ () => (
                    <Button size='small' type='primary' 
                            style={{
                                width: '100%'
                            }}    
                            onClick={handleOk}>OK</Button>
                )}/>
})



export default XTimePicker;
