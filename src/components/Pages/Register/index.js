import React from 'react';
import { Menu  , Button} from 'semantic-ui-react';
import { Row , Col , Card , Form , FormControl } from 'react-bootstrap';
import web3 from '../../../ethereum/web3';
import agora from '../../../ethereum/agora';
import { MdFiberManualRecord } from 'react-icons/md';
import md5 from 'md5';
import './index.css';

const { withGun } = require('react-gun');
var RSA = require('hybrid-crypto-js').RSA;

class RegisterForm extends React.Component {

    constructor() {
      super();
      this.state = {

        fields: {},
        errors: {},
        loading: false,
        errorMsg: '',
        isLogged: false
      }

      this.handleChange = this.handleChange.bind(this);
      this.submituserRegistrationForm = this.submituserRegistrationForm.bind(this);

    };

    handleChange(e) {

      let fields = this.state.fields;
      fields[e.target.name] = e.target.value.trim();
      this.setState({
        fields
      });

    }

    async componentWillMount(){

      this.props.gun.get('user').once((data, key) => {
          
          this.setInitialUserData( data.logged );
      });
    }

    setInitialUserData(logged){

      this.setState( { isLogged: logged });
    }

    async submituserRegistrationForm(e) {

      e.preventDefault();
      if (this.validateForm()) {

          let fields = this.state.fields;
          this.setState({loading: true , errorMsg: 'Wait for confirmation...'});

          const result = await agora.methods.checkIfUserExists( md5(fields["signature"] )).call();

          try{
            if(!result){

              const rsa = new RSA();
                       
                rsa.generateKeypair( async (keypair) => { //generate public and private keys

                 const accounts = await web3.eth.getAccounts();
                 await agora.methods.registerNewUser( md5(fields["signature"].trim()),
                                                          fields["username"].trim()  ,
                                                      md5(fields["password"].trim()) ,
                                                          keypair.publicKey          , 
                                                          keypair.privateKey)     
                                                     .send({ from: accounts[0] })
                                                     .then((result) => {
 
                      fields["username"] = ""; 
                      fields["signature"] = "";
                      fields["password"] = "";
                      this.setState({ fields: fields , loading: false , errorMsg: ''} );
                      alert("Form submitted");
                      this.props.history.push('/');

                    }).catch(err => {

                      this.setState({ loading: false , errorMsg: err.toString() });
                    });
                }); 

          }else{

              this.setState({loading: false , errorMsg: 'Signature already exists' });    
          }
        }catch(err){

          this.setState({loading: false , errorMsg: err.toString() });    
        }
      }
    }


    validateForm() {

      let fields = this.state.fields;
      let errors = {};
      let formIsValid = true;

      if (!fields["username"]) {
        formIsValid = false;
        errors["username"] = "*Please enter your username.";
      }

      if (typeof fields["username"] !== "undefined") {
        if (!fields["username"].match(/^[a-zA-Z ]*$/)) {
          formIsValid = false;
          errors["username"] = "*Please enter alphabet characters only.";
        }
      }

      if (!fields["signature"]) {
            formIsValid = false;
            errors["signature"] = "*Please enter your signature.";
      }

      if (fields["signature"] && fields["username"]) {
        if(fields["signature"] === fields["username"]){
            formIsValid = false;
            errors["signature"] = "*Signature must be different from user name.";
        }
      }

      if (typeof fields["signature"] !== "undefined") {
        if (fields["signature"].match(';')) {
          formIsValid = false;
          errors["signature"] = "*Character ';' for signature is invalid";
        }
      }

      if (!fields["password"]) {
            formIsValid = false;
            errors["password"] = "*Please enter your password.";
      }

      if (typeof fields["password"] !== "undefined") {
        if (!fields["password"].match(/^.*(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%&]).*$/)) {
            formIsValid = false;
            errors["password"] = "*Please enter secure and strong password.";
        }
      }

      if (typeof fields["password"] !== "undefined") {
        if (fields["password"].match(';')) {
            formIsValid = false;
            errors["password"] = "*Character ';' for password is invalid.";
        }
      }

      this.setState({
        errors: errors
      });
      return formIsValid;

    }

  render() {

    return (
    
    <div id="main-registration-container">

    <Menu className="menu-desc">
       <h2>Create user on the network</h2>
    </Menu>

    {!this.state.isLogged  
     ?<Row className="row-cards">
      <Col sm={'auto'}>

        <div id="register">
            <Form className="userRegistrationForm" onSubmit= {this.submituserRegistrationForm} >
              <label>Name</label>
              <FormControl type="text" name="username" placeholder="User name" onChange={this.handleChange} autoComplete=""/>
              <div className="errorMsg">{this.state.errors.username}</div>
              <label>Signature</label>
              <FormControl type="text" name="signature" placeholder="Signature" onChange={this.handleChange} autoComplete=""  />
              <div className="errorMsg">{this.state.errors.signature}</div>
              <label>Password</label>
              <FormControl type="password" name="password" placeholder="Password" onChange={this.handleChange} autoComplete="" />
              <div className="errorMsg">{this.state.errors.password}</div>
              <Button type="submit" color="blue" className="button" value="Register" loading={ this.state.loading }>Register</Button>
              <div className="errorMsg">{this.state.errorMsg}</div>
            </Form>
        </div>

      </Col>

      <Col sm={'auto'}>

        <Card className="card-descript">
          <div className="descript">
              <h4><MdFiberManualRecord/>  We will take minimal information</h4>
              <h4><MdFiberManualRecord/>  The field signature is used by<br/> the seller and the buyer to send funds<br/> as soon as the merch is taken</h4>
              <h4><MdFiberManualRecord/>  Signature must be unique</h4>
              <h4><MdFiberManualRecord/>  Try using a strong password</h4>
          </div>
        </Card>

      </Col>
      </Row>
       :this.props.history.push('/')} 
    </div>

      );
  }
}

export default withGun(RegisterForm);