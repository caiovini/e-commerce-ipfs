import {  Card , Button , Col , CardDeck , Form , Dropdown , Row , Carousel } from 'react-bootstrap';
import React , { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { products } from '../../orbitdb/orbit';
import { baseLink , ipfs } from '../../IPFS/ipfs';
import CurrencyInput from 'react-currency-input';
import './index.css';

const { withGun } = require('react-gun');
const currencyApi = require('../../Currency/Api'); //Get exchange rate
const Insert = require('../../orbitdb/insert'); //Insert data from database
const Fetch = require('../../orbitdb/fetch'); //Fetch data from database
const url = 'https://api.coingecko.com/api/v3/simple/price?ids=ETHEREUM&vs_currencies=BRL%2CBTC%2CUSD';

class UserProducts extends Component{


    constructor(){

        super();

        this.state = {
            fields: {},
            errors: {},
            listHashes: 'listHashes',
            buffer:'',
            isLogged: false,
            signature: '',
            category: 'Category',
            currency: 'Currency',
            dataProducts: null,
            price: 0,
            priceInEther: 0,
            exchangeRate: {},
            buffers: []
          };

          this.refMenu = React.createRef() 
          this.handleChange = this.handleChange.bind(this);
          this.insertProduct = this.insertProduct.bind(this);
          this.fetchProducts = this.fetchProducts.bind(this);
          this.handleChangeCurrency = this.handleChangeCurrency.bind(this);
          this.handleDropDownCategory = this.handleDropDownCategory.bind(this);
          this.handleDropDownCurrency = this.handleDropDownCurrency.bind(this);
    }

    async componentWillMount(){

        this.props.gun.get('user').once((data, key) => {

            if(data){
            
                this.setInitialUserData( data.logged , data.signature);
            }                                     
        });
    }

    setInitialUserData(logged , signature){

        this.setState( { isLogged: logged , signature });
    }

    handleChange(e) {

        let fields = this.state.fields;
        fields[e.target.name] = e.target.value;
        this.setState({
          fields
        });
  
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

    async componentDidMount() {

      /* Fetch exchange rates */   

      await currencyApi.getPrice(url).then((result) => {   
            
          const { brl , usd , btc } = result.ethereum;
          this.setState( {exchangeRate: { brl: brl , usd: usd , btc: btc }} );

      }).catch((reason) => {

          alert('error loading currency: ' + reason);
      }) 

      this.fetchProducts();

    }
    
    fetchProducts(){

      /* Fetch products from the ipfs and orbit */ 
        
        let items = [];      
            
            Fetch.commit(this.state.signature , "" ,  products , 'bySignature').then( async (res) => {

            const data = await res.json();
            
            for(let i = 0; i < data.result.length; i ++){
      
                items.push(
                    <Col sm={'auto'} key={data.result[i]._id}>
                        {data.result[i].stock > 0 
                        ?
                        <Card className="card-products">
                            {data.result[i].hash.length === 1
                                ? <Card.Img key={ i } variant="top" src={baseLink + data.result[i].hash[0].hashLink} />
                                : <Carousel interval={null}>
                                    { this.fetchImages(data.result[i].hash) }
                                  </Carousel>}
                            <Card.Body>
                                <Card.Title>{data.result[i].product}</Card.Title>
                                    <Card.Text>
                                        Price: ETH {this.getPriceInEther(data.result[i].currency , data.result[i].price)}
                                    </Card.Text>
                                    <Card.Text>
                                        Category: {data.result[i].category }
                                    </Card.Text>
                                    <Card.Text>
                                        Number in stock: {data.result[i].stock}
                                    </Card.Text>
                                <Link target="_blank" rel="noopener noreferrer" to={`/EditProduct/${data.result[i]._id}`}>
                                  <Button variant="primary" >
                                      <div id={data.result[i]._id}>Edit</div>
                                  </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                        :
                        <Card className="card-products" bg="danger">
                            {data.result[i].hash.length === 1
                                ? <Card.Img key={ i } variant="top" src={baseLink + data.result[i].hash[0].hashLink} />
                                : <Carousel interval={null}>
                                    { this.fetchImages(data.result[i].hash) }
                                  </Carousel>}
                            <Card.Body>
                                <Card.Title>{data.result[i].product}</Card.Title>
                                    <Card.Text>
                                        Price: ETH {this.getPriceInEther(data.result[i].currency , data.result[i].price)}
                                    </Card.Text>
                                    <Card.Text>
                                        Category: {data.result[i].category }
                                    </Card.Text>
                                    <Card.Text>
                                        Stock empty
                                    </Card.Text>
                                <Link target="_blank" rel="noopener noreferrer" to={`/EditProduct/${data.result[i]._id}`}>
                                  <Button variant="primary" >
                                      <div id={data.result[i]._id}>Edit</div>
                                  </Button>
                                </Link>
                            </Card.Body>
                        </Card>}
                    </Col>        
                )} 
                
                this.setState({ dataProducts: items });
            
            }).catch((err) => {

                alert('error: ' + err);
            });             
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

    fetchImages(hashes) {

        let items = [];

        for(let i = 0; i < hashes.length; i ++){

            items.push(<Card.Img key={ i } variant="top" src={baseLink + hashes[i].hashLink} />);

        }

        return items;
    }
     
    captureFile = (event) => {

        event.stopPropagation();
        event.preventDefault();

        this.setState({buffers: []});

        for(let i = 0; i < event.target.files.length; i ++){

            if(i === 6) return; //Maximum 6 pictures

            const file = event.target.files[i]

            if(file !== undefined){

                let reader = new window.FileReader()
                reader.readAsArrayBuffer(file)
                reader.onloadend = () => this.convertToBuffer(reader)    

            }   
        }
    };

    convertToBuffer = async(reader) => {

          //file is converted to a buffer to prepare for uploading to IPFS
          const buffer = await Buffer.from(reader.result);

          //set this buffer -using es6 syntax
          this.setState({ buffers: [...this.state.buffers, buffer] }) //simple value
          //this.setState({ buffer });
    };

    onSubmit = async (event) => {

        event.preventDefault();        

        if(this.validateForm()){
            
            let hashes = [];

            for(let i = 0; i < this.state.buffers.length; i++){

                //save document to IPFS,return its hash#, and save it to dgraph
                await ipfs.add(this.state.buffers[i]).then(ipfsHash => {
    
                    hashes.push({ hashLink: ipfsHash[0].path });

                }).catch((err) => {

                    let errors = {};
                    errors["connection"] = "Connection failed: " + err.message;
                    console.log('error' , err.message);

                    this.setState({
                        errors: errors
                    });                    
                }); //await ipfs.add     
            }this.insertProduct(hashes);
        }
    }; //onSubmit

    insertProduct(hashes){

        // Insert data
        try{
            const hashSoul = this.props.gun.get('product').get(this.state.category).set({query: 'product'});
            const _id = hashSoul._.link;

            const query = 
            { _id: _id ,
              product: this.state.fields.productName ? this.state.fields.productName : '' ,
              currency: this.state.currency ,
              price: this.state.price , 
              description: this.state.fields.productDescription ? this.state.fields.productDescription : '' , 
              category: this.state.category , 
              signature: this.state.signature ,
              stock: this.state.fields.stock ,
              hash: hashes
            }; 

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

        }catch(err){

            let errors = {};
            errors["connection"] = err;
        
            this.setState({errors: errors});
        }

    }
    

    validateForm() {

        let fields = this.state.fields;
        let errors = {};
        let formIsValid = true;
  
        if (!fields["productName"]) {
          formIsValid = false;
          errors["productName"] = "*Please enter your product's name.";
        }

        if (!this.state.buffers[0]) {
            formIsValid = false;
            errors["file"] = "*Submit at least one picture of the product";
        }

        if (this.state.category === 'Category') {
            formIsValid = false;
            errors["dropdownCategory"] = "*Choose a category";
        }

        if (this.state.currency === 'Currency') {
            formIsValid = false;
            errors["dropdownCurrency"] = "*Choose a currency";
        }

        if (!fields["stock"]) {
            formIsValid = false;
            errors["stock"] = "*Number in stock must be filled";
        }

        if (fields["stock"]) {
            if (fields["stock"] === '0') {
                formIsValid = false;
                errors["stock"] = "*Number in stock must be at least one";
            }   
        }

        this.setState({
            errors: errors
          });
        if(!formIsValid) window.scrollTo(0, this.refMenu.current.offsetTop);  
        return formIsValid;
    }     

    handleDropDownCategory(e , category){

        this.setState({ category: category});
    }

    handleDropDownCurrency(e , currency){

        let errors = {};
        this.setState({ currency: currency , price: 0 , errors , priceInEther: 0 })
    }

    render(){
                       

        return(

            <div style={{ marginTop: '2%'}} ref={ this.refMenu }>
                {this.state.isLogged
                ?<Menu className="menu-my-products">
                    <h2>Products' info</h2>  
                 </Menu>
                :<Menu className="menu-my-products">
                    <h2>You must Login</h2>
                 </Menu>}  

                {this.state.isLogged
                ?<div>

                    <Dropdown style={ {marginLeft: "20px"} }>
                        <Dropdown.Toggle id="dropdown-custom-1">{this.state.category}</Dropdown.Toggle>
                        <Dropdown.Menu className="super-colors">
                            <Dropdown.Item onClick = {(e) => this.handleDropDownCategory(e,"Electronics")}>Electronics</Dropdown.Item>
                            <Dropdown.Item onClick = {(e) => this.handleDropDownCategory(e,"Kitchenware")}>Kitchenware</Dropdown.Item>
                            <Dropdown.Item onClick = {(e) => this.handleDropDownCategory(e,"House")}>House</Dropdown.Item>
                            <Dropdown.Item onClick = {(e) => this.handleDropDownCategory(e,"Car")}>Car</Dropdown.Item>
                        </Dropdown.Menu>
                        <div className="errorMsg">{this.state.errors.dropdownCategory}</div>
                    </Dropdown>   

                    <Form onSubmit={this.onSubmit} className="userRegistrationForm" style={{ margin: '2%'}}>
                        <div className="errorMsg">{this.state.errors.connection}</div>
                        <h6>You can select more than one picture, but only the first 6 would be uploaded. Consider selecting up to 6 pics. The pictures can not be edited later</h6>
                        <input type = "file" onChange = {this.captureFile} multiple />
                        <div className="errorMsg">{this.state.errors.file}</div>
                        <h6>When writing the name of the product, try to use terms most commons so the users can easily search.</h6>
                        <input type="text" name="productName" placeholder="Product" onChange={this.handleChange} autoComplete="off"/>
                        <div className="errorMsg">{this.state.errors.productName}</div>
                        <textarea 
                         style={ {marginBottom: "15px" , height: "150px"} }
                         className="form-control"
                         type="text" 
                         name="productDescription"
                         placeholder="Description" 
                         onChange={this.handleChange}
                         autoComplete="off"/>
                         <label>Number of products in stock: </label>
                         <input onChange={ this.handleChange } style={ {width: "100px"} } type="number" name="stock" min="0" max="100000" step="1" ></input>
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
                    

                    <Menu className="menu-my-products">
                        <h2>My products list</h2>  
                    </Menu> 


                    {this.state.dataProducts === null
                     ? <div>Loading</div>
                     : <CardDeck className="row-products"> 
                         { this.state.dataProducts }
                       </CardDeck>
                    }
                                        
                    </div>
                : <div></div>}
            </div>
        );
    }
}

export default withGun(UserProducts);