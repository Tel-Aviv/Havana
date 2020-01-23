

import React, { useState } from 'react'

import { TimePicker, Button } from 'antd';

const format = 'H:mm';
export default React.forwardRef( (props, ref) => {
    const [open, setOpen] = useState(false);

    const handleOk = (e) => {
        setOpen(false)
    }

    return (
        <TimePicker
            ref={ref}
            {...props}
            format={format}
            open={open}
            onOpenChange={(e) => setOpen(e)}
            addon={() => (
                <Button size="small" type="primary" onClick={(e) => handleOk(e)}>
                    Ok
                </Button>
            )} />
    )
})