import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import { Glyphicon } from 'react-bootstrap';

export const EasyNavNarrowScreen = () => (
  <ul className="sec-menu-bar visible-sm visible-xs row">
    <li className="col-xs-4 text-center">
      <Link to="/order"> <Glyphicon glyph="pencil" /> Place Order </Link>
    </li>
    <li className="col-xs-4 text-center">
      <Link to="/specials"> <Glyphicon glyph="heart" /> Specials </Link>
    </li>
    <li className="col-xs-4 text-center">
      <Link to="/"> <Glyphicon glyph="list" /> My Orders</Link>
    </li>
  </ul>
);

export const EasyNavWideScreen = () => (
  <Nav className="hidden-xs hidden-sm" >
    <li>
      <NavLink to="/order"><Glyphicon glyph="pencil" /> Place Order</NavLink>
    </li>
    <li>
      <NavLink to="/specials"><Glyphicon glyph="heart" /> Specials </NavLink>
    </li>
    <li>
      <NavLink exact to="/"><Glyphicon glyph="list" /> My Orders</NavLink>
    </li>
  </Nav>
);
