require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/fontello-embedded.css');
require('styles/animate.css');

import React from 'react';
import _ from 'underscore';
import Lockr from 'lockr';
import moment from 'moment';
import data from '../sources/data';
import AddUserPanel from './AddUser';
import Modal from './ModalUser';
import User from './UserStorage';
import MyEmitter from './GlobalEvents';

var UserList = React.createClass({
  mixins: [User],
  getInitialState: function() {
    return {
      visibleTools: '',
      expandedUserTableClass: 'users',
    };
  },
  loadFromLockr: function() {
    var arrUsers = this.loadFromLocalStorage();

    var arrUserObj = [];
    for (var i = 0; i < arrUsers.length; i++){
      var objUser = Lockr.get(arrUsers[i])
      arrUserObj.push(objUser)
    }
    console.log('loaded all users',arrUserObj);
    this.setState({data : arrUserObj})
  },
  componentWillMount: function() {
    this.loadFromLockr();
  },
  componentDidMount: function() {
    var self = this;
    MyEmitter.on('addedUser', function() {
      self.loadFromLockr();
    });
    MyEmitter.on('updatedUser', function() {
      self.loadFromLockr();
    });
    MyEmitter.on('addUserPanelCollapse', function() {
      console.log('emit addUserPanelCollapse');
      self.setState({expandedUserTableClass: 'users expanded'});
    });
    MyEmitter.on('addUserPanelExpand', function() {
      console.log('emit addUserPanelExpand');
      self.setState({expandedUserTableClass: 'users collapsed'});
    });
  },
  componentWillUnmount: function() {
    var self = this;
    MyEmitter.removeListener('addedUser');
    MyEmitter.removeListener('updatedUser');
    MyEmitter.removeListener('addUserPanelCollapse');
    MyEmitter.removeListener('addUserPanelExpand');
  },
  handleMouseEnter: function(key) {
    this.setState({visibleTools: key});
    
  },
  handleMouseLeave: function(key) {
    this.setState({visibleTools: ''});
    
  },
  handleClickTrash: function(userId,e) {
    
    e.stopPropagation();
    // remove this item from localStorage
    Lockr.rm(userId);
    // remove this userId from user list in localStorage
    var arrUsers = Lockr.get('users');
    var indexUser = arrUsers.indexOf(userId);
    arrUsers.splice(indexUser,1);
    Lockr.set('users',arrUsers);
    this.loadFromLockr();
  },
  handleClickEdit: function(userId,e) {
    e.stopPropagation();
    MyEmitter.emit('editUser',userId);
  },
  render: function(){  
    var self = this;
    var totUsers = Lockr.get('users').length;
    var userNodes = this.state.data.map(function(user){
      var thisClass = user.userId == self.state.visibleTools ? 'visible-tools' : ''; 
      return (
        <li 
          id={user.userId} 
          key={user.userId}
          onMouseEnter={() => self.handleMouseEnter(user.userId)}
          onMouseLeave={() => self.handleMouseLeave(user.userId)}
          onClick={(event) => self.handleClickEdit(user.userId,event)}
          className={thisClass}>
          <div>{user.userName}</div>
          <div className={"tokens"}>{user.tokens.length}</div>
          <div className={"date"}>{user.created}</div>
          <div className={"date"}>{user.updated}</div>
          <div className={"edit-tools"}>
            <div
              onClick={(event) => self.handleClickTrash(user.userId,event)} 
              className={"delete icon-trash-empty"}/>
            <div 
              onClick={(event) => self.handleClickEdit(user.userId,event)}
              className={"edit icon-edit"}/>
          </div>
        </li>
      )
    });
    return (
      <div 
        className={this.state.expandedUserTableClass}>
        <h1>All Users: {totUsers}</h1>
        <ul>
          <li className="header">
            <div>Username</div>
            <div className={"tokens"}>Tokens</div>
            <div className={"date"}>Created</div>
            <div className={"date"}>Edited</div>
          </li>
          {userNodes}
        </ul>
      </div>
    );
    
  }
});

class AppComponent extends React.Component {
  render() {
    return (
      <div>
        <UserList/>
        <AddUserPanel />
        <Modal />
      </div>
    );
  }
}

AppComponent.defaultProps = {

};

export default AppComponent;
