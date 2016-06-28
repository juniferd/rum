import React from 'react';
import Lockr from 'lockr';
import globalEventEmitter from './GlobalEvents';
import uuid from 'uuid';
import User from './UserStorage';
import Message from './Message';
var Modal = React.createClass({
  mixins: [User, Message],
  getInitialState: function() {
    // this should be empty to start
    return {
      modalBgClass: 'invisible',
      modalClass: '',
      errorMsg: '',
      emailValid: 'valid icon-ok-circled',
      pwdValid: 'valid icon-ok-circled',
      userId: '',
      userName: '',
      pwd: '',
      tokens: [],
      created: '',
      updated: ''
    };
  },
  getUser: function(userId) {
    var thisUser = Lockr.get(userId);
    this.setState({
      userId: thisUser.userId,
      userName: thisUser.userName,
      pwd: thisUser.pwd,
      tokens: thisUser.tokens,
      created: thisUser.created,
      updated: thisUser.updated
    });
  },
  componentDidMount: function() {
    var self = this;
    globalEventEmitter.on('editUser', function(userId) {
      self.setState({modalBgClass: 'animated fadeIn'});
      self.setState({modalClass: 'animated fadeInRight'});
      self.getUser(userId);
    });
    globalEventEmitter.on('closeEditUser',function(){
      self.setState({modalBgClass: 'animated fadeOut'});
      self.setState({modalClass: 'animated fadeOutRight'});
      self.setState({
        errorMsg: '',
        emailValid: 'valid icon-ok-circled',
        pwdValid: 'valid icon-ok-circled'
      });
    });
    globalEventEmitter.on('finishFadeOut',function(){
      self.setState({modalBgClass: 'invisible'});
    });
    globalEventEmitter.on('updatedUser', function(){
      globalEventEmitter.emit('closeEditUser');
    });
    globalEventEmitter.on('errorMsg', function(err,loc,msg){
      if (loc=='editUser') {
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
    globalEventEmitter.on('emailValidated', function(loc){
      if (loc == 'editUser') {
        self.setState({emailValid : 'valid icon-ok-circled'});
      }
    });
    globalEventEmitter.on('pwdValidated', function(loc){
      if (loc == 'editUser') {
        self.setState({pwdValid : 'valid icon-ok-circled'});
      }
    });
  },
  componentWillUnmount: function() {
    globalEventEmitter.removeAllListeners('editUser');
    globalEventEmitter.removeAllListeners('closeEditUser');
    globalEventEmitter.removeAllListeners('finishFadeOut');
    globalEventEmitter.removeAllListeners('updatedUser');
    globalEventEmitter.removeAllListeners('errorMsg');
    globalEventEmitter.removeAllListeners('emailValidated');
    globalEventEmitter.removeAllListeners('pwdValidated');
  },
  handleFadeOut: function() {
    if (this.state.modalBgClass == 'animated fadeIn') {
      globalEventEmitter.emit('closeEditUser');
    }
  },
  handleInvisible: function() {
    if (this.state.modalBgClass == 'animated fadeOut') {
      globalEventEmitter.emit('finishFadeOut');
    }
  },
  handleChangeUsername: function(e){
    this.setState({userName: e.target.value});
  },
  handleChangePwd: function(e){
    this.setState({pwd: e.target.value});
  },
  handleAddToken: function(e) {
    e.preventDefault();
    var thisUuid = uuid.v1();
    this.setState({tokens: this.state.tokens.concat([thisUuid])});
  },
  handleDeleteToken: function(e,token) {
    e.preventDefault();
    var arrTokens = this.state.tokens;
    var indexThisToken  = arrTokens.indexOf(token);
    arrTokens.splice(indexThisToken,1);
    this.setState({tokens: arrTokens});
  },
  handleSave: function(){
    if (this.state.emailValid == 'valid icon-ok-circled' && this.state.pwdValid == 'valid icon-ok-circled') {
      this.updateInLocalStorage(this.state);
    } else {
      globalEventEmitter.emit('errorMsg','fixErrors','editUser','Fix Errors First');
    }
  },
  checkUsername: function(){
    this.checkValidEmail(this.state.userName,'editUser');
  },
  checkPassword: function(){
    this.checkValidPassword(this.state.pwd,'editUser');
  },
  render: function() {
    var self = this;
    var tokens = this.state.tokens.map(function(token,i){
      return (
        <div className="token" key={i}>
          {token}
          <a className={"del-token"} onClick={(event) => self.handleDeleteToken(event,token)}>
            <span className={"icon-trash-empty"}/>
          </a>
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
        id={"modal-bg"}
        className={this.state.modalBgClass}
        onAnimationEnd={this.handleInvisible}>
        <div id={"modal"}
          className={this.state.modalClass}>
          <div className={"modal-inner"}>
            <h2>
              Edit User
              <span id={"modal-close"}
              className={"icon-cancel-circled2"}
              onClick={this.handleFadeOut}/>
            </h2>
            <div className={showErrorMsg}>
              {this.state.errorMsg}
            </div>
            <div>
              <div className={"float-left align-right"}>{"User ID:"}</div>
              <div className={"float-right align-left"}>{this.state.userId}</div>
            </div>
            <div>
              <div className={"float-left align-right"}>{"Username (email):"}</div>
              <div className={"float-right align-left"}>
                <input id={"modal-username"}
                  value={this.state.userName}
                  onChange={this.handleChangeUsername}
                  onBlur={this.checkUsername}
                  placeholder={"Email"}/>
                <span className={this.state.emailValid}/>
              </div>
            </div>
            <div>
              <div className={"float-left align-right"}>{"User's password:"}</div>
              <div className={"float-right align-left"}>
                <input
                  id={"modal-pwd"}
                  type={"password"}
                  value={this.state.pwd}
                  onChange={this.handleChangePwd}
                  onBlur={this.checkPassword}
                  placeholder={"Create a new password"}/>
                <span className={this.state.pwdValid}/>
              </div>
            </div>
            <div>
              <div className={"float-left align-right"}>Tokens:</div>
              <div className={"float-right align-left"}>
                {tokens}
                <p><a className={"add-token"} onClick={this.handleAddToken}>+ add token</a></p>
              </div>
            </div>
            <div>
              <div className={"float-left align-right"}>{"Created:"}</div>
              <div className={"float-right align-left date"}>{this.state.created}</div>
            </div>
            <div>
              <div className={"float-left align-right"}>{"Updated:"}</div>
              <div className={"float-right align-left date"}>{this.state.updated}</div>
            </div>
            <button id={"modal-save"}
              className={btnClass}
              onClick={this.handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }
});
export default Modal