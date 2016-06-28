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
import ModalUser from 'components/ModalUser';
import UserList from 'components/UserList';
import {findAllWithType, findAllWithClass, findWithType, findWithRef} from 'react-shallow-testutils';

describe('EditModalComponent', () => {
  let EditModalComponent;
  let UserListComponent;

  beforeEach(() => {
    Lockr.flush();
    UserListComponent = ReactTestUtils.renderIntoDocument(<UserList/>);
    EditModalComponent = ReactTestUtils.renderIntoDocument(<ModalUser/>);
    UserListComponent.loadFromLockr();
    var lis = ReactTestUtils.scryRenderedDOMComponentsWithTag(UserListComponent,'li');
    ReactTestUtils.Simulate.click(lis[1]);
  });

  it('should update email and password when inputs changed and submit button clicked', () => {
    
    var testEmail = "sansa@winterfell.org";
    var testPass = "d1rewolves4life";

    var inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'input');
    var email = inputs[0];
    var password = inputs[1];
    expect(UserListComponent.state.data[0]['userName']).to.equal('arya@stark.com');
    expect(UserListComponent.state.data[0]['pwd']).to.equal('w1nterfell');
    email.value = testEmail;
    ReactTestUtils.Simulate.change(email);
    ReactTestUtils.Simulate.blur(email);

    password.value = testPass;
    ReactTestUtils.Simulate.change(password);
    ReactTestUtils.Simulate.blur(password);
    
    expect(EditModalComponent.state.emailValid).to.equal('valid icon-ok-circled');
    expect(EditModalComponent.state.pwdValid).to.equal('valid icon-ok-circled');

    var btnSubmit = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'button');
    btnSubmit = btnSubmit[0];
    ReactTestUtils.Simulate.click(btnSubmit);

    expect(UserListComponent.state.data[0]['userName']).to.equal(testEmail);
    expect(UserListComponent.state.data[0]['pwd']).to.equal(testPass);
    expect(EditModalComponent.state.modalBgClass).to.equal('animated fadeOut');

    var bgModal = ReactTestUtils.scryRenderedDOMComponentsWithClass(EditModalComponent,'fadeOut');
    bgModal = bgModal[0];
    ReactTestUtils.Simulate.animationEnd(bgModal);

    expect(EditModalComponent.state.modalBgClass).to.equal('invisible');
    EditModalComponent.componentWillUnmount();
    UserListComponent.componentWillUnmount();
  });

  it('should render error message when invalid email entered', () => {
    var testEmail = "noone";

    var inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'input');
    var email = inputs[0];

    email.value = testEmail;
    ReactTestUtils.Simulate.change(email);
    ReactTestUtils.Simulate.blur(email);

    expect(EditModalComponent.state.emailValid).to.equal('invalid icon-cancel-circled');
    expect(EditModalComponent.state.pwdValid).to.equal('valid icon-ok-circled');

    var btnSubmit = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'button');
    btnSubmit = btnSubmit[0];
    ReactTestUtils.Simulate.click(btnSubmit);

    expect(EditModalComponent.state.errorMsg).to.equal('Fix Errors First');
    EditModalComponent.componentWillUnmount();
    UserListComponent.componentWillUnmount();
  });

  it('should render error message when invalid password entered', () => {
    var testPass = "snow";
    
    var inputs = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'input');
    var password = inputs[1];

    password.value = testPass;
    ReactTestUtils.Simulate.change(password);
    ReactTestUtils.Simulate.blur(password);

    expect(EditModalComponent.state.emailValid).to.equal('valid icon-ok-circled');
    expect(EditModalComponent.state.pwdValid).to.equal('invalid icon-cancel-circled');

    var btnSubmit = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'button');
    btnSubmit = btnSubmit[0];
    ReactTestUtils.Simulate.click(btnSubmit);

    expect(EditModalComponent.state.errorMsg).to.equal('Fix Errors First');
    EditModalComponent.componentWillUnmount();
    UserListComponent.componentWillUnmount();
  });

  it('should add tokens when add token link clicked', () => {
    var addToken = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'a');
    addToken = addToken[0];

    ReactTestUtils.Simulate.click(addToken);
    ReactTestUtils.Simulate.click(addToken);
    ReactTestUtils.Simulate.click(addToken);

    expect(EditModalComponent.state.tokens.length).to.equal(3);

    var btnSubmit = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'button');
    btnSubmit = btnSubmit[0];
    ReactTestUtils.Simulate.click(btnSubmit);

    expect(UserListComponent.state.data[0]['tokens'].length).to.equal(3);
    EditModalComponent.componentWillUnmount();
    UserListComponent.componentWillUnmount();
  });

  it('should delete tokens when delete token clicked', () => {
    var addToken = ReactTestUtils.scryRenderedDOMComponentsWithTag(EditModalComponent,'a');
    var origTokens;
    var newTokens;
    addToken = addToken[0];

    ReactTestUtils.Simulate.click(addToken);
    ReactTestUtils.Simulate.click(addToken);
    ReactTestUtils.Simulate.click(addToken);

    origTokens = EditModalComponent.state.tokens;
    origTokens = origTokens.slice();
    
    var delTokens = ReactTestUtils.scryRenderedDOMComponentsWithClass(EditModalComponent,'del-token');
    var thisToken = origTokens[1];
    
    ReactTestUtils.Simulate.click(delTokens[1]);

    newTokens = EditModalComponent.state.tokens;
    var diff = _.difference(origTokens,newTokens);

    expect(diff.length).to.equal(1);
    expect(diff[0]).to.equal(thisToken);

    EditModalComponent.componentWillUnmount();
    UserListComponent.componentWillUnmount();
  });
  it('should close edit modal when close button clicked', () => {
    var btnClose = ReactTestUtils.scryRenderedDOMComponentsWithClass(EditModalComponent,'icon-cancel-circled2');
    ReactTestUtils.Simulate.click(btnClose[0]);

    expect(EditModalComponent.state.modalBgClass).to.equal('animated fadeOut');

    EditModalComponent.componentWillUnmount();
    UserListComponent.componentWillUnmount();
  });
});
