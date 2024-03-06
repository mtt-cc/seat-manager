'use strict';

/* Data Access Object (DAO) module for accessing films data */

const db = require('./db');
const dayjs = require("dayjs");



// This function retrieves the list of planes
exports.getPlanes = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM  planes p,  planeTypes pt where p.type = pt.type';
    db.all(sql, [], (err, rows) => {
      if (err) { reject(err); }
      resolve(rows);
      });
    });
};

// This function retrieves a plane given its id
exports.getPlaneById = (planeId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM  planes p,  planeTypes pt where p.type = pt.type AND p.planeId = ?';
    db.all(sql, [planeId], (err, rows) => {
      if (err) { reject(err); }
      resolve(rows);
      });
    });
};

  // This function retrieves the list of seats of the provided plane
exports.getSeats = (planeId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM seats WHERE planeId=? ORDER BY row ASC, position ASC';
    db.all(sql, [planeId], (err, rows) => {
      if (err) { reject(err); }
      resolve(rows);
      });
    });
  };

  //this function returns seats by seatId
exports.getSeatsBySeatId = (seatIds) => {
  return new Promise((resolve, reject) => {
    let sql = '';
    seatIds.forEach((sid,index) => { 
      if (index === 0)
        sql += `SELECT * FROM seats WHERE seatId=${sid}`
      else
        sql += ` OR seatId = ${sid}`
    })
    sql+=' ORDER BY row ASC, position ASC';
    db.all(sql, [], (err, rows) => {
      if (err) { reject(err); }
      resolve(rows);
      });
    });
  };
  

  // This function retrieves the whole list of films from the database.
exports.bookSeats = (seats, user) => {
  
  return new Promise((resolve, reject) => {
    let sql = '';
    seats.forEach((s,index) => { 
      if (index === 0)
        sql += `UPDATE seats SET status = 'occupied', userId='${user.id}' WHERE seatId = ${s.seatId}`
      else
        sql += ` OR seatId = ${s.seatId}`
    })
    
    db.run(sql, [], (err) => {
      if (err) { reject(err); }
      resolve('successfuly booked seat');
      });
    });
  };

  exports.cancelBooking = (user, planeId) => {
    return new Promise((resolve, reject) => {
      const sql = `UPDATE seats SET status = 'available', userId=NULL WHERE userId=${user.id} AND planeId=${planeId}`;
      db.run(sql, [], (err) => {
        if (err) { reject(err); }
        resolve('successfuly canceled booking');
        });
      });
    };

