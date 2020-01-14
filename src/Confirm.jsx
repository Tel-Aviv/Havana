import React from 'react';
import { useParams } from 'react-router-dom';

const Confirm = (props) => {
    
    const routeParams = useParams();
    console.log(routeParams.userid);

    return (
        <div>SS</div>
    )
}

export default Confirm;