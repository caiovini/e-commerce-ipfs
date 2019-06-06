import React , { Component } from 'react';

const { withGun } = require('react-gun');


class Info extends Component{
    
    render(){

        return(

            <div>
                Info page
            </div>

        );
    }
}

export default withGun(Info);
