import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Recipes from '../../../api/Recipes/Recipes';
import ViewRecipe from '../../pages/Recipes/ViewRecipe';
import Loading from '../../components/Loading/Loading';

const composer = ({ match }, onData) => {
  const subscription = Meteor.subscribe('recipes.view', match.params._id);

  if (subscription.ready()) {
    const recipe = Recipes.findOne();
    onData(null, { recipe, history: match.params.history });
  }
};

export default composeWithTracker(composer, Loading)(ViewRecipe);
