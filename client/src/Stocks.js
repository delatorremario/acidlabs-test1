import React from 'react';
import Stock from './Stock';
import {Grid, Row, Col} from 'react-bootstrap';

export default ({ stocks, onSelectStock }) =>
   <Grid>
        {stocks.map(stock =>
          <Row key={stock.l} className="show-grid">
            <Col xs={12}><Stock onClick={() => onSelectStock(stock.l)} stock={stock} /></Col>
         </Row>
        )}
   </Grid>