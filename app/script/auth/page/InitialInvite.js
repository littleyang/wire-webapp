/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */
import React from 'react';
import {connect} from 'react-redux';
import {injectIntl} from 'react-intl';
import {inviteStrings} from '../../strings';
import {
  H1,
  Text,
  Link,
  COLOR,
  CheckIcon,
  ContainerXS,
  ICON_NAME,
  InputSubmitCombo,
  Input,
  RoundIconButton,
  Form,
  ButtonLink,
  ErrorMessage,
} from '@wireapp/react-ui-kit';
import {parseError, parseValidationErrors} from '../util/errorUtil';
import {getAppPath} from '../util/urlUtil';
import * as LanguageSelector from '../module/selector/LanguageSelector';
import * as InviteSelector from '../module/selector/InviteSelector';
import {invite} from '../module/action/InviteAction';
import {resetError} from '../module/action/creator/InviteActionCreator';
import {fetchSelf} from '../module/action/SelfAction';
import ValidationError from '../module/action/ValidationError';
import Page from './Page';

class InitialInvite extends React.PureComponent {
  state = {
    enteredEmail: '',
    error: null,
  };

  componentDidMount() {
    this.props.fetchSelf();
  }

  onInviteDone = () => window.location.replace(getAppPath());

  renderEmail = email => (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        margin: '17px auto',
        padding: '0 24px 0 20px',
      }}
      key={email}
    >
      <Text fontSize="14px" data-uie-name="item-pending-email">
        {email}
      </Text>
      <CheckIcon color={COLOR.TEXT} />
    </div>
  );

  handleSubmit = event => {
    event.preventDefault();
    this.emailInput.value = this.emailInput.value.trim();
    if (!this.emailInput.checkValidity()) {
      this.setState({error: ValidationError.handleValidationState('email', this.emailInput.validity)});
    } else {
      this.props.invite({email: this.emailInput.value});
      this.setState({enteredEmail: ''});
      this.emailInput.value = '';
    }
    this.emailInput.focus();
  };

  resetErrors = () => {
    this.setState({error: null});
    this.props.resetError();
  };

  render() {
    const {
      invites,
      isFetching,
      error,
      intl: {formatMessage: _},
    } = this.props;
    const {enteredEmail} = this.state;
    return (
      <Page isAuthenticated>
        <ContainerXS
          centerText
          verticalCenter
          style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 428}}
        >
          <div>
            <H1 center>{_(inviteStrings.headline)}</H1>
            <Text>{_(inviteStrings.subhead)}</Text>
          </div>
          <div style={{margin: '18px 0', minHeight: 220}}>
            {invites.map(({email}) => this.renderEmail(email))}
            <Form onSubmit={this.handleSubmit}>
              <InputSubmitCombo>
                <Input
                  name="email"
                  placeholder={_(inviteStrings.emailPlaceholder)}
                  type="email"
                  onChange={event => {
                    this.resetErrors();
                    this.setState({enteredEmail: event.target.value});
                  }}
                  innerRef={node => (this.emailInput = node)}
                  autoFocus
                  data-uie-name="enter-invite-email"
                />
                <RoundIconButton
                  disabled={isFetching || !enteredEmail}
                  type="submit"
                  icon={ICON_NAME.PLANE}
                  data-uie-name="do-send-invite"
                  formNoValidate
                />
              </InputSubmitCombo>
            </Form>
            <ErrorMessage data-uie-name="error-message">
              {this.state.error ? parseValidationErrors(this.state.error) : parseError(error)}
            </ErrorMessage>
          </div>
          <div>
            {invites.length ? (
              <ButtonLink style={{margin: '0 auto -16px'}} onClick={this.onInviteDone} data-uie-name="do-next">
                {_(inviteStrings.nextButton)}
              </ButtonLink>
            ) : (
              <Link onClick={this.onInviteDone} data-uie-name="do-skip">
                {_(inviteStrings.skipForNow)}
              </Link>
            )}
          </div>
        </ContainerXS>
      </Page>
    );
  }
}

export default injectIntl(
  connect(
    state => ({
      error: InviteSelector.getError(state),
      invites: InviteSelector.getInvites(state),
      isFetching: InviteSelector.isFetching(state),
      language: LanguageSelector.getLanguage(state),
    }),
    {
      fetchSelf,
      invite,
      resetError,
    }
  )(InitialInvite)
);
