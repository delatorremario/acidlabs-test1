import React from 'react';
import {Alert} from 'react-bootstrap';

export default ({ error }) =>
    <Alert bsStyle="danger">
        <strong>{error.title}</strong> <p>{error.message}</p>
    </Alert>