

// @flow
import React, { useState } from 'react'

import { TimePicker, Button } from 'antd';

export default React.forwardRef((props, ref) => {
    const [open, setOpen] = useState(false);
    return (
        <TimePicker
            ref={ref}
            {...props}
            format={format}
            open={open}
            onOpenChange={(e) => setOpen(e)}
            addon={() => (
                <Button size="small" type="primary" onClick={(e) => setOpen(false)}>
                    Ok
                </Button>
            )} />
    )
})