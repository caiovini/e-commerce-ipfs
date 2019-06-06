import React , { Component } from 'react';
import Description from './Description/Description'
import Products from './Products/Products'
import { Container } from 'react-bootstrap';


class Body extends Component{

    
    render(){

    return(

        <Container>

            <div style={{ marginTop: '2%' }}>
                <Description />
            </div>

            <div style={{ marginTop: '1%' }}>

                <Products />
                
            </div>


        </Container>
    );}
}

export default Body;