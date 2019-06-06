import {  Card , Button , Col , CardDeck , Form , Dropdown , Row , Carousel } from 'react-bootstrap';
import CurrencyInput from 'react-currency-input';
import { baseLink } from '../../../IPFS/ipfs';
import { products } from '../../../orbitdb/orbit';
import React , { Component } from 'react';

const { withGun } = require('react-gun');
const currencyApi = require('../../../Currency/Api'); //Get exchange rate
const Insert = require('../../../orbitdb/insert'); //Insert data from database
const Fetch = require('../../../orbitdb/fetch'); //Fetch data from database
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ETHEREUM&vs_currencies=BRL%2CBTC%2CUSD';


class EditProduct extends Component{

    constructor(){

        super();

        this.state = {
            dataProducts: null,
            signature: '',
            isLogged: false,
            errors: {},
            productName: '', 
            stock: '', 
            productDescription: '',
            category: '',
            hashes: [],
            editProductId: '',
            currency: 'Currency',
            price: 0,
            priceInEther: 0,
            exchangeRate: {}
        }

        this.refForm = React.createRef() 
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeCurrency = this.handleChangeCurrency.bind(this);
        this.handleDropDownCurrency = this.handleDropDownCurrency.bind(this);
        
    }

    componentWillMount(){

        this.props.gun.get('user').once((data, key) => {
            
            this.setInitialUserData( data.logged , data.signature );
        });
    }

    setInitialUserData(logged , signature){

        this.setState( {isLogged: logged , signature});
    }

    async componentDidMount() {

        /* Fetch exchange rates */   
  
        await currencyApi.getPrice(url).then((result) => {   
              
            const { brl , usd , btc } = result.ethereum;
            this.setState( {exchangeRate: { brl: brl , usd: usd , btc: btc }} );
  
        }).catch((reason) => {
  
            alert('error loading currency: ' + reason);
        });

        let items = [];
        const idProduct = this.props.match.params.id;

        Fetch.commit(idProduct , "" ,  products , 'byId').then( async (res) => {

            const data = await res.json();
            let priceInEther = this.getPriceInEther(data.result[0].currency , data.result[0].price);
                
            items.push(
                <Col sm={'auto'} key={data.result[0]._id}>
                    <Card className="card-products-details">
                    {data.result[0].hash.length === 1
                            ? <Card.Img key={ 0 } variant="top" src={baseLink + data.result[0].hash[0].hashLink} />
                            : <Carousel interval={null}>
                                { this.fetchImages(data.result[0].hash) }
                              </Carousel>}
                        <Card.Body> 
                              <Card.Title><h2>{data.result[0].product}</h2></Card.Title>
                              <Card.Text>
                                   Price: ETH {priceInEther}
                              </Card.Text>
                              <Card.Text>
                                <textarea style={{ backgroundColor: "#FFF"}}
                                    disabled = "disabled"
                                    value={data.result[0].description}
                                    className="form-control"
                                  rows="5"
                                />
                              </Card.Text>
                        </Card.Body>
                    </Card>
                </Col> )

                this.setState({
                    productDescription: data.result[0].description,
                    productName: data.result[0].product,
                    stock: data.result[0].stock,
                    currency: data.result[0].currency,
                    price: data.result[0].price,
                    editProductId: data.result[0].key,
                    category: data.result[0].category,
                    hashes: data.result[0].hash,
                    dataProducts: items,
                    priceInEther
                })  

        }).catch((err) => {

            alert('error: ' + err);
        
        });      
    }

    fetchImages(hashes) {

        let items = [];

        for(let i = 0; i < hashes.length; i ++){

            items.push(<Card.Img key={ i } variant="top" src={baseLink + hashes[i].hashLink} />);
        }

        return items;
    }

    getPriceInEther(currency , price){

        let priceInEther = 0;

        switch(currency){

            case 'BRL':

                priceInEther = price / this.state.exchangeRate.brl;
                return priceInEther;

            case 'BTC':

                priceInEther = price / this.state.exchangeRate.btc;
                return priceInEther.toFixed(8);

            case 'USD':

                priceInEther = price / this.state.exchangeRate.usd;
                return priceInEther;

            default:

                return priceInEther;
        }
    }

    submitUpdateItem = (event) => {  

        event.preventDefault();

        if(this.validateForm()){

            const idProduct = this.props.match.params.id; 

            const query = { 
                _id: idProduct ,
                product: this.state.productName ? this.state.productName : '' ,
                currency: this.state.currency ,
                price: this.state.price , 
                description: this.state.productDescription ? this.state.productDescription : '' , 
                category: this.state.category,
                signature: this.state.signature ,
                stock: this.state.stock ,
                hash: this.state.hashes };
            
            Insert.commit(query , products).then((res) => {

                if(res.ok){

                    alert("Success");
                    window.location.reload();

                }else{

                    alert('Error inserting new address');
                }   

            }).catch((err) => {

                alert('Error: ' + err);

            });
        }
    }

    handleChange(e) {

        e.preventDefault();

        switch(e.target.name){

            case 'productName':

                this.setState({ productName: e.target.value });

            break;

            case 'productDescription':

                this.setState({ productDescription: e.target.value });

            break;

            case 'stock':

                this.setState({ stock: e.target.value });

            break;

            default:

            break;
        }
    }

    validateForm() {

        let errors = {};
        let formIsValid = true;
  
        if (!this.state.productName) {
          formIsValid = false;
          errors["productName"] = "*Please enter your product's name.";
        }

        if (this.state.currency === 'Currency') {
            formIsValid = false;
            errors["dropdownCurrency"] = "*Choose a currency";
        }

        if (!this.state.stock) {
            formIsValid = false;
            errors["stock"] = "*Number in stock must be filled";
        }

        this.setState({
            errors: errors
          });
        if(!formIsValid) window.scrollTo(0, this.refForm.current.offsetTop);  
        return formIsValid;
    }     

    handleChangeCurrency(){

        const { btc , brl , usd } = this.refs;
        let priceInEther = 0;

        if (btc.state.value !== 0){

            priceInEther = btc.state.value / this.state.exchangeRate.btc
            this.setState({ price: btc.state.value.toFixed(8) , priceInEther })
                    
        }else if (brl.state.value !== 0){

            priceInEther = brl.state.value / this.state.exchangeRate.brl
            this.setState({ price: brl.state.value , priceInEther })
                    
        }else{ 

            priceInEther = usd.state.value / this.state.exchangeRate.usd
            this.setState({ price: usd.state.value , priceInEther })
                    
        }
    }

    handleDropDownCurrency(e , currency){

        e.preventDefault();
        let errors = {};
        this.setState({ currency: currency , price: 0 , errors , priceInEther: 0 })
    }
 

    render(){

        return(
        
        <div>
            {this.state.isLogged
            ?<div>                
                {this.state.dataProducts === null
                ? <div>loading</div>
                : <CardDeck className="row-products"> 
                    { this.state.dataProducts } 
                </CardDeck>
                }

                    <Form ref={ this.refForm } onSubmit={ this.submitUpdateItem } className="userRegistrationForm" style={{ margin: '2%'}}>
                        <h6>When writing the name of the product, try to use terms most commons so the users can easily search.</h6>
                        <input value={ this.state.productName } type="text" name="productName" placeholder="Product" onChange={this.handleChange} autoComplete="off"/>
                        <div className="errorMsg">{this.state.errors.productName}</div>
                        <h6>Description.</h6>
                        <textarea 
                         style={ {marginBottom: "15px" , height: "150px"} }
                         className="form-control"
                         value={ this.state.productDescription }
                         type="text" 
                         name="productDescription"
                         placeholder="Description" 
                         onChange={this.handleChange}
                         autoComplete="off"/>
                         <label>Number of products in stock: </label>
                         <input value={ this.state.stock } onChange={ this.handleChange } style={ {width: "100px"} } type="number" name="stock" min="0" max="100000" step="1" ></input>
                         <div className="errorMsg">{this.state.errors.stock}</div>
                        

                        <h6>All products are sold in ether, but you have to choose which currency you would like to work with and the exchange rate of the day would be applied</h6>
                        <Dropdown style={ {margintop: "10px"} }>
                            <Dropdown.Toggle id="dropdown-custom-1">{this.state.currency}</Dropdown.Toggle>
                            <Dropdown.Menu className="super-colors">
                                <Dropdown.Item onClick = {(e) => this.handleDropDownCurrency(e,"BTC")}>BTC</Dropdown.Item>
                                <Dropdown.Item onClick = {(e) => this.handleDropDownCurrency(e,"BRL")}>BRL</Dropdown.Item>
                                <Dropdown.Item onClick = {(e) => this.handleDropDownCurrency(e,"USD")}>USD</Dropdown.Item>
                            </Dropdown.Menu>
                            <div className="errorMsg">{this.state.errors.dropdownCurrency}</div>
                        </Dropdown> 

                        <Row>
                            <Col>
                                <label>Real</label>
                                <CurrencyInput decimalSeparator="."
                                 prefix="R$ "
                                 ref="brl"
                                 value={ this.state.currency !== "BRL" ? 0 : this.state.price }
                                 onChange={ this.handleChangeCurrency }
                                 disabled={ this.state.currency !== "BRL" }/>
                            </Col>
                            <Col>
                                <label>Dolar</label>
                                <CurrencyInput decimalSeparator="."
                                 prefix="US$ "
                                 ref="usd"
                                 value={ this.state.currency !== "USD" ? 0 : this.state.price}
                                 onChange={ this.handleChangeCurrency }
                                 disabled={ this.state.currency !== "USD" }/>
                            </Col>
                        </Row>
                        <Row>    
                            <Col>
                                <label>Bitcoin</label>
                                <CurrencyInput decimalSeparator="."
                                 precision="8"
                                 prefix="BTC "
                                 ref="btc"
                                 value={ this.state.currency !== "BTC" ? 0 : this.state.price }
                                 onChange={ this.handleChangeCurrency }
                                 disabled={ this.state.currency !== "BTC"} />
                            </Col>
                            <Col>
                                <label><b>Ether</b></label>
                                <CurrencyInput decimalSeparator="."
                                 precision="8"
                                 prefix="ETH "
                                 value={ this.state.priceInEther }
                                 disabled={ true }/>
                            </Col>
                        </Row>
                         <Button style={{ marginTop: '2%'}} type="submit"> Submit it </Button>
                    </Form>                    
                </div>
                :<div></div>}
            </div>    
        )
    }

}

export default withGun(EditProduct);