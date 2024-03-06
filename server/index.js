/*** Importing modules ***/
const express = require('express');
const morgan = require('morgan');                                  // logging middleware
const cors = require('cors');

const { check, validationResult,body  } = require('express-validator'); // validation middleware

const seatsDao = require('./dao-seats'); // module for accessing the films table in the DB
const userDao = require('./dao-users'); // module for accessing the user table in the DB

/*** init express and set-up the middlewares ***/
const app = express();
app.use(morgan('dev'));
app.use(express.json());

/**
 * The "delay" middleware introduces some delay in server responses. To change the delay change the value of "delayTime" (specified in milliseconds).
 * This middleware could be useful for debug purposes, to enabling it uncomment the following lines.
 */ 

const delay = require('express-delay');
app.use(delay(200,1000));


/** Set up and enable Cross-Origin Resource Sharing (CORS) **/
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
};
app.use(cors(corsOptions));


/*** Passport ***/

/** Authentication-related imports **/
const passport = require('passport');                              // authentication middleware
const LocalStrategy = require('passport-local');                   // authentication strategy (username and password)

/** Set up authentication strategy to search in the DB a user with a matching password.
 * The user object will contain other information extracted by the method userDao.getUser (i.e., id, username, name).
 **/
passport.use(new LocalStrategy(async function verify(username, password, callback) {
  const user = await userDao.getUser(username, password)
  if(!user)
    return callback(null, false, 'Incorrect username or password');  
    
  return callback(null, user); // NOTE: user info in the session (all fields returned by userDao.getUser, i.e, id, username, name)
}));

// Serializing in the session the user object given from LocalStrategy(verify).
passport.serializeUser(function (user, callback) { // this user is id + username + name 
  callback(null, user);
});

// Starting from the data in the session, we extract the current (logged-in) user.
passport.deserializeUser(function (user, callback) { // this user is id + email + name 
  // if needed, we can do extra check here (e.g., double check that the user is still in the database, etc.)
  // e.g.: return userDao.getUserById(id).then(user => callback(null, user)).catch(err => callback(err, null));

  return callback(null, user); // this will be available in req.user
});

/** Creating the session */
const session = require('express-session');

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


/** Defining authentication verification middleware **/
const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: 'Not authorized'});
}


/*** Utility Functions ***/

// This function is used to format express-validator errors as strings
const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
  return `${location}[${param}]: ${msg}`;
};


/*** Users APIs ***/

// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => { 
    if (err)
      return next(err);
      if (!user) {
        // display wrong login messages
        return res.status(401).json({ error: info});
      }
      // success, perform the login and extablish a login session
      req.login(user, (err) => {
        if (err)
          return next(err);
        
        // req.user contains the authenticated user, we send all the user info back
        // this is coming from userDao.getUser() in LocalStratecy Verify Fn
        return res.json(req.user);
      });
  })(req, res, next);
});

// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Not authenticated'});
});

// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});



/*** Seats APIs ***/

// 1. Retrieves list of planes
// GET `/api/planes`
app.get('/api/planes',
  (req, res) => {
    seatsDao.getPlanes()
        .then(planes => res.json(planes))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

// 2. Retrieves list of seats of a certain plane
// GET `/api/seats/:planeId`
app.get('/api/seats/:planeId',
  [ check('planeId').isInt({min: 1}) ],
  (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    seatsDao.getSeats(req.params.planeId)
      .then(seats => res.json(seats))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

// 3. Retrieves a plane given id
// GET `/api/seats/:planeId`
app.get('/api/planes/:planeId',
  [ check('planeId').isInt({min: 1}) ],
  (req, res) => {

    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }

    seatsDao.getPlaneById(req.params.planeId)
        .then(plane => res.json(plane))
      .catch((err) => res.status(500).json(err)); // always return a json and an error message
  }
);

// Booking seats
// PUT `/api/seats/bookseats/:planeId`
app.put('/api/seats/bookseats/:planeId',
  isLoggedIn,
  body('*.seatId').isInt({min: 1}).withMessage('seatId lower than 1'),
  async (req, res) => {
    
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }
    // Check that requested seats all belong to the plane, have same planeId as url
    const seatsToCheck = await seatsDao.getSeatsBySeatId(req.body.map(s=>s.seatId));
    
    seatsToCheck.forEach(s => {
      if(s.planeId!==Number(req.params.planeId)){
        
        return res.status(422).json({ error: 'URL and body id mismatch' });
      }
    })
    // first check that requested seats are still available
    // if not, return a list of seats to be highlighted in the 
    // front end
    
    const alreadyBookedSeats = [];
    try {
      const requestedSeats = req.body;
            
      const seats = await seatsDao.getSeats(req.params.planeId);
      
      
      
      requestedSeats.forEach((rs) => {
        console.log("inside indexjs seats foreach " + rs.seatId)
        const matchingSeat = seats.find((s) => rs.seatId === s.seatId);
      
        if(matchingSeat!==-1){
          if (matchingSeat.status === 'occupied') {
            
            alreadyBookedSeats.push({seatId: matchingSeat.seatId, status: matchingSeat.status});
            matchingSeat.status = 'alreadyBooked';
            
          }
        }
      });

      

      if(alreadyBookedSeats.length > 0){
        
        res.status(500).json(seats);

      } else {

      const result = await seatsDao.bookSeats(req.body, req.user); 
      res.json(result);
      }
    } catch (err) {
        res.status(503).json({ error: `Database error during booking: ${err}` }); 
    }
  }
);


// PUT /seats/cancelbooking
// pass list of seatIds, set seats to available and reset userId of the seat
app.put('/api/seats/cancelbooking/:planeId',
  isLoggedIn,
  check('planeId').isInt({min: 1}).withMessage('planeId lower than 1'),
  async (req, res) => {
    
    // Is there any validation error?
    const errors = validationResult(req).formatWith(errorFormatter); // format error message
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: errors.array().join(", ") }); // error message is a single string with all error joined together
    }
    if (req.body.planeId !== Number(req.params.planeId)) {
      return res.status(422).json({ error: 'URL and body planeId mismatch' });
    }
    try {
      const result = await seatsDao.cancelBooking(req.user,req.body.planeId); 
      res.json(result);
    } catch (err) {
      res.status(503).json({ error: `Database error while canceling booking: ${err}` }); 
    }
  }
);

// Activating the server
const PORT = 3000;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));
