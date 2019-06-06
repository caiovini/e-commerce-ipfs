import React from 'react';
import Header from '../Header';
import Footer from '../Footer'
import { Container } from 'react-bootstrap';




export default props => {

    return(

        <Container>
            <Header />

            { props.children }

            <div style={{ marginTop: '5%' }}>
                <Footer />
            </div>
            
        </Container>

    );

};