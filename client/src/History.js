import React from 'react';
import {Grid, Row, Col} from 'react-bootstrap';


export default ({value}) =>
    <Grid>
        {value.map(stock =>
          <Row key={stock.timestamp.toString()} className="show-grid">
            <Col xs={3}>{stock.timestamp.toString()}</Col>
            <Col xs={2}>{stock.t}</Col>
            <Col xs={2}>{stock.e}</Col>
            <Col xs={2}>{stock.l}</Col>
            <Col xs={2}>{stock.c}</Col>
         </Row>
        )}
   </Grid>