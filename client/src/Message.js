import React from 'react';
import {Alert} from 'react-bootstrap';

export default ({ title, message }) =>
    <Alert bsStyle="warning">
        <strong>{title}</strong> <p>{message}</p>
    </Alert>