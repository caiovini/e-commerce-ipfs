import React from 'react';
import './Footer.css';
import Eth from './Assets/ethereum_icon.svg';
import ReactSVG from 'react-svg'

export default () =>{

    return(

        <div className="footer">
            <h4>© 2019. Powered by react, ethereum and gunDB</h4>
         {/*<img className="img-svg" src={ Eth } ></img>*/}
            <ReactSVG className="img-svg" src={ Eth } ></ReactSVG>
        </div>
    )
}