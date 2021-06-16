//const mysql = require("mysql");
const {Pool} = require('pg')

// mysql.createPool -> creates a connection with a connectionLimit of '10'
const connection = new Pool({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: process.env.CONN_LIMIT,
  ssl: {
    rejectUnauthorized: false
  }
});

let db = {};

db.news = () => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT *
                      FROM public.news;`, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results.rows);
      }
    });
  });
}

db.getAllUser = () => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT *
                      FROM users;`, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results.rows);
      }
    });
  });
}

db.deleteUser = (user_id) => {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM users WHERE user_id= ` + user_id, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results.rows);
      }
    });
  });
}

//display all booking on admin page
db.getAllBookings = () => {
  return new Promise((resolve, reject) => {
    connection.query(`SELECT *
                      FROM book`, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results.rows);
      }
    });
  });
}

//delete booking one by one on admin page
db.deleteAllBookings = (book_id) => {
  return new Promise((resolve, reject) => {
    connection.query(`DELETE FROM book WHERE book_id= ` + book_id, function (err, results) {
      if (err) {
        reject(err);
      } else {
        resolve(results.rows);
      }
    });
  });
}


exports.db = db;
exports.connection = connection