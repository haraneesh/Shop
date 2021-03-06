import React from 'react';
import { Panel, Row, Col, Glyphicon, FormControl, FormGroup, Button, ControlLabel } from 'react-bootstrap';
import PropTypes from 'prop-types';

const IngredientRow = ({ ingredient, controlName, valueChange, removeValue }) => (
  <Row>
    <Col xs={9}>
      <FormControl
        type="text"
        defaultValue={ingredient}
        value={ingredient}
        onChange={valueChange}
        name={controlName}
      />
    </Col>
    <Col xs={3}>
      <Button bsSize="xsmall" onClick={() => removeValue(controlName)}> <Glyphicon glyph="minus" /></Button>
    </Col>
  </Row>
);

export default class IngredientSelector extends React.Component {
  constructor(props, context) {
    super(props, context);

    this._forNextIngredientId = 0;
    const ingredientList = {};

    const { ingredients } = this.props;
    if (ingredients) {
      this.props.ingredients.forEach((ingredient) => {
        const objName = `ing${this._forNextIngredientId}`;
        this._forNextIngredientId = this._forNextIngredientId + 1;
        ingredientList[objName] = ingredient;
      }
            );
    }

    this.state = {
      ingredients: {
        ingredientList,
      },
    };

    this.handleAddIngredient = this.handleAddIngredient.bind(this);
    this.handleMinusIngredient = this.handleMinusIngredient.bind(this);
    this.ingredientValueChange = this.ingredientValueChange.bind(this);
  }

  componentDidMount() {
    const ingredientList = this.state.ingredients.ingredientList;
    this.props.onChange(Object.assign({}, ingredientList));
  }

  ingredientValueChange(event) {
    const ingredientList = this.state.ingredients.ingredientList;
    ingredientList[event.target.name] = event.target.value;

    this.updateStateAndReturnIngredients(ingredientList);
  }

  updateStateAndReturnIngredients(ingredientList) {
    this.setState(
      {
        ingredients: {
          ingredientList: Object.assign({}, ingredientList),
        },
      }
        );
    this.props.onChange(Object.assign({}, ingredientList));
  }

  handleMinusIngredient(controlName /* Ingredient List Key*/) {
    const ingredientList = this.state.ingredients.ingredientList;
    delete ingredientList[controlName];
    this.updateStateAndReturnIngredients(ingredientList);
  }

  handleAddIngredient() {
    const ingredientList = this.state.ingredients.ingredientList;
    this._forNextIngredientId = this._forNextIngredientId + 1;
    ingredientList[`ing${this._forNextIngredientId}`] = '';

    this.updateStateAndReturnIngredients(ingredientList);
  }

  render() {
    const controlName = this.props.controlName;
    return (
      <Panel name={controlName}>
        {
                _.map(this.state.ingredients.ingredientList, function (value, index) {
                  return (<IngredientRow
                    ingredient={value}
                    controlName={key}
                    valueChange={this.ingredientValueChange}
                    removeValue={this.handleMinusIngredient}
                    key={`ingredient-${index}`}
                  />);
                }, this)
                }
        <Button bsSize="small" onClick={this.handleAddIngredient}> <Glyphicon glyph="plus" /></Button>
      </Panel>
    );
  }
}

IngredientSelector.propTypes = {
  ingredients: PropTypes.array,
  onChange: PropTypes.func,
  controlName: PropTypes.string.isRequired,
};
