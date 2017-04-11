import React from 'react';
import Stock from './Stock';
import {Grid, Row, Col} from 'react-bootstrap';

export default ({ stocks, onSelectStock }) =>
   <Grid>
     <Row className="show-grid">
        {stocks.map((stock,i) =>{
            return typeof(stock) === 'object' && 
                   <Col key={i} xs={6} sm={4} md={2}><Stock onClick={() => onSelectStock(stock.t)} stock={stock} /></Col>
          } 
        )}
      </Row>
   </Grid>