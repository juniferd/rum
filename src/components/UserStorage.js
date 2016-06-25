//save, update, delete users
import MyEmitter from './GlobalEvents';
import Lockr from 'lockr';
import moment from 'moment';
import data from '../sources/data';

var User = {
  loadFromLocalStorage: function() {

    var lockrUsers = Lockr.get('users');

    if (lockrUsers) {
      console.log('loadFromLockr',Lockr.get('users'));

      var arrUsers = lockrUsers;
      // retrieve users
    } else {
      // did not find users in local storage so set it up now
      var arrUsers = [];
      for (var i = 0; i < data.length; i++) {
        var userId = data[i]['key'];
        var userName = data[i]['userName'];
        var pwd = data[i]['pwd'];
        var tokens = data[i]['tokens'];
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
    var lastUser = lockrUsers.pop()
    var userId = 'user_' + (parseInt(lastUser.slice(5))+1)
    var objUser = {
      'userId' : userId,
      'userName' : thisState.userName,
      'pwd' : thisState.pwd,
      'tokens' : thisState.tokens,
      'created' : moment().format('DD MMM YYYY hh:mm a'),
      'updated' : moment().format('DD MMM YYYY hh:mm a')
    }
    lockrUsers.push(lastUser);
    lockrUsers.push(userId);
    
    Lockr.set('users',lockrUsers);
    Lockr.set(userId,objUser);

    // trigger some event that updates table
    MyEmitter.emit('addedUser');
    
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
    MyEmitter.emit('updatedUser');
  }
}

export default User