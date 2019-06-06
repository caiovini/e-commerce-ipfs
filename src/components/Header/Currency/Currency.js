import { Container , Row  } from 'react-bootstrap';
import React , { Component } from 'react';
import { NavLink } from 'react-router-dom';
import Price from './Price/Price';
import './Currency.css';
import './Price/Price.css';

class Currency extends Component{

    render(){

    return(

        <div className="site-branding-area">
        <Container>

            <Row>

                <div className="col-sm-6">
                    <div className="logo">
                        <h1><NavLink to={"/"}>e<span>Ágora</span></NavLink></h1>
                    </div>
                </div>
                
                <Price/>
            </Row>
        </Container>
        </div> 

    );}
}

export default Currency;