import React from 'react';
import {Panel, Button, Table} from 'react-bootstrap';

export default ({ stock, onClick }) =>{
        const title = <div><h6>{stock.e} - {stock.lt} </h6><span><h5>{stock.t}</h5></span></div>
        return <div>
        
            <Panel header={title}>
                <Table responsive>
                    <tbody>
                    <tr>
                        <td>l</td>
                        <td>{stock.l}</td>
                    </tr>
                    <tr>
                        <td>s</td>
                        <td>{stock.s}</td>
                    </tr>
                    <tr>
                        <td>c</td>
                        <td>{stock.c}</td>
                    </tr>
                    </tbody>
                </Table>
            
            <Button onClick={onClick} bsStyle="info">Show History</Button>
            </Panel>
        </div>
    }