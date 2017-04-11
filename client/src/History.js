import React from 'react';
import {Modal,Grid, Row, Col, Button} from 'react-bootstrap';


export default ({value,onClick}) =>
 <Modal show={true} onHide={onClick}>
   <Modal.Header closeButton>
            <Modal.Title>{value[0].t} - {value[0].e}</Modal.Title>
   </Modal.Header>
   <Modal.Body>
        <h4>Last 10 updates</h4>
        <Grid>
            <Row className="show-grid">
                <Col xs={3}>Timestamp</Col>
                <Col xs={2}>l</Col>
                <Col xs={2}>c</Col>
            </Row>
            {value.map((stock,i) =>
              <Row key={i} className="show-grid">
                <Col xs={3}>{stock.timestamp.toString()}</Col>
                <Col xs={2}>{stock.l}</Col>
                <Col xs={2}>{stock.c}</Col>
              </Row>
            )}
        </Grid>
    </Modal.Body>
    <Modal.Footer>
            <Button onClick={onClick}>Close</Button>
    </Modal.Footer>
   </Modal>