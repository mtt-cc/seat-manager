import dayjs from 'dayjs';

const SERVER_URL = 'http://localhost:3000/api/';



/**
 * A utility function for parsing the HTTP response.
 */
function getJson(httpResponsePromise) {
  // server API always return JSON, in case of error the format is the following { error: <message> } 
  return new Promise((resolve, reject) => {
    httpResponsePromise
      .then((response) => {
        if (response.ok || response.status === 500) {

         // the server always returns a JSON, even empty {}. Never null or non json, otherwise the method will fail
         response.json()
            .then( json => resolve(json) )
            .catch( err => reject({ error: "Cannot parse server response" }))

        } else {
          // analyzing the cause of error
          response.json()
            .then(obj => 
              reject(obj)
              ) // error msg in the response body
            .catch(err => reject({ error: "Cannot parse server response" })) // something else
        }
      })
      .catch(err => 
        reject({ error: "Cannot communicate"  })
      ) // connection error
  });
}


const getPlanes = async () => {
  
  return getJson(
    fetch(SERVER_URL + 'planes', { credentials: 'include' })
  ).then( json => { return json});
}

const getPlaneById = async (planeId) => {
  
  return getJson(
    fetch(SERVER_URL + 'planes/' + planeId, { credentials: 'include' })
  ).then( json => { return json});
}

const getSeats = async (planeId) => {
  // remember to map objects into matrix
  return getJson(
    fetch(SERVER_URL + "seats/" + planeId, { credentials: 'include' })
  ).then( json => { return json });
}

const bookSeats = async (seats,planeId) => {
  const body = JSON.stringify(seats) ;
  // 
  return getJson(
    fetch(SERVER_URL + "seats/bookseats/"+planeId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body
    })
  )
}

const cancelBooking = async (planeId) => {
  /* const body = JSON.stringify(seats) ; */
  const body = JSON.stringify({"planeId": planeId}) ;

  return getJson(
    fetch(SERVER_URL + "seats/cancelbooking/"+planeId, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body
    })
  )
}



/**
 * This function wants username and password inside a "credentials" object.
 * It executes the log-in.
 */
const logIn = async (credentials) => {
  return getJson(fetch(SERVER_URL + 'sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',  // this parameter specifies that authentication cookie must be forwared
    body: JSON.stringify(credentials),
  })
  )
};

/**
 * This function is used to verify if the user is still logged-in.
 * It returns a JSON object with the user info.
 */
const getUserInfo = async () => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    // this parameter specifies that authentication cookie must be forwared
    credentials: 'include'
  })
  )
};

/**
 * This function destroy the current user's session and execute the log-out.
 */
const logOut = async() => {
  return getJson(fetch(SERVER_URL + 'sessions/current', {
    method: 'DELETE',
    credentials: 'include'  // this parameter specifies that authentication cookie must be forwared
  })
  )
}

const API = {logIn, getUserInfo, logOut, getPlanes, getPlaneById, getSeats, bookSeats, cancelBooking};
export default API;
