// error messaging
import MyEmitter from './GlobalEvents';
import validator from 'validator';

var Message = {

  checkValidEmail: function(userName,loc){
    
    var isValid = validator.isEmail(userName);
    if (!isValid) {
      this.createErrorMsg('emailError',loc);
    } else {
      MyEmitter.emit('emailValidated',loc);
    }
  },
  checkValidPassword: function(pwd,loc){
    var isThisAscii = validator.isAscii(pwd);
    var isMinLength = validator.isLength(pwd,{min: 8});
    var hasNum = false;
    for (var i = 0; i < pwd.length; i++) {
      if (!isNaN(parseInt(pwd[i]))) {
        hasNum = true;
        break
      }
    }
    var isValid =  isThisAscii && isMinLength && hasNum;
    
    if (!isValid) {
      this.createErrorMsg('pwdError',loc);
    } else {
      MyEmitter.emit('pwdValidated',loc);
    }
  },
  createErrorMsg: function(err,loc) {

    var msg;
    if (err == 'emailError') {
      msg = 'Please use a valid email';
    } else if (err == 'pwdError') {
      msg = 'Passwords must be 8 characters with at least 1 number';
    }
    MyEmitter.emit('errorMsg', err, loc, msg);
  }
}

export default Message