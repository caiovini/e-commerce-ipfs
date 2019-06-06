import { Rating } from 'semantic-ui-react'
import React, { Component } from 'react';
import { comments } from '../../../orbitdb/orbit';

const Insert = require('../../../orbitdb/insert');
const Gun = require('gun/gun');

class CommentForm extends Component {

  constructor(props) {

    super(props);
    this.state = {
      loading: false,
      error: '',
      comment: {
        idComment: '',
        name: '',
        message: '',
        dateComment: '',
        rating: 0 
      }
    };

    // bind context to methods
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onStarClick(event , data) {

    event.preventDefault();
         this.setState({

          ...this.state,
          comment: {
    
            ...this.state.comment,
            rating: data.rating
          }
        });
        
  }

  componentWillMount(){

    this.setState({...this.state,
      comment: { name: this.props.userName , rating: 1 }});
  }

  /**
   * Handle form input field changes & update the state
   */
  handleFieldChange = event => {
    const { value, name } = event.target;

    this.setState({

      ...this.state,
      comment: {

        ...this.state.comment,
        [name]: value
      }
    });
  };

  /**
   * Form submit handler
   */
  async onSubmit(e) {

    const gun = new Gun();

    // prevent default form submission
    e.preventDefault();

    if (!this.isFormValid()) {

      this.setState({ error: "All fields are required." });
      return;
    }

    // loading status and clear error
    this.setState({ error: "", loading: true });

    // create id for the comment
    const hashSoul = gun.get('comment').get(this.props.category).set({query: 'comment'});
    const _id = hashSoul._.get; // get id
  
    // persist the comments on server
    let { comment } = this.state;

    const query = {
      _id: _id,
      idProduct: this.props.idProduct,
      name: comment.name,
      message: comment.message,
      dateComment: new Date(),
      signature: this.props.idProduct, // Use id of the product as signature 
      rating: comment.rating
    }

    /*
      There is no way to implement a bot protection using ipfs and orbit at the moment.
      To avoid bot attacks, there should be a small fee payed by the user in order to add new
      comments.

      web3: store idProduct and rating to creact seller average reputation
    */

    Insert.commit(query , comments).then((res)=>{

        if(res.ok){

          this.setState({

            ...this.state,
                comment: {
          
                ...this.state.comment,
                    message: '',
                    rating: 1
                }
            });

            this.props.reloadComments();

        }else{

            alert('Error inserting new address');
        }   
        
      }).catch((err) => {

      this.setState({
          error: err,
          loading: false
       });
    })
  }

  /**
   * Simple validation
   */
  isFormValid() {

    return this.state.comment.name !== "" && this.state.comment.message !== "";
  }

  renderError() {

    return this.state.error ? (
      <div className="alert alert-danger">{this.state.error}</div>
    ) : null;
  }

  render() {

    return (
      <React.Fragment>
        <div style={{fontSize: 18  , display: 'inline'}}>
            <h2>Rating : </h2>
              {this.props.logged
              ?<Rating rating={this.state.comment.rating} maxRating={5} icon='star' onRate={this.onStarClick.bind(this)} />
              :<Rating defaultRating={1} maxRating={5} icon='star' disabled />}
        </div>
        <form method="post" onSubmit={this.onSubmit}>
          <div className="form-group">
            <input
              disabled = "disabled"
              value={this.state.comment.name}
              className="form-control"
              placeholder="😎 Your Name"
              name="name"
              type="text"
            />
          </div>

          <div className="form-group">
            <textarea
              disabled = {(this.props.logged)? "" : "disabled"}
              onChange={this.handleFieldChange}
              value={this.state.comment.message}
              className="form-control"
              placeholder="🤬 Your Comment"
              name="message"
              rows="5"
            />
          </div>

          {this.renderError()}

          <div className="form-group">
            <button disabled={!this.props.logged} className="btn btn-primary">
              Comment &#10148;
            </button>
          </div>
        </form>
      </React.Fragment>
    );
  }
}

export default CommentForm;