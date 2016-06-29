/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/
'use strict';

// Uncomment the following lines to use the react test utilities
import React from 'react';
var ReactTestUtils = require('react-addons-test-utils');
import createComponent from 'helpers/shallowRenderHelper';
import _ from 'underscore';
import Lockr from 'lockr';
import MyEmitter from 'components/GlobalEvents';
import AddUser from 'components/AddUser';
import UserList from 'components/UserList';
import {findAllWithType, findAllWithClass, findWithType, findWithRef} from 'react-shallow-testutils';

describe('AddUserComponent', () => {
  let AddUserComponent;

  beforeEach(() => {
    AddUserComponent = createComponent(AddUser);
  });

  it('should render an empty add user panel', () => {
    var errorMsg = findAllWithClass(AddUserComponent,'message');
    expect(errorMsg.length).to.equal(0);

    var inputs = findAllWithType(AddUserComponent,'input');
    for (var i = 0; i < inputs.length; i++) {
      expect(inputs[i]['value']).to.equal(undefined);
    }

    var tokens = findAllWithClass(AddUserComponent,'token');
    expect(tokens.length).to.equal(0);

  });

  it('should add unique tokens when add token clicked', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<AddUser />);

    AddUserComponent = renderer.getRenderOutput();
    var addToken = findWithRef(AddUserComponent,'add-token');

    addToken.props.onClick();
    addToken.props.onClick();

    AddUserComponent = renderer.getRenderOutput();
    var tokens = findAllWithClass(AddUserComponent,'token');
    expect(tokens.length).to.equal(2);
    var uniqTokens = []
    for (var i = 0; i < tokens.length; i++) {
      uniqTokens.push(tokens[i].props.children[0]);
    }
    uniqTokens = _.uniq(uniqTokens);
    expect(uniqTokens.length).to.equal(2);
  });

  it('should delete correct token when token deleted', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<AddUser />);

    AddUserComponent = renderer.getRenderOutput();
    var addToken = findWithRef(AddUserComponent,'add-token');

    addToken.props.onClick();
    addToken.props.onClick();
    addToken.props.onClick();

    AddUserComponent = renderer.getRenderOutput();
    var delToken = findWithRef(AddUserComponent,'del-token-1');
    var thisToken = delToken.key.substr(10);
    var oldTokens = findAllWithClass(AddUserComponent,'token');
    oldTokens = _.pluck(oldTokens,'ref');
    
    delToken.props.onClick({preventDefault: () => {}},thisToken);
    AddUserComponent = renderer.getRenderOutput();

    var newTokens = findAllWithClass(AddUserComponent,'token');
    newTokens = _.pluck(newTokens,'ref');
    
    expect(_.difference(oldTokens,newTokens)[0]).to.equal('token-'+thisToken);
  });

  it('should update email, password inputs when inputs changed', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<AddUser />);

    AddUserComponent = renderer.getRenderOutput();
    var email = findWithRef(AddUserComponent,'add-username');
    var password = findWithRef(AddUserComponent,'add-password');
    var didEmailPass = false;
    var didPasswordPass = false;
    MyEmitter.on('emailValidated', function(loc){
      if (loc == 'addUser') {
        didEmailPass = true;
      }
    });
    MyEmitter.on('pwdValidated', function(loc){
      if (loc == 'addUser') {
        didPasswordPass = true
      }
    });
    email.props.onChange({target: {value: 'davos@onion.com'}});
    email.props.onBlur();
    password.props.onChange({target: {value: 'imanonion4'}});
    password.props.onBlur();
    AddUserComponent = renderer.getRenderOutput();

    expect(findWithRef(AddUserComponent,'add-username').props.value).to.equal('davos@onion.com');
    expect(findWithRef(AddUserComponent,'add-password').props.value).to.equal('imanonion4');

    expect(didEmailPass).to.equal(true);
    expect(didPasswordPass).to.equal(true);
  });

  it('should render error message when invalid email entered', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<AddUser />);

    AddUserComponent = renderer.getRenderOutput();
    var didEmailError = false;
    var email = findWithRef(AddUserComponent,'add-username');
    var testEmail = 'melisandre@light';
    MyEmitter.on('errorMsg', function(err,loc,msg){
      if (loc == 'addUser') {
        if (err == 'emailError') {
          didEmailError = true;
        }
      }
    });
    email.props.onChange({target: {value: testEmail}});
    email.props.onBlur();
    AddUserComponent = renderer.getRenderOutput();
    expect(findWithRef(AddUserComponent,'add-username').props.value).to.equal(testEmail);
    expect(didEmailError).to.equal(true);
  });

  it('should render error message when invalid password entered', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<AddUser />);

    AddUserComponent = renderer.getRenderOutput();
    var didPasswordError = false;
    var email = findWithRef(AddUserComponent,'add-username');
    var password = findWithRef(AddUserComponent,'add-password');

    var testEmail = 'melisandre@lol.net';
    var testPassword = 'nightisdark';

    MyEmitter.on('errorMsg', (err,loc,msg) => {
      if (loc == 'addUser') {
        if (err == 'pwdError') {
          didPasswordError = true;
        }
      }
    });
    email.props.onChange({target: {value: testEmail}});
    email.props.onBlur();
    password.props.onChange({target: {value: testPassword}});
    password.props.onBlur();

    AddUserComponent = renderer.getRenderOutput();
    expect(findWithRef(AddUserComponent,'add-password').props.value).to.equal(testPassword);
    expect(didPasswordError).to.equal(true);
  });

  it('should render error message when no email or password and submit button clicked', () => {
    // this time we won't use shallow rendering to test state and UI
    var AddUserComponent = ReactTestUtils.renderIntoDocument(<AddUser/>);

    var inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(AddUserComponent,'input');
    var email = inputs[0];
    var password = inputs[1];

    ReactTestUtils.Simulate.blur(email);
    expect(AddUserComponent.state.emailValid).to.equal('invalid');
    expect(AddUserComponent.state.pwdValid).to.equal('');

    ReactTestUtils.Simulate.blur(password);
    expect(AddUserComponent.state.emailValid).to.equal('invalid');
    expect(AddUserComponent.state.pwdValid).to.equal('invalid');

    var btnSubmit = ReactTestUtils.scryRenderedDOMComponentsWithTag(AddUserComponent,'button');
    btnSubmit = btnSubmit[0];

    ReactTestUtils.Simulate.click(btnSubmit);
    expect(AddUserComponent.state.errorMsg).to.equal('Fix Errors First');
    AddUserComponent.componentWillUnmount();
  });

  it('should create new user when fields filled out and submit button clicked', () => {
    // this time we won't use shallow rendering to test state and UI
    Lockr.set('users',[]);
    var AddUserComponent = ReactTestUtils.renderIntoDocument(<AddUser/>);

    var testEmail = 'melisandre@lol.net';
    var testPass = '@z0raha1!';

    var inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(AddUserComponent,'input');
    var email = inputs[0];
    var password = inputs[1];
    email.value=testEmail;
    ReactTestUtils.Simulate.change(email);
    ReactTestUtils.Simulate.blur(email);
    
    password.value=testPass;
    ReactTestUtils.Simulate.change(password);
    ReactTestUtils.Simulate.blur(password);
    
    var addToken = ReactTestUtils.scryRenderedDOMComponentsWithTag(AddUserComponent, 'a');
    addToken = addToken[0];

    ReactTestUtils.Simulate.click(addToken);
    ReactTestUtils.Simulate.click(addToken);
    ReactTestUtils.Simulate.click(addToken);

    expect(AddUserComponent.state.userName).to.equal(testEmail);
    expect(AddUserComponent.state.pwd).to.equal(testPass);
    expect(AddUserComponent.state.tokens.length).to.equal(3);
    expect(AddUserComponent.state.errorMsg).to.equal('');
    expect(AddUserComponent.state.emailValid).to.equal('valid');
    expect(AddUserComponent.state.pwdValid).to.equal('valid');

    var btnSubmit = ReactTestUtils.scryRenderedDOMComponentsWithTag(AddUserComponent,'button');
    btnSubmit = btnSubmit[0];

    ReactTestUtils.Simulate.click(btnSubmit);
    expect(AddUserComponent.state.userName).to.equal('');
    expect(AddUserComponent.state.pwd).to.equal('');
    expect(AddUserComponent.state.tokens.length).to.equal(0);
    expect(AddUserComponent.state.errorMsg).to.equal('');
    expect(AddUserComponent.state.emailValid).to.equal('');
    expect(AddUserComponent.state.pwdValid).to.equal('');
    AddUserComponent.componentWillUnmount();
  });
  it('should create new user with unique user id when submit button clicked', () => {
    // this time we won't use shallow rendering to test state and UI
    Lockr.flush();
    var AddUserComponent = ReactTestUtils.renderIntoDocument(<AddUser/>);
    var UserListComponent = ReactTestUtils.renderIntoDocument(<UserList/>);
    UserListComponent.loadFromLockr();

    var testEmail = 'theon@pyke.com';
    var testPass = 'dr0wnedGOD';

    var inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(AddUserComponent,'input');
    var email = inputs[0];
    var password = inputs[1];
    email.value=testEmail;
    ReactTestUtils.Simulate.change(email);
    ReactTestUtils.Simulate.blur(email);
    
    password.value=testPass;
    ReactTestUtils.Simulate.change(password);
    ReactTestUtils.Simulate.blur(password);

    var btnSubmit = ReactTestUtils.scryRenderedDOMComponentsWithTag(AddUserComponent,'button');
    btnSubmit = btnSubmit[0];

    ReactTestUtils.Simulate.click(btnSubmit);

    expect(UserListComponent.state.data.length).to.equal(3);
    expect(UserListComponent.state.data[2]['userId']).to.equal('user_3');

    AddUserComponent.componentWillUnmount();
    UserListComponent.componentWillUnmount();

  })
  it('should collapse and expand panel when control is clicked', () => {
    // this time we won't use shallow rendering to test state and UI
    var AddUserComponent = ReactTestUtils.renderIntoDocument(<AddUser/>);
    var UserListComponent = ReactTestUtils.renderIntoDocument(<UserList/>);

    var control = ReactTestUtils.scryRenderedDOMComponentsWithClass(AddUserComponent,'control');
    control = control[0];

    ReactTestUtils.Simulate.click(control);

    expect(AddUserComponent.state.expandedClass).to.equal('collapsed');
    expect(UserListComponent.state.expandedUserTableClass).to.equal('expanded');
    ReactTestUtils.Simulate.click(control);

    expect(AddUserComponent.state.expandedClass).to.equal('expanded');
    expect(UserListComponent.state.expandedUserTableClass).to.equal('collapsed');

    AddUserComponent.componentWillUnmount();
  });
});
