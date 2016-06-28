import React from 'react';
import Lockr from 'lockr';
import User from './UserStorage';
import Message from './Message';
import globalEventEmitter from './GlobalEvents';
var UserList = React.createClass({
  mixins: [User, Message],
  getInitialState: function() {
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
      globalEventEmitter.emit('errorMsg','noUsers','main','You have no users! Try adding some');
    }
  },
  componentWillMount: function() {
    this.loadFromLockr();
  },
  componentDidMount: function() {
    var self = this;
    globalEventEmitter.on('addedUser', function() {
      self.loadFromLockr();
      self.setState({errorMsg: ''});
    });
    globalEventEmitter.on('updatedUser', function() {
      self.loadFromLockr();
    });
    globalEventEmitter.on('addUserPanelCollapse', function() {
      self.setState({expandedUserTableClass: 'users expanded'});
    });
    globalEventEmitter.on('addUserPanelExpand', function() {
      self.setState({expandedUserTableClass: 'users collapsed'});
    });
    globalEventEmitter.on('errorMsg', function(err,loc,msg){
      if (loc=='main') {
        self.setState({errorMsg: msg});
      }
    });
  },
  componentWillUnmount: function() {
    globalEventEmitter.removeAllListeners('addedUser');
    globalEventEmitter.removeAllListeners('updatedUser');
    globalEventEmitter.removeAllListeners('addUserPanelCollapse');
    globalEventEmitter.removeAllListeners('addUserPanelExpand');
    globalEventEmitter.removeAllListeners('errorMsg');
  },
  handleMouseEnter: function(key) {
    this.setState({visibleTools: key});
  },
  handleMouseLeave: function() {
    this.setState({visibleTools: ''});
  },
  handleClickTrash: function(e,userId) {
    
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
  handleClickEdit: function(e,userId) {
    
    e.stopPropagation();
    
    globalEventEmitter.emit('editUser',userId);
  },
  render: function(){
    var self = this;
    var totUsers = Lockr.get('users').length;
    var showErrorMsg = this.state.errorMsg ? 'message warning visible' : 'invisible';
    var userNodes;
    if (this.state.data) {
      userNodes = this.state.data.map(function(user){
        var thisClass = user.userId == self.state.visibleTools ? 'visible-tools' : '';
        return (
          <li
            id={user.userId}
            key={user.userId}
            onMouseEnter={() => self.handleMouseEnter(user.userId)}
            onMouseLeave={() => self.handleMouseLeave()}
            onClick={(event) => self.handleClickEdit(event,user.userId)}
            className={thisClass}>
            <div className={"user item"}>{user.userName}</div>
            <div className={"tokens item"}>{user.tokens.length}</div>
            <div className={"date item"}>{user.created}</div>
            <div className={"date item"}>{user.updated}</div>
            <div className={"edit-tools"}>
              <div
                onClick={(event) => self.handleClickTrash(event,user.userId)}
                className={"delete icon-trash-empty"}
                ref={'empty-'+user.userId}/>
              <div
                onClick={(event) => self.handleClickEdit(event,user.userId)}
                className={"edit icon-edit"}
                ref={'edit-'+user.userId}/>
            </div>
          </li>
        )
      });
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