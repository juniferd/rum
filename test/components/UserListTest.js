/*eslint-env node, mocha */
/*global expect */
/*eslint no-console: 0*/
'use strict';

// Uncomment the following lines to use the react test utilities
import React from 'react';
var ReactTestUtils = require('react-addons-test-utils');

import createComponent from 'helpers/shallowRenderHelper';
import Lockr from 'lockr';
import MyEmitter from 'components/GlobalEvents';
import ValidationMixin from 'components/ValidationHandling';
import UserList from 'components/UserList';
import {findAllWithType, findAllWithClass, findWithType, findWithRef} from 'react-shallow-testutils';

describe('UserListComponent', () => {
  let UserListComponent;

  beforeEach(() => {
    Lockr.flush();
    UserListComponent = createComponent(UserList);
  });
  it('should have default states', () => {
    var list = findAllWithClass(UserListComponent,'users');
    expect(list.length).to.equal(1);

    var visibleTools = findAllWithClass(UserListComponent,'visible-tools');
    expect(visibleTools.length).to.equal(0);    
  });

  it('should render default view if nothing is stored in local storage', () => {
    //error message should be empty
    var msg = findAllWithClass(UserListComponent,'invisible');
    expect(msg[0].props.children).to.equal(undefined);

    //h1 should say "All Users: 2"
    var h1 = findWithType(UserListComponent,'h1');
    expect(h1.props.children[0]).to.equal('All Users: ');
    expect(h1.props.children[1]).to.equal(2);

    //all li items
    var lis = findAllWithType(UserListComponent,'li');
    var userNames = ['arya@stark.com', 'tyrion@lannister.com'];
    for (var i = 0; i < lis.length; i++) {
      if (i > 0) {
        expect(lis[i]['key']).to.equal('user_'+i);
        expect(lis[i].props.children[0].props.children).to.equal(userNames[i-1]);
      }
    }
    
  });

  it('should render user list stored in local storage', () => {
    Lockr.flush();
    var userIds = {
      'users' : ['user_1','user_3'],
      'user_1' : {
        'userName' : 'test1@test.com',
        'pwd' : 'asdf12345',
        'tokens' : ['1','2','3'],
        'created' : '',
        'updated' : ''
      },
      'user_3' : {
        'userName' : 'test3@test.com',
        'pwd' : '1234qwerty',
        'tokens' : ['asdf'],
        'created' : '',
        'updated' : ''
      }
    }
    
    Lockr.set('users',userIds.users);
    for (var i = 0; i < userIds.users.length; i++) {
      var thisUser = userIds.users[i];
      var userObj = userIds[thisUser];
      Lockr.set(thisUser,userObj);
    }

    UserListComponent = createComponent(UserList);
    
    //user emails match
    var userDivs = findAllWithClass(UserListComponent,'user.item');
    for (var i = 0; i < userDivs.length; i++) {
      var thisUserId = userIds.users[i];
      expect(userDivs[i].props.children).to.equal(userIds[thisUserId]['userName']);
    }
    //user tokens match
    var userTokens = findAllWithClass(UserListComponent,'tokens.item');
    for (var i = 0; i < userTokens.length; i++) {
      var thisUserId = userIds.users[i];
      expect(userTokens[i].props.children).to.equal(userIds[thisUserId]['tokens'].length);
    }

  });

  it('should delete correct user when delete button clicked', () => {
    
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<UserList />);

    UserListComponent = renderer.getRenderOutput();

    var delUser = findWithRef(UserListComponent,'empty-user_1');
    var userId = delUser.ref.substr(6);
    //manually invoke onClick
    delUser.props.onClick({stopPropagation: () => {}},userId);

    //manually redraw
    UserListComponent = renderer.getRenderOutput();

    var userIds = ['user_2'];
    var lockrUsers = Lockr.get('users');
    expect(lockrUsers.toString()).to.equal(userIds.toString());
    var userDivs = findAllWithClass(UserListComponent,'user.item');
    for (var i = 0; i < userDivs.length; i++) {
      var thisUserId = userIds[i];
      expect(userDivs[i].props.children).to.equal('tyrion@lannister.com');
    }

  });

  it('should render empty list with error message', () => {
    // this time we won't use shallow rendering to test state and UI
    Lockr.flush();
    var UserListComponent = ReactTestUtils.renderIntoDocument(<UserList/>);
    UserListComponent.loadFromLockr();

    var delUsers = ReactTestUtils.scryRenderedDOMComponentsWithClass(UserListComponent,'delete');
    ReactTestUtils.Simulate.click(delUsers[1]);
    ReactTestUtils.Simulate.click(delUsers[0]);

    expect(UserListComponent.state.data.length).to.equal(0);
    expect(UserListComponent.state.errorMsg).to.equal('You have no users! Try adding some');

    UserListComponent.componentWillUnmount();
    
  });
  
  it('should trigger the edit user modal when edit button clicked', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<UserList />);

    UserListComponent = renderer.getRenderOutput();

    var editUser1 = findWithRef(UserListComponent,'edit-user_1');
    var userId1 = editUser1.ref.substr(5);
    var didEdit = false;

    MyEmitter.on('editUser',function(thisUserId){
      if (userId1 == thisUserId) {
        
        didEdit = true;
      }
    });

    //manually invoke onClick
    editUser1.props.onClick({stopPropagation: () => {}},userId1);

    //manually redraw
    UserListComponent = renderer.getRenderOutput();

    expect(didEdit).to.equal(true);
  });

  it('should trigger the edit user modal when user row clicked', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<UserList />);

    UserListComponent = renderer.getRenderOutput();

    var userRows = findAllWithType(UserListComponent,'li');
    var userRow;
    var userId;
    var didEdit = false;
    for (var i = 0; i < userRows.length; i++) {
      if (userRows[i]['key'] == 'user_1') {
        userRow = userRows[i];
        userId = userRows[i]['key'];
      }
    }

    MyEmitter.on('editUser',function(thisUserId){
      if (userId == thisUserId) {
        didEdit = true;
      }
    });

    //manually invoke onClick
    userRow.props.onClick({stopPropagation: () => {}},userId);

    //manually redraw
    UserListComponent = renderer.getRenderOutput();

    expect(didEdit).to.equal(true);
  });

  it('should highlight user row when user row hover', () => {
    const renderer = ReactTestUtils.createRenderer();
    renderer.render(<UserList />);

    UserListComponent = renderer.getRenderOutput();

    var userRows = findAllWithType(UserListComponent,'li');
    var userRow;
    var userId;
    var didEdit = false;
    for (var i = 0; i < userRows.length; i++) {
      if (userRows[i]['key'] == 'user_1') {
        userRow = userRows[i];
        userId = userRows[i]['key'];
      }
    }

    //manually invoke onMouseEnter
    userRow.props.onMouseEnter(userId);

    //manually redraw
    UserListComponent = renderer.getRenderOutput();

    var listItems = findAllWithClass(UserListComponent,'visible-tools');
    expect(listItems.length).to.equal(1);
    expect(listItems[0]['key']).to.equal('user_1');
    
    //manually invoke onMouseLeave
    userRow.props.onMouseLeave();

    //manually redraw
    UserListComponent = renderer.getRenderOutput();
    listItems = findAllWithClass(UserListComponent,'visible-tools');
    expect(listItems.length).to.equal(0);
  });
  

});
