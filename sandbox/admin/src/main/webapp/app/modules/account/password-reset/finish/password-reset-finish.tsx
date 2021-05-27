import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Col, Row, Button } from 'reactstrap';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import { Translate, translate, getUrlParameter } from 'react-jhipster';
import { RouteComponentProps } from 'react-router-dom';

import { handlePasswordResetFinish, reset } from '../password-reset.reducer';
import PasswordStrengthBar from 'app/shared/layout/password/password-strength-bar';

export interface IPasswordResetFinishProps extends DispatchProps, RouteComponentProps<{ key: string }> {}

export const PasswordResetFinishPage = (props: IPasswordResetFinishProps) => {
  const [password, setPassword] = useState('');
  const [key] = useState(getUrlParameter('key', props.location.search));

  useEffect(
    () => () => {
      props.reset();
    },
    []
  );

  const handleValidSubmit = (event, values) => props.handlePasswordResetFinish(key, values.newPassword);

  const updatePassword = event => setPassword(event.target.value);

  const getResetForm = () => {
    return (
      <AvForm onValidSubmit={handleValidSubmit}>
        <AvField
          name="newPassword"
          label={translate('global.form.newpassword.label')}
          placeholder={translate('global.form.newpassword.placeholder')}
          type="password"
          validate={{
            required: { value: true, errorMessage: translate('global.messages.validate.newpassword.required') },
            minLength: { value: 4, errorMessage: translate('global.messages.validate.newpassword.minlength') },
            maxLength: { value: 50, errorMessage: translate('global.messages.validate.newpassword.maxlength') },
          }}
          onChange={updatePassword}
          data-cy="resetPassword"
        />
        <PasswordStrengthBar password={password} />
        <AvField
          name="confirmPassword"
          label={translate('global.form.confirmpassword.label')}
          placeholder={translate('global.form.confirmpassword.placeholder')}
          type="password"
          validate={{
            required: { value: true, errorMessage: translate('global.messages.validate.confirmpassword.required') },
            minLength: { value: 4, errorMessage: translate('global.messages.validate.confirmpassword.minlength') },
            maxLength: { value: 50, errorMessage: translate('global.messages.validate.confirmpassword.maxlength') },
            match: { value: 'newPassword', errorMessage: translate('global.messages.error.dontmatch') },
          }}
          data-cy="confirmResetPassword"
        />
        <Button color="success" type="submit" data-cy="submit">
          <Translate contentKey="reset.finish.form.button">Validate new password</Translate>
        </Button>
      </AvForm>
    );
  };

  return (
    <div>
      <Row className="justify-content-center">
        <Col md="4">
          <h1>
            <Translate contentKey="reset.finish.title">Reset password</Translate>
          </h1>
          <div>{key ? getResetForm() : null}</div>
        </Col>
      </Row>
    </div>
  );
};

const mapDispatchToProps = { handlePasswordResetFinish, reset };

type DispatchProps = typeof mapDispatchToProps;

export default connect(null, mapDispatchToProps)(PasswordResetFinishPage);
