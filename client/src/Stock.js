import React from 'react';
export default ({ stock, onClick }) =>
   <p onClick={onClick}>{stock.l}: {stock.c}</p>