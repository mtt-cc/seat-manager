[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/Ij4wZ9xX)
# Exam #2: "Airplane Seats"

## Student: s315040 CICILLONI MATTEO 

# Server side

## API Server

- GET `api/planes`
  - request parameters: None
  - request body: None
  - Returns all the planes
  ``` json
  [
    {"planeId":1,"type":"local","rows":15,"columns":4},
    {"planeId":2,"type":"regional","rows":20,"columns":5},
    {"planeId":3,"type":"international","rows":25,"columns":6}
  ]
  ```
  
- GET `/api/seats/:planeId`
  - request parameters: None
  - request body: None
  - Returns the list of all seats of a specific plane
  ``` json
  [
    {"seatId":310,"status":"occupied","row":1,"position":"A","planeId":1,"userId":2},
    {"seatId":311,"status":"available","row":1,"position":"B","planeId":1,"userId":null},
    ...
  ]
  ```

- PUT `/api/seats/bookseats/:planeId`
  - Attempts to book requested seats by an authenticated user, if one of the requested seats was booked in the meantime it return the list of seats of the plane, with the seats alredy booked with `status: alreadyBooked` and code 500, otherwise correctly books seats and returns code 200
- request parameters: None
- request body:
  ``` json
  [
    {"seatId":311,"status":"occupied"},
  ]
  ``` 
- response body(in case of already booked seats):
  ``` json
  [
    {"seatId":311,"status":"occupied"},
  ]
  ``` 

- PUT `/api/seats/cancelbooking/:planeId`
  - Cancels the booking of an authenticated user for a specific plane given by `planeId`
  - request parameters: None
  - request body: 
  ``` json
    { 
      "planeId":1
    }
  ``` 
  - response body:
  ``` json
    "successfuly canceled booking"
  ``` 

- POST`/api/sessions`
- authenticate the user who is trying to login
- Request body: credentials of the user who is trying to login

``` JSON
{
    "username": "username",
    "password": "password"
}
```
response body:

``` JSON
{
    "id": 1,
    "username": "john.doe@polito.it", 
    "name": "John"
}
```

- GET `/api/sessions/current`
- check if current user is logged in and get her data
- Response body: authenticated user

``` JSON
{
    "id": 1,
    "username": "john.doe@polito.it", 
    "name": "John"
}
```

- DELETE `/api/sessions/current`
- logout current user
- Request body: None
- Response body: None




## Database Tables

- Table `users` - contains users (id, email, name, hash, salt)
- Table `seats` - contains the list of seats (seatId, status, row, position, planeId, userId)
- Table `planes` - contains the list of planes (planeId, type)
- Table `planeTypes` - contains info about plane type (typeId, rows, columns)


# Client side


## React Client Application Routes

- Route `/`: initial page while not logged in, can see the list of planes
- Route `/booking/:planeId`: shows the grid representation of the seats on the place specified by `planeId`, if logged in also shows the possibility to book the seats or cancel an existing booking
- Route `/login`: allows user to login


## Main React Components

- `MainLayout` (in `PageLayout.jsx`): holds the list of planes
- `SeatsLayout` (in `PageLayout.jsx`): holds all minor components for the seats layout and booking components
- `SeatGrid` (in `PlanesLibrary.jsx`): used to show the grid of available seats
- `BookingForm` (in `BookingForm.jsx`): contains the components for the auto-assign of requested seats and to confirm booking
- `Booking` (in `BookingForm.jsx`): shows that user already has a booking and allows to cancel it

# Usage info

## Example Screenshot

![Example Image](https://github.com/polito-WA1-AH-2023-exam/exam-2-mtt-cc/blob/main/bookingexample.jpg?raw=true)

## Users Credentials

- matteo.cicilloni@polito.it, password
- laura.armando@polito.it, password
- testuser@polito.it, password
- mario.rossi@polito.it, password
