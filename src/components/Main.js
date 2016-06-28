require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/fontello-embedded.css');
require('styles/animate.css');
import React from 'react';
import Lockr from 'lockr';
import AddUserPanel from './AddUser';
import Modal from './ModalUser';
import User from './UserStorage';
import Message from './Message';
import MyEmitter from './GlobalEvents';
import UserList from './UserList';
class App extends React.Component {
  render() {
    return (
      <div className={this.props.mainClass}>
        <UserList/>
        <AddUserPanel />
        <Modal />
      </div>
    );
  }
}
App.defaultProps = {
  mainClass: "index"
};
export default App;