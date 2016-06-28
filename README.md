# User Management System

This is a user management system that allows a user to add, edit, delete other end-users. End-users have a unique id, a username (their email), a password, optional unique tokens, a created timestamp, and an updated timestamp.

## See the app in action

### Run webpack dev server
from inside the usermgmt directory:
```
npm install

npm start
```
Your browser should automatically open, but if not go to <http://localhost:8000>

This can be sluggish so you could also compile the app into static files (see below).

### Or compile app into static files and run compiled app
from inside usermgmt directory:
```
npm run-script dist

npm install http-server -g

http-server dist
```
Point your browser to <http://127.0.0.1:8080/>

### Run unit tests

```
npm test
```

## Where to find the components and test cases

```
├── usermgmt/
│   ├── README.md
│   ├── dist //compiled app goes here
│   │   ├── ...
│   ├── src
│   │   ├── components //react components live here
│   │   │   ├── AddUser.js //add new user component (on left in UI)
│   │   │   ├── GlobalEvent.js //event listener using events module
│   │   │   ├── Main.js //main parent component
│   │   │   ├── Message.js //mixin for error messaging system
│   │   │   ├── ModalUser.js //edit user component (on right in UI)
│   │   │   ├── UserList.js //user list component (in middle in UI)
│   │   │   ├── UserStorage.js //mixin for retrieving, saving users on localStorage
│   │   ├── sources
│   │   │   ├── data.js //default dummy user data first time you start app
│   │   ├── styles
│   │   │   ├── ... //css in here
│   │   ├── ...
│   ├── test
│   │   ├── components 
│   │   │   ├── ... //js unit tests in here

```

## Some further considerations
* Would need to do another pass and refactor 
* Along with pagination, search and sort by columns would improve usability for very long lists
* This app doesn't handle very large lists well. Next time, have some error handling if localStorage is full
* This app saves the user password in plaintext, which would never be the right thing to do in the real world. Next time, hash password, store hash and only have ability to change to a new password in _edit user_ mode