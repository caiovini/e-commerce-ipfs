import { Form , Row , Col , Button , Dropdown , Spinner } from 'react-bootstrap';
import React , { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { buyer  , seller } from '../../orbitdb/orbit';
import agora from '../../../ethereum/agora';
import { Crypt } from 'hybrid-crypto-js';
import './index.css';

const { withGun } = require('react-gun');
const Insert = require('../../orbitdb/insert'); //Insert data from database
const Fetch = require('../../orbitdb/fetch'); //Fetch data from database


class Address extends Component{

    constructor(){

        super();

        this.state = {
            addressType: 'Type of address',
            errors: {},
            country: '',
            state: '',
            city: '',
            street: '',
            number: 0,
            complement: '',
            zipCode: 0,
            isLogged: false,
            signature: '',
            privateKey: '',
            loading: false
        }

        this.handleDropDownAddress = this.handleDropDownAddress.bind(this);
        this.fetchUserData = this.fetchUserData.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentWillMount(){

        this.props.gun.get('user').once((data, key) => {

            if(data){
            
                this.setInitialUserData( data.signature , data.privateKey  , data.logged);
            }
        });
    }

    setInitialUserData( signature , privateKey , logged ){

        this.setState( { signature , privateKey , isLogged: logged });
    }

    handleDropDownAddress(e , id){

        e.preventDefault();
        this.setState({ addressType: id }); //id is type of address
        if(this.state.addressType !== 'Type of address'){
            this.setState({
                country: '',
                state: '',
                city: '',
                street: '',
                number: 0,
                complement: '',
                zipCode: 0
            }) 
        }
        this.fetchUserData(id);
    }

    fetchUserData(id){

        const crypt = new Crypt();

        this.setState({ loading: true });

        Fetch.commit(this.state.signature , "" , id === 'Buyer address' ? buyer : seller , 'byId').then( async (res) => {

            const data = await res.json();

            if(data.result.length > 0){

                const result = data.result[0].encrypted;
                const decrypt = await crypt.decrypt(this.state.privateKey , result); 
                const address = JSON.parse(decrypt.message);                

                if(res.ok){     
                    this.setState({
                        country: address.country, 
                        state: address.state, 
                        city: address.city, 
                        street: address.street, 
                        number: address.number, 
                        complement: address.complement, 
                        zipCode: address.zipCode,
                        loading: false})
                }else{

                    alert('Error fetcching address');
                    this.setState({ loading: false });
                }
            }

        }).catch((err) => {

            alert('error: ' + err);
            this.setState({ loading: false });
        });            

    }

    onSubmit = async (event) => {

        event.preventDefault();
        if(this.validateForm()){

            const crypt = new Crypt();

            const addressData = {
                country: this.state.country.trim() ,
                state: this.state.state.trim() ,
                city: this.state.city.trim() , 
                street: this.state.street.trim() ,
                number: this.state.number , 
                complement: this.state.complement.trim() ,
                zipCode: this.state.zipCode }

            const publicKey = await agora.methods.getPubKey( this.state.signature ).call();                
            const encrypted = crypt.encrypt(publicKey , JSON.stringify(addressData)); //Encrypt data before sending to database
            const query = { _id: this.state.signature , encrypted: encrypted  };

            Insert.commit(query , this.state.addressType === 'Buyer address' ? buyer : seller).then((res) => {

                if(res.ok){

                    alert("Success");
                    window.location.reload();

                }else{

                    alert('Error inserting new address');
                }   

            }).catch((err) => {

                alert('Error: ' + err);

            });            

            this.setState({ loading: false });
        }
    }

    validateForm(){

        let errors = {};
        let isValid = true;

        if(this.state.addressType === 'Type of address'){
            isValid = false;
            errors["addressType"] = "*Choose the type of address";
        }

        if(!this.state.country){
            isValid = false;
            errors["country"] = "*Country field must be filled";
        }

        if (this.state.country) {
            if (this.state.country.match(';')) {
                isValid = false;
                errors["country"] = "*Character ';' is invalid";
            }
        }

        if(!this.state.state){
            isValid = false;
            errors["state"] = "*State field must be filled";
        }

        if (this.state.state) {
            if (this.state.state.match(';')) {
                isValid = false;
                errors["state"] = "*Character ';' is invalid";
            }
        }

        if(!this.state.city){
            isValid = false;
            errors["city"] = "*City field must be filled";
        }

        if (this.state.city) {
            if (this.state.city.match(';')) {
                isValid = false;
                errors["city"] = "*Character ';' is invalid";
            }
        }

        if(!this.state.street){
            isValid = false;
            errors["street"] = "*Street field must be filled";
        }

        if (this.state.street) {
            if (this.state.street.match(';')) {
                isValid = false;
                errors["street"] = "*Character ';' is invalid";
            }
        }

        if(!this.state.number){
            isValid = false;
            errors["number"] = "*Number field must be filled";
        }

        if(!this.state.zipCode){
            isValid = false;
            errors["zipcode"] = "*Zip code field must be filled";
        }

        if (this.state.complement) {
            if (this.state.complement.match(';')) {
                isValid = false;
                errors["complement"] = "*Character ';' is invalid";
            }
        }

        this.setState({
            errors
        })
        return isValid;
    }

    handleChange(e){

        e.preventDefault();

        switch(e.target.name){

            case 'country':
                this.setState({ country: e.target.value });
            break;

            case 'state':
                this.setState({ state: e.target.value });
            break;

            case 'city':
                this.setState({ city: e.target.value });
            break;

            case 'street':
                this.setState({ street: e.target.value });
            break;

            case 'number':
                this.setState({ number: e.target.value.replace(/[^0-9]/g,'') });
            break;

            case 'complement':
                this.setState({ complement: e.target.value });
            break;

            case 'zipcode':
                this.setState({ zipCode: e.target.value.replace(/[^0-9]/g,'') });
            break;

            default:
            break;
        }
    }

    render(){

        return(

            this.state.isLogged
            ?    
            <div style={{ marginTop: '2%'}}>
                <Menu className="menu-address">
                    <h2>My addresses</h2>
                </Menu>

                <h6 style={ { marginLeft: "20px" , marginTop: "2%" } } >If you are a buying, submit an address where the product will be delivered.</h6>
                <h6 style={ { marginLeft: "20px" } } >If you are a selling, submit an address where the product will be collected.</h6>
                <h6 style={ { marginLeft: "20px" } } >You can submit both.</h6>
                
                <div className="errorMsg">{this.state.errors.connection}</div>

                <Dropdown style={ {marginLeft: "20px" , marginTop: "2%"} }>
                    <Dropdown.Toggle id="dropdown-custom-1">{this.state.addressType}</Dropdown.Toggle>
                    {this.state.loading?
                    <span >
                        <span style={{ marginLeft: '15px' }}>Loading ...</span>
                        <Spinner style={{ marginLeft: '2px' }} animation="grow" variant="secondary"/>
                    </span>
                    :<span></span>}
                    <Dropdown.Menu className="super-colors">
                        <Dropdown.Item onClick = {(e) => this.handleDropDownAddress(e,"Buyer address")}>Buyer address</Dropdown.Item>
                        <Dropdown.Item onClick = {(e) => this.handleDropDownAddress(e,"Seller address")}>Seller address</Dropdown.Item>
                    </Dropdown.Menu>
                    <div className="errorMsg">{this.state.errors.addressType}</div>
                </Dropdown>

                <Form onSubmit={this.onSubmit.bind(this)} className="userRegistrationForm" style={{ margin: '2%' }}>
                    <Row>
                        <Col>
                            <label>Country</label>
                            <input 
                             type="text" 
                             name="country"
                             placeholder="Country"
                             value = { this.state.country }
                             onChange = { this.handleChange }
                             autoComplete="off"/>
                             <div className="errorMsg">{this.state.errors.country}</div>
                        </Col>
                        <Col>
                            <label>State</label>
                            <input 
                             type="text" 
                             name="state" 
                             placeholder="State" 
                             value = {this.state.state}
                             onChange = { this.handleChange }
                             autoComplete="off"/>
                             <div className="errorMsg">{this.state.errors.state}</div>
                        </Col>
                        <Col>
                            <label>City</label>
                            <input 
                             type="text" 
                             name="city" 
                             placeholder="City" 
                             value = {this.state.city}
                             onChange = { this.handleChange }
                             autoComplete="off"/>
                             <div className="errorMsg">{this.state.errors.city}</div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <label>Street</label>
                            <input 
                             type="text" 
                             name="street"
                             placeholder="Street"
                             value = {this.state.street}
                             onChange = { this.handleChange }
                             autoComplete="off"/>
                             <div className="errorMsg">{this.state.errors.street}</div>
                        </Col>
                        <Col>
                            <label>Number</label>
                            <input 
                             type="text" 
                             name="number"
                             placeholder="Number"
                             value = {this.state.number === 0 ? '' : this.state.number}
                             onChange = { this.handleChange }
                             autoComplete="off"/>
                             <div className="errorMsg">{this.state.errors.number}</div>
                        </Col>
                    </Row> 
                    <Row>
                        <Col>
                            <label>Complement</label>
                            <input 
                             type="text" 
                             name="complement"
                             placeholder="Complement"
                             value = {this.state.complement}
                             onChange = { this.handleChange }
                             autoComplete="off"/>
                             <div className="errorMsg">{this.state.errors.complement}</div>
                        </Col>
                        <Col>
                            <label>Zip code</label>
                            <input 
                             type="text" 
                             name="zipcode"
                             placeholder="Zip code"
                             value = {this.state.zipCode === 0 ? '' : this.state.zipCode}
                             onChange = { this.handleChange }
                             autoComplete="off"/>
                             <div className="errorMsg">{this.state.errors.zipcode}</div>
                        </Col>
                    </Row>
                    <Button style={{ marginTop: '2%'}} type="submit"> Submit it </Button>   
                </Form>    
            </div>
            :<div style={{ marginTop: '2%'}}>
                <Menu className="menu-address">
                    <h2>You must be logged</h2>
                </Menu>
            </div>
        );
    }
}

export default withGun(Address);