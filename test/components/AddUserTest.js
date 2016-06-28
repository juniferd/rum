/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/
'use strict';

// Uncomment the following lines to use the react test utilities
import React from 'react';
var ReactTestUtils = require('react-addons-test-utils');
//const TestUtils = addons.TestUtils;
import createComponent from 'helpers/shallowRenderHelper';

import Main from 'components/AddUser';

describe('MainComponent', () => {
  let MainComponent;

  beforeEach(() => {
    MainComponent = createComponent(Main);
  });

  /*it('should have its component name as default className', () => {
    expect(MainComponent.props.className).to.equal('index');
  });*/
});
