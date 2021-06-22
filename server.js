const express = require("express");
const app = express();
const path = require("path");
const session = require('express-session');
require('dotenv').config();
const morgan = require("morgan");
const apiRouter = require("./route");
const {db, connection} = require("./dataBase.js");
let user_id; // to identify the logged user


app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/src/views/'));


app.use(morgan("short"));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use("/", apiRouter);

app.use(session({
  secret: "ncoweuihcskjdfoi",
  resave: true,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3002/index");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );

  next();
});


app.set('view engine', 'hbs');

app.get('/register', function (req, res) {
  res.render("register");
});

app.get("/", isLoggedIn, function (req, res) {
  res.render("login");
});

//gets the path to login file on the URL field --> localhost:2000/
app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/newArticle', isLoggedIn, function (req, res) {
  res.render("newArticle");
});

app.get('/home', isLoggedIn, function (req, res) {
  res.render("index");
});

app.get('/about', isLoggedIn, function (req, res) {
  res.render("about");
});

app.get('/mybookings', isLoggedIn, function (req, res) {
  res.render("myBookings");
});

//admin page
app.get('/admin', isLoggedIn, function (req, res) {
  res.render("adminPage");
});

app.get('/addArticle', isLoggedIn, function (req, res) {
  res.render("addArticle");
});

app.get('/adminBooking', isLoggedIn, function (req, res) {
  res.render("adminBookingTable");
});

app.get('/bookingReperation', isLoggedIn, function (req, res) {
  res.render("bookingReperation");
});

//sign up
app.post("/register", (req, res) => {
  const {name, email, password, passwordConfirm} = req.body;
  connection.query("SELECT email FROM users WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (result.length > 0) {
        return res.render("register", {
          message: "Email is already in use"
        });
      } else if (password !== passwordConfirm) {
        return res.render("register", {
          message: "Unmatched Password"
        });
      }
    }

    if (name === "" || email === "" || password === "" || passwordConfirm === "") {
      return res.render("register", {
        message: "Please fill all Fields to register"
      });
    } else if (name === "" && email === "" && password === "" && passwordConfirm === "") {
      return res.render("register", {
        message: "Field is Empty"
      });
    } else {
      console.log(process.env.userReg)
      let role = process.env.userReg;
      if (!(name === "" && email === "" && password === "" && passwordConfirm === "")) {
        connection.query("INSERT INTO users set ?", {name: name, email: email, password: password, role}, (err,result) => {
          if (err) {
            console.log(err);
          } else {
            console.log(result);
            return res.render("login", {
              message: "User Registered"
            });
          }
        });
      }
    }
  });
});

//login
app.post("/index", (req, res) => {
  const {email, password} = req.body;
  if (email === "" && password === "") {
    res.render("login", {
      message: ("Please enter Email and Password")
    });
  } else if (email === "" || password === "") {
    res.render("login", {
      message: ("Please enter Email and Password")
    });
  } else {
    console.debug('about to query')
    connection.query("SELECT * FROM users WHERE email=? AND password=?", [email, password], function (err, result) {
      console.debug('after query')
      if (err) {
        console.log(err);
        throw err;
      }
      console.debug('before If ' + result.user_id)
      if (result.length > 0) {

        result.forEach(function (row) {
          if (row.role === "admin") {
            user_id = row.user_id;
            req.session.loggedin = true;
            req.session.email = email;
            req.session.name = row.name
            return res.status(200).render("adminPage");
          } else if (row.role === "user") {
            user_id = row.user_id;
            req.session.loggedin = true;
            req.session.email = email;
            req.session.email = row.name
            return res.status(200).render("index");
          }
        });

      }
    });

  }

});

app.get('/logout', function (req, res) {
  // remove the req.user property and clear the login session
  if (req.session) {
    req.session.email = null
    res.clearCookie('email')
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    req.session.destroy(err => {
      console.log(err);
    });
    //es.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

  }

  res.redirect("login");
});


app.post("/bookingReperation", (req, res) => {
  const {book_date, address, descr} = req.body;
  if (req.session.loggedin) {

    connection.query("SELECT book_date FROM book WHERE book_date = ?", [book_date], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        if (result.length > 0) {
          return res.render("bookingReperation", {
            message: "Date is already in use"
          });
        } else if (descr === "" && book_date === "") {
          return res.render("bookingReperation", {
            message: "Book a Date"
          });
        } else {
          if (!(descr === "" && book_date === "")) {
            connection.query("INSERT INTO book set ?", { descr: descr, book_date: book_date, address: address, user_id }, (err, result) => {
              if (err) {
                console.log(err);
              } else {
                return res.render("myBookings", {
                  message: "Booking Registered"
                });
              }
            });
          }
        }
      }
    });

  }
});


app.post("/newArticle", (req, res) => {
  const {title, description} = req.body;
  const date = new Date();

  if (!(title === "" && description === "")) {
    connection.query("INSERT INTO news set ?", {title: title, description: description, date}, (err,result) => {
      if (err) {
        console.log(err);
      } else {
        console.log(result);
        return res.render("addArticle");
      }
    });
  }
});

app.get("/index", isLoggedIn, function (req, res) {
  return res.status(200).render("index");

});


app.get("/booked", (req, res, next) => {
  if (!req.session.loggedin) {
    return res.status(401).redirect("./login");
  } else {

    console.log("User_id --> " + user_id);
    connection.query("SELECT * FROM book WHERE user_id =" + [user_id], function (err, result) {
      if (err) {
        console.log(err);
      } else {
        if (result.length > 0) {
          res.json(result);
        }
      }
    });
  }
});

app.get("/delete", (req, res) => {
  const book_id = req.query.book_id;
  console.log("--------------> " + book_id); //<------------------------------
  if (!req.session.loggedin) {
    return res.status(401).redirect("login");
  } else {
    connection.query("DELETE FROM book WHERE book_id= " + req.query.book_id, function (err, result) {
      if (err) {
        throw err;
      } else {
        res.redirect("myBookings");
      }
    });
  }
});


function isLoggedIn(req, res, next) {
  if (!req.session.loggedin) {
    return res.status(401).redirect("login");
  } else {
    next();
  }
}

//start server
app.listen(process.env.PORT || 3002, function () {
  console.log("running server on port 3002");
});
