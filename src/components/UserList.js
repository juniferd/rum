import React from 'react';
import Lockr from 'lockr';
import User from './UserStorage';
import Message from './Message';
import MyEmitter from './GlobalEvents';
var UserList = React.createClass({
  mixins: [User, Message],
  getInitialState: function() {
    console.log('getInitialState');
    return {
      visibleTools: '',
      expandedUserTableClass: 'users'
    };
  },
  loadFromLockr: function() {
    var arrUsers = this.loadFromLocalStorage();
    if (arrUsers.length > 0) {
      var arrUserObj = [];
      for (var i = 0; i < arrUsers.length; i++){
        var objUser = Lockr.get(arrUsers[i])
        arrUserObj.push(objUser)
      }
      this.setState({data : arrUserObj});
    } else {
      // if there are no users
      this.setState({data : []});
      MyEmitter.emit('errorMsg','noUsers','main','You have no users! Try adding some');
    }
  },
  componentWillMount: function() {
    this.loadFromLockr();
  },
  componentDidMount: function() {
    var self = this;
    MyEmitter.on('addedUser', function() {
      self.loadFromLockr();
      self.setState({errorMsg: ''});
    });
    MyEmitter.on('updatedUser', function() {
      self.loadFromLockr();
    });
    MyEmitter.on('addUserPanelCollapse', function() {
      self.setState({expandedUserTableClass: 'users expanded'});
    });
    MyEmitter.on('addUserPanelExpand', function() {
      self.setState({expandedUserTableClass: 'users collapsed'});
    });
    MyEmitter.on('errorMsg', function(err,loc,msg){
      if (loc=='main') {
        self.setState({errorMsg: msg});
      }
    });
  },
  componentWillUnmount: function() {
    MyEmitter.removeListener('addedUser');
    MyEmitter.removeListener('updatedUser');
    MyEmitter.removeListener('addUserPanelCollapse');
    MyEmitter.removeListener('addUserPanelExpand');
    MyEmitter.removeListener('errorMsg');
  },
  handleMouseEnter: function(key) {
    this.setState({visibleTools: key});
  },
  handleMouseLeave: function() {
    this.setState({visibleTools: ''});
  },
  handleClickTrash: function(userId,e) {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
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
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    MyEmitter.emit('editUser',userId);
  },
  render: function(){
    var self = this;
    var totUsers = Lockr.get('users').length;
    var showErrorMsg = this.state.errorMsg ? 'message warning visible' : 'invisible';
    if (this.state.data) {
      var userNodes = this.state.data.map(function(user){
        var thisClass = user.userId == self.state.visibleTools ? 'visible-tools' : '';
        return (
          <li
            id={user.userId}
            key={user.userId}
            onMouseEnter={() => self.handleMouseEnter(user.userId)}
            onMouseLeave={() => self.handleMouseLeave()}
            onClick={(event) => self.handleClickEdit(user.userId,event)}
            className={thisClass}>
            <div className={"user item"}>{user.userName}</div>
            <div className={"tokens item"}>{user.tokens.length}</div>
            <div className={"date item"}>{user.created}</div>
            <div className={"date item"}>{user.updated}</div>
            <div className={"edit-tools"}>
              <div
                onClick={(event) => self.handleClickTrash(user.userId,event)}
                className={"delete icon-trash-empty"}
                ref={'empty-'+user.userId}/>
              <div
                onClick={(event) => self.handleClickEdit(user.userId,event)}
                className={"edit icon-edit"}
                ref={'edit-'+user.userId}/>
            </div>
          </li>
        )
      });
    } else {
      var userNodes = function(){return;}
    }
    return (
      <div
        className={this.state.expandedUserTableClass}>
        <h1>All Users: {totUsers}</h1>
        <div className={showErrorMsg}>
          {this.state.errorMsg}
        </div>
        <ul>
          <li className="header">
            <div className={"user"}>Username</div>
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
export default UserList;