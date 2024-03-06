// used this script to populate db with seats for the differen planes

'use strict';

const db = require('./db');

async function createSeats(rows, columns,planeId){
    // our database is configured to have a NULL value for films without rating
    const places = ['A','B','C','D','E','F'];
    let sql = 'INSERT INTO seats (row,position,planeId) VALUES';
    
    for (let i = 1; i <= rows; i++) {
        for (let j = 0; j < columns; j++) {
            sql += `(${i}, '${places[j]}', ${planeId})`;
            (j === columns - 1 && i === rows) ? (sql += ';') : (sql += ',');
             
        } 
      } 

    // insert all at once
    db.run(sql, [], function(err) {
        if (err) {
            return 
        }
        // get the last insert id
        
        });
    
    
};


createSeats(25,6,3);
