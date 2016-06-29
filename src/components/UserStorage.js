//save, update, delete users
import globalEventEmitter from './GlobalEvents';
import Lockr from 'lockr';
import moment from 'moment';
import defaultData from '../sources/DefaultData';
var UserMixin = {
  loadFromLocalStorage: function() {
    var lockrUsers = Lockr.get('users');
    if (lockrUsers) {
      var arrUsers = lockrUsers;
      // retrieve users
    } else {
      // did not find users in local storage so set it up now
      var arrUsers = [];
      for (var i = 0; i < defaultData.length; i++) {
        var userId = defaultData[i]['key'];
        var userName = defaultData[i]['userName'];
        var pwd = defaultData[i]['pwd'];
        var tokens = defaultData[i]['tokens'];
        var created = moment().format('DD MMM YYYY hh:mm a');
        var updated = moment().format('DD MMM YYYY hh:mm a');
        var objUser = {
          'userId' : userId,
          'userName' : userName,
          'pwd' : pwd,
          'tokens' : tokens,
          'created' : created,
          'updated' : updated
        }
        Lockr.set(userId,objUser);
        arrUsers.push(userId);
      }
      Lockr.set('users',arrUsers);
    }
    return arrUsers;
  },
  saveNewToLocalStorage: function(thisState){
    var lockrUsers = Lockr.get('users');
    if (lockrUsers.length > 0){
      var lastUser = lockrUsers.pop();
      var userId = 'user_' + (parseInt(lastUser.slice(5))+1);
      lockrUsers.push(lastUser);
    } else {
      var userId = 'user_1';
    }
    var objUser = {
      'userId' : userId,
      'userName' : thisState.userName,
      'pwd' : thisState.pwd,
      'tokens' : thisState.tokens,
      'created' : moment().format('DD MMM YYYY hh:mm a'),
      'updated' : moment().format('DD MMM YYYY hh:mm a')
    }
    lockrUsers.push(userId);
    Lockr.set('users',lockrUsers);
    Lockr.set(userId,objUser);
    // trigger some event that updates table
    globalEventEmitter.emit('addedUser');
  },
  updateInLocalStorage: function(thisState){
    var objUser = {
      'userId' : thisState.userId,
      'userName' : thisState.userName,
      'pwd' : thisState.pwd,
      'tokens' : thisState.tokens,
      'created' : thisState.created,
      'updated' : moment().format('DD MMM YYYY hh:mm a')
    }
    Lockr.set(thisState.userId,objUser);
    //trigger some event that updates table
    globalEventEmitter.emit('updatedUser');
  }
}
export default UserMixin