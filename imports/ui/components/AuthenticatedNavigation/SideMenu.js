import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { NavLink } from 'react-router-dom';
import { Panel, Row, Col, Button } from 'react-bootstrap';
import AdminNav from './AdminNav';
import Menu from './Menu';

const handleLogout = () => Meteor.logout();

const SideMenu = props => (
  <Menu alignment="right">
    <Panel className="menu-panel">
      <Row>
        <div className="container">
          <Col xs={12}>
            <ul>
              <li>
                <NavLink to="/invitations">Invite Friends</NavLink>
              </li>
              <li>
                <NavLink to="/recover-password">Change Password</NavLink>
              </li>
              <li>
                <NavLink to="/update">Update My Profile</NavLink>
              </li>
            </ul>
            { <AdminNav {...props} /> }
            <ul>
              <li>
                <NavLink to="/about">About Us</NavLink>
              </li>
              <li>
                <Button id="app-logout" onClick={handleLogout}>Logout</Button>
              </li>
            </ul>
          </Col>
        </div>
      </Row>
    </Panel>
  </Menu>
);

SideMenu.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default SideMenu;
