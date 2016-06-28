/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/
'use strict';

// Uncomment the following lines to use the react test utilities
import React from 'react';
var ReactTestUtils = require('react-addons-test-utils');
//const TestUtils = addons.TestUtils;
import createComponent from 'helpers/shallowRenderHelper';

import App from 'components/Main';
import UserList from 'components/UserList';
import AddUserPanel from 'components/AddUser';
import Modal from 'components/ModalUser';

describe('MainComponent', () => {
  let MainComponent;

  beforeEach(() => {
    MainComponent = createComponent(App);
  });

  it('should have children UserList, AddUserPanel, Modal', () => {
    
    expect(MainComponent.props.children[0].type).to.equal(UserList)
    expect(MainComponent.props.children[1].type).to.equal(AddUserPanel)
    expect(MainComponent.props.children[2].type).to.equal(Modal)

  });
});

