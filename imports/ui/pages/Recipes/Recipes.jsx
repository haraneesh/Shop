import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import RecipesList from '../../containers/Recipes/RecipesList.js';

const Recipes = ({ history }) => (
  <div className="Recipes">
    <Row>
      <Col xs={12}>
        <div className="page-header clearfix">
          <h3 className="pull-left">Recipes</h3>
          <Button
            bsStyle="primary"
            className="pull-right"
            href="/recipes/new"
          >New Recipe</Button>
        </div>
        <RecipesList history={history} />
      </Col>
    </Row>
  </div>
);

export default Recipes;
