import React from 'react';
import Lockr from 'lockr';
import moment from 'moment';
import MyEmitter from './GlobalEvents';
import uuid from 'uuid';
import User from './UserStorage';
import Message from './Message';

var AddUserPanel = React.createClass({
  mixins: [User, Message],
  getInitialState: function() {
    return {
      expandedClass: 'expanded',
      iconClass: 'icon-collapse-left',
      errorMsg: '',
      emailValid: '',
      pwdValid: '',
      userName: '',
      pwd: '',
      tokens: []
    };
  },
  handleClickToken: function() {
    var thisUuid = uuid.v1();
    this.setState({tokens: this.state.tokens.concat([thisUuid])});
    
  },
  handleClickUser: function() {

    if (this.state.emailValid == 'valid icon-ok-circled' && this.state.pwdValid == 'valid icon-ok-circled') {
      this.saveNewToLocalStorage(this.state);
    } else {
      MyEmitter.emit('errorMsg','fixErrors','addUser','Fix Errors First')
    }
    
  },
  handleChangeUsername: function(e) {
    this.setState({userName: e.target.value})
  },
  handleChangePwd: function(e) {
    this.setState({pwd: e.target.value})
  },
  handleExpandCollapse: function(){
    if (this.state.expandedClass == 'expanded') {
      this.setState({expandedClass: 'collapsed'});
      this.setState({iconClass: 'icon-expand-right'});
      MyEmitter.emit('addUserPanelCollapse');
      
    } else {
      this.setState({expandedClass: 'expanded'});
      this.setState({iconClass: 'icon-collapse-left'});
      MyEmitter.emit('addUserPanelExpand');

    }
  },
  checkUsername: function(){
    this.checkValidEmail(this.state.userName,'addUser');
  },
  checkPassword: function(){
    this.checkValidPassword(this.state.pwd,'addUser');
  },
  componentDidMount: function() {
    var self = this;
    //once new user is added clear the form
    MyEmitter.on('addedUser', function() {
      self.setState({
        userName: '',
        pwd: '',
        tokens: [],
        errorMsg: '',
        emailValid: '',
        pwdValid: ''
      });
    });

    MyEmitter.on('errorMsg', function(err,loc,msg) {
      if (loc == 'addUser') {
        //display message, focus back on problem input
        var returnObj = {};
        if (err == 'emailError') {
          returnObj = {'emailValid' : 'invalid icon-cancel-circled'};
        } else if (err == 'pwdError') {
          returnObj = {'pwdValid' : 'invalid icon-cancel-circled'};
        } 
        self.setState({errorMsg: msg});
        self.setState(returnObj);
      }
    });
    MyEmitter.on('emailValidated', function(loc){
      if (loc == 'addUser') {
        self.setState({emailValid : 'valid icon-ok-circled'});
      }
    });
    MyEmitter.on('pwdValidated', function(loc){
      if (loc == 'addUser') {
        self.setState({pwdValid : 'valid icon-ok-circled'});
      }
    });
  },
  componentWillUnmount: function() {
    var self = this;
    MyEmitter.removeListener('addedUser');
    MyEmitter.removeListener('errorMsg');
    MyEmitter.removeListener('emailValidated');
    MyEmitter.removeListener('pwdValidated');
  },
  render: function() {
    var tokens = this.state.tokens.map(function(token,i){
      return (
        <div className="token" key={i}>
          {token}
        </div>
      );
    });
    var showErrorMsg = this.state.errorMsg ? 'message warning visible' : 'invisible';
    var btnClass = 'disabled';
    if (this.state.emailValid == 'valid icon-ok-circled' && this.state.pwdValid == 'valid icon-ok-circled') {
      btnClass = '';
    }
    return (
      <div 
        id={"add-users"}
        className={this.state.expandedClass}>
        <div 
          className={"control"}
          onClick={this.handleExpandCollapse}>
          <span className={this.state.iconClass}/>
        </div>
        <div className={"inner-panel"}>
          <h2>Add New User</h2>
          <div className={showErrorMsg}>
            {this.state.errorMsg}
          </div>

          <div className={"clearfix"}>
            <div className={"float-left align-right"}>
              <label>Username (email):</label>
            </div>
            <div className={"float-right align-left"}>
              <input 
                id={"username"}
                value={this.state.userName}
                placeholder={"type user's email"}
                onChange={this.handleChangeUsername}
                onBlur={this.checkUsername}/>
              <span className={this.state.emailValid}/>
            </div>
          </div>

          <div className={"clearfix"}>
            <div className={"float-left align-right"}>
              <label>User&apos;s password:</label>
            </div>
            <div className={"float-right align-left "}>
              <input 
                type={"password"}
                id={"password"}
                value={this.state.pwd}
                placeholder={"at least 8 characters, 1 number"}
                onChange={this.handleChangePwd}
                onBlur={this.checkPassword}/>
              <span className={this.state.pwdValid}/>
            </div>
          </div>

          <div className={"clearfix"}>
            <div className={"float-left align-right"}>Tokens:</div>
            <div className={"float-right align-left "}>
              {tokens}
              <a 
                id={"add-token"}
                onClick={this.handleClickToken}>
                + add tokens (optional)
              </a>
            </div>
          </div>

          <div className={"clearfix"}>
              <button
                id={"create-user"}
                className={btnClass}
                onClick={this.handleClickUser}>
                Create User
              </button>
          </div>
        </div>
      </div>
    );
  }
});

export default AddUserPanel