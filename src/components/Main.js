require('normalize.css/normalize.css');
require('styles/App.css');
require('styles/fontello-embedded.css');
require('styles/animate.css');
import React from 'react';
import AddUserPanel from './AddUser';
import Modal from './ModalUser';
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
  mainClass: 'index'
};
export default App;