import React from 'react';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
// import AccountPageFooter from '../../components/AccountPageFooter/AccountPageFooter';
import { getLoggedInUserDisplayUserName } from '../../../../modules/helpers';
import validate from '../../../../modules/validate';

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        mobilePhone: {
          required: true,
          indiaMobilePhone: true,
        },
        password: {
          required: true,
        },
      },
      messages: {
        mobilePhone: {
          required: 'Need your mobile number.',
          indiaMobilePhone: 'Is this a valid India mobile number?',
        },
        password: {
          required: 'Need a password here.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const username = { username: this.mobilePhone.value };
    const password = this.password.value;

    Meteor.loginWithPassword(username, password, (error) => {
      if (error) {
        Bert.alert(error.reason, 'warning');
      } else {
        Bert.alert(`Welcome ${getLoggedInUserDisplayUserName()}`, 'success');
        this.setState({
          loggedIn: true,
        });
        //history.push('/order');
      }
    });
  }

  render() {
    return (<div className="Login Absolute-Center is-Responsive">
      <Row>
        <Col xs={12} sm={6} md={5} lg={4}>
          <h4 className="page-header">Log In</h4>
          <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
            <FormGroup>
              <ControlLabel>Mobile Number</ControlLabel>
              <input
                type="text"
                name="mobilePhone"
                ref={mobilePhone => (this.mobilePhone = mobilePhone)}
                className="form-control"
                placeholder="10 digit number example, 8787989897"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel className="clearfix">
                <span className="pull-left">Password</span>
                <Link className="pull-right" to="/recover-password">Forgot password?</Link>
              </ControlLabel>
              <input
                type="password"
                name="password"
                ref={password => (this.password = password)}
                className="form-control"
                placeholder="Password"
              />
            </FormGroup>
            <Button type="submit" bsStyle="primary">Log In</Button>
            {/* <AccountPageFooter>
              <p>{'Don\'t have an account?'} <Link to="/signup">Sign Up</Link>.</p>
            </AccountPageFooter> */}
          </form>
          {/* } <Row>
            <p>- Or - </p>
          </Row>
          <Row>
            <Col xs={12}>
              <OAuthLoginButtons
                services={['facebook' , 'github', 'google']}
              />
            </Col>
          </Row> */}
        </Col>
      </Row>
    </div>);
  }
}

Login.propTypes = {
  history: PropTypes.object.isRequired,
};

export default Login;
