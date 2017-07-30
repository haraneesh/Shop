import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Recipes from '../Recipes';

Meteor.publish('recipes.list', () => Recipes.find());

Meteor.publish('recipes.view', (_id) => {
  check(_id, String);
  return Recipes.find(_id);
});
