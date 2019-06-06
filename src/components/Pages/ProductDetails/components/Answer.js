import { MdKeyboardArrowUp ,  MdKeyboardArrowDown } from 'react-icons/md';
import { Collapse , Card } from 'react-bootstrap';
import { answers } from '../../../orbitdb/orbit';
import React , { Component } from 'react';
import './css/answer.css'

const { withGun } = require('react-gun');
const Insert = require('../../../orbitdb/insert');
const Fetch = require('../../../orbitdb/fetch'); //Fetch data from database

class Answer extends Component{

    constructor(){

        super();
        this.state = {
            collapseAnswer: false ,
            isLogged: false ,
            answer: '',
            userName: '' ,
            signature: '',
            idComment: '',
            error: '',
            answers: null
        }

        this.fetchAnswers = this.fetchAnswers.bind(this);
    }

    handleFieldChange(e){

        e.preventDefault();
        this.setState({ answer: e.target.value });
    }

    componentWillMount(){

        this.props.gun.get('user').once((data, key) => {
            
            this.setInitialUserData( data.logged , data.userName , data.signature );
        });
    }

    setInitialUserData(logged , userName , signature){

        if(logged){ //Check if user is logged

            this.setState( {isLogged: logged , userName: userName , signature , idComment: this.props.idComment , category: this.props.category});
        }else{
            this.setState( { idComment: this.props.idComment , category: this.props.category} );
        }
    }

    onSubmit(e){

        e.preventDefault();

        if (!this.state.answer) {

            this.setState({ error: "Field answer is required." });
            return;
          }
      
        // Clear error
        this.setState({ error: "" });

        const hashSoul = this.props.gun.get('answer').get(this.state.category).set({query: 'answer'});
        const _id = hashSoul._.link;

        const query = {
            _id: _id,
            signature: this.state.idComment,
            name: this.state.userName,
            answer: this.state.answer,
            dateAnswer: new Date()
        }
        
        Insert.commit(query , answers).then((res)=>{

            if(res.ok){

                this.setState({
                    answer: '',
                    answers: [<Card  style={ {padding: '2%'} } key={ _id }>
                                <div className="media-body p-2 shadow-sm rounded bg-light border">
                                <small className="float-right text-muted"> Now </small>
                                <h6 className="mt-0 mb-1 text-muted"> <b>{ query.name } says:</b> </h6>
                                    <p>
                                        <textarea
                                            disabled = {"disabled"}
                                            value={ query.answer }
                                            className="form-control"
                                            name="message"
                                            rows="4"
                                        />
                                    </p>
                                </div>   
                            </Card>  , ...this.state.answers]
                });

            }else{
      
                alert('Error inserting new address');
            } 

           }).catch((err)=>{
      
            this.setState({
                error: err
           });
        })
    }

    renderError() {

        return this.state.error ? (
          <div className="alert alert-danger">{this.state.error}</div>
        ) : null;
    }

    fetchAnswers(){

        let items = [];
        const idComment = this.state.idComment;

        Fetch.commit(idComment , "" ,  answers , 'bySignature').then( async (res) => {

            const data = await res.json();
            data.result.sort(this.compare);
      
            for (let i = 0; i < data.result.length; i++) {
                
                items.push(
                    <Card  style={ {padding: '2%'} } key={ data.result[i]._id }>
                        <div className="media-body p-2 shadow-sm rounded bg-light border">
                        <small className="float-right text-muted"> { data.result[i].dateAnswer } </small>
                        <h6 className="mt-0 mb-1 text-muted"> <b>{ data.result[i].name } says:</b> </h6>
                            <p>
                                <textarea
                                    disabled = {"disabled"}
                                    value={ data.result[i].answer }
                                    className="form-control"
                                    name="message"
                                    rows="4"
                                />
                            </p>
                        </div>   
                    </Card> 
                )
            }
            
            this.setState( { answers: items , collapseAnswer: !this.state.collapseAnswer } );

        }).catch((reason) => {

            alert('error loading answers: ' + reason);
        })
    }

    compare(a, b) { // Sort array br comparing date

        if (a.dateAnswer < b.dateAnswer) 
            return -1; 
        if (a.dateAnswer > b.dateAnswer) 
            return 1; 
        return 0; 
    } 


    render(){

        return(
            <div>
                <div>
                    <a href="#home" onClick={this.fetchAnswers}>
                        <u> Answers  </u>
                        {this.state.collapseAnswer ? <MdKeyboardArrowUp/> : <MdKeyboardArrowDown/>}  
                    </a>
                </div>    

                <Collapse in={this.state.collapseAnswer}>
                    <div>
                        { this.state.collapseAnswer && this.state.answers !== null
                         ? this.state.answers
                         : <div></div>
                        }

                        {this.state.isLogged && this.state.collapseAnswer?
                        <form onSubmit={this.onSubmit}>
                            <div style={ { marginTop: "2%" } } className="form-group">
                                <textarea
                                  onChange = { this.handleFieldChange.bind(this) }
                                  value = { this.state.answer }
                                  className="form-control"
                                  placeholder="🤬 Your Answer"
                                  name="message"
                                  rows="5"
                                />
                            </div>

                            <div className="form-group">
                                <button onClick={ this.onSubmit.bind(this) } className="btn btn-primary">
                                    Answer &#10148;
                                </button>
                            </div>
                        </form>
                        :<div></div>}
                        { this.renderError() }
                    </div>
                </Collapse>
            </div>
        )
    }
}

export default withGun(Answer);