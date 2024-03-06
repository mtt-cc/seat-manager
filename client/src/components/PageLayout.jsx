import { React, useContext, useState, useEffect } from 'react';
import { Row, Col, Button, Spinner, Container,Card } from 'react-bootstrap';
import { Link, useParams, useLocation, Outlet } from 'react-router-dom';

import MessageContext from '../messageCtx';
import API from '../API';
import { LoginForm } from './Auth';
import {PlanesList, SeatAvailability, SeatGrid} from './PlanesLibrary';
import { mapObjectsToArrays } from './MapLibrary';
import './custom.css'
import { BookingForm, Booking } from './BookingForm';


function DefaultLayout(props) {

  const location = useLocation();

  return (
    <Row className="vh-100">
      <Col className="below-nav">
{/*         <Container>
          
        </Container> */}
        <Outlet/>
      </Col>
    </Row>

    
  );
}

function MainLayout(props) {

  const dirty = props.dirty;
  const {handleErrors} = useContext(MessageContext);

  const planes = props.planes;

  return (
    <Container >
      <Row>
        <Col className="d-flex justify-content-center">
          <h1 className="pb-3">Planes:</h1> 
        </Col>
        
      </Row>
      <Row>
        <Col >
          <Container >
          { dirty ?
          <>
            <Container className="d-flex justify-content-center">
              <Button variant="primary" disabled >
                <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
               Loading...
              </Button>
            </Container>
          </>
          : <PlanesList planes={planes}/>}
          </Container>
        
        </Col>
      </Row>
    </Container>
  )
}

function SeatsLayout (props){
  const [seats, setSeats] = useState([]);
  /* const [mappedSeats, setMappedSeats] = useState([]); */
  const [loading, setLoading] = useState(true);
  const [availableSeats,setAvailableSeats] = useState(0);
  const [occupiedSeats, setOccupiedSeats] = useState(0);
  const [totalSeats, setTotalSeats] = useState(0);
  const [numRequestedSeats ,setNumRequestedSeats] = useState(0)
  const [assignedSeats, setAssignedSeats] = useState([]);
  const [user, setUser] = useState(props.user);
  const [hasBookedSeats,setHasBookedSeats] = useState(false);
  // to disable user action after requesting, booking and canceling
  const [requesting, setRequesting] = useState(false);
  const [booking, setBooking] = useState(false);
  const [failedBooking, setFailedBooking] = useState(false);
  const [autoAssignMode, setAutoAssignMode] = useState(false);
  const [canceling, setCanceling] = useState(false);
  
  // const dirty = props.dirty;
  // const setDirty = props.setDirty;
  // const location = useLocation();

  const {handleErrors} = useContext(MessageContext);

  const planeId = parseInt(useParams().planeId);
  const plane = [...props.planes].filter(p => p.planeId === planeId);
  const loggedIn = props.loggedIn;


  // useEffect(() => {
  // setDirty(true);
  // }, [planeId])

  // useEffect(() => {
  //   if (true) {
  //     API.getPlaneById(planeId)
  //     .then(plane => {
  //       API.getSeats(planeId, plane[0].columns)
  //       .then(seats => {
  //         props.setSeats(seats);
  //         setDirty(false);
  //       })
  //       .catch(e => { 
  //         handleErrors(e); setDirty(false); 
  //       } );
  //     })
       
  //   }
  // }, []);
 
  /* counts available, requested, occupied and total seats */
  function countSeats(seats){
    const total = seats.length;
    const occupied = [...seats].filter(s => s.status === 'occupied' || s.status === 'alredyBooked').length;
    const requested = [...seats].filter(s => s.status === 'requested').length;
    const free = total - occupied - requested;
    setOccupiedSeats(occupied);
    setNumRequestedSeats(requested);
    setAvailableSeats(free);
    setTotalSeats(total);
  }

  /* sets in assignedSeats the list of seat ids of the assigned seats */
  function assignRandomSeats(numSeats) {
    const assignedSeats = [];
    
    const newSeats = [...seats].map(s => {
      if(s.status === 'available' && assignedSeats.length < numSeats){
        assignedSeats.push(
          {
            seatId: s.seatId,
            status: 'occupied'            
          });
        s.status = 'requested';
      }
      return s;
    })
    setAssignedSeats(assignedSeats);
    setSeats(newSeats);
    countSeats(newSeats);
    setAutoAssignMode(true);
  }

  /* cancels seat selection */
  function cancelRequest(){

    const newSeats = [...seats].map(s => {
      if(s.status === 'requested'){
        s.status = 'available';
      }
      return s;
    })
    setAssignedSeats([]);
    setAutoAssignMode(false);
    countSeats(newSeats);
  }

  /* confirms booking after seat selection */
  async function confirmBooking(){
    try {
      setBooking(true);
      let newSeats = await API.bookSeats(assignedSeats, planeId);
      // means requested seats were alredy booked
      if(newSeats==='successfuly booked seat'){
        newSeats = await API.getSeats(planeId);
        setBooking(false);
      } else {
        setFailedBooking(true);
         /* set alreadyBooked status to occupied */
        setTimeout(function() {
          // Code to be executed after 5 seconds
          const res = newSeats.map(s => {
            if(s.status === 'alreadyBooked'){
              s.status = 'occupied';
            }
            setBooking(false);
            setFailedBooking(false);
            return s;
          });
          setSeats(res);
        }, 5000);}
      
      setSeats(newSeats);
      countSeats(newSeats);
      setHasBookedSeats(hasBooked(newSeats));
      /* reset requested seats, equivalent to cancel booking */
      setRequesting(false);
      
      setAssignedSeats([]);
      setAutoAssignMode(false);
    } catch (e) {
      
      setBooking(false);
    }
  }

  /* to check if user has a booking */
  function hasBooked(seats){
    const hasBooked = [...seats].find(s => s.userId === user.id);
    if(hasBooked)
      return true;
    return false;
  }

  function cancelBooking(){
    setCanceling(true);

    API.cancelBooking(planeId)
    .then(() => API.getSeats(planeId))// after cancelling booking update seats
    .then(newseats => {
      // 
      // const mappedSeats = mapObjectsToArrays(newseats, plane[0].columns)
      setSeats(newseats);
      countSeats(newseats);
      setHasBookedSeats(false); // after cancelling user does not have booked seats
      setCanceling(false);
    })
    .catch(e => {
      
      setCanceling(false);
    
    });
  }

  // Function to implement manual seat request
  // seatId passed by child component onClick
  function manualRequest(seat){
    const newAssignedSeats = assignedSeats;
    const newSeats = [...seats].map(s => {
      // find corresponding seat
      if(s.seatId === seat.seatId){
        // if available add to requested seats and set status to requested
        if(s.status === 'available'){
          newAssignedSeats.push(
            {
              seatId: s.seatId,
              status: 'occupied'            
            });
          s.status = 'requested';
          return s;
        } else {
          // if it were requested, set to available and remove from assigned seats
          s.status = 'available';
          const index = newAssignedSeats.findIndex(s => s.seatId === seat.seatId);
          if (index !== -1) {
            newAssignedSeats.splice(index, 1);
          }
          return s;
        }
      }
      return s;
     
    });
    newAssignedSeats.length !== 0 ? setRequesting(true) : setRequesting(false) ;
    setAssignedSeats(newAssignedSeats);
    setSeats(newSeats);
    countSeats(newSeats);
  }


  /* Fetch seats */
  useEffect(() => {
     
        API.getSeats(planeId)
        .then((seats) => {
          countSeats(seats);

          setSeats(seats);
          setHasBookedSeats(hasBooked(seats));
          setLoading(false);
        })
        .catch(e => { 
          handleErrors(e); 
          setLoading(false);
        } );
      
  }, [planeId]);


  return (
    <>
        <Row className="d-flex justify-content-center"> 
          <Col className="justify-content-center">
            { loading  ?
            <>
            <Container className="d-flex justify-content-center">
              <Button variant="primary" disabled >
                <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true"/>
               Loading...
              </Button>
            </Container>
            </>
            : <>
            <Row>
             <Col md={8} className="d-flex justify-content-center">
              <p>These are the seats available for plane {planeId}</p>
             </Col>
            </Row>
              {/* SEAT VISUALIZATION */}
            <Row>
              <Col md={8}>
                <Container className='w-75'>
                  <SeatAvailability seatsNumber={{availableSeats,occupiedSeats,totalSeats,numRequestedSeats}}/>
                  <br/>
                  <SeatGrid seats={mapObjectsToArrays(seats, plane[0].columns)} 
                  manualRequest={manualRequest} autoAssignMode={autoAssignMode} hasBookedSeats={hasBookedSeats} failedBooking={failedBooking}/> 
                </Container>
              </Col> 
              {/* RIGHT COLUMN */}
              <Col md={4} className="d-flex justify-content-center" >
              { hasBookedSeats ?
              <Container>
                <Booking cancelBooking={cancelBooking} canceling={canceling} setCanceling={setCanceling} />
              </Container> :
              <>
              <Container>
              <Row><Col><BookingForm loggedIn={loggedIn} availableSeats={availableSeats}
                requesting={requesting} setRequesting={setRequesting} booking={booking}
                assignRandomSeats={assignRandomSeats} cancelRequest={cancelRequest}
                setAutoAssignMode={setAutoAssignMode}
                confirmBooking={confirmBooking}/></Col></Row>

              {failedBooking && 
                <Row>
                  <Col>
                  <Card bg={'dark'} text='white'>
                    <Card.Body>
                      <Card.Text>
                      Booking failed, requested seats where booked in the meantime and are now highlighted in black for the next 5 seconds
                      </Card.Text>
                    </Card.Body>
                  </Card>

                  </Col>
                </Row> 
              }
              </Container>
              </>
              }
              </Col>
            </Row>
            
            </>}
          </Col>
        </Row>

     
      {/* to create some space at the end of the page */}
      <Container fluid className="d-flex flex-column vh-50"></Container>
    </>
  )
  
}


function NotFoundLayout() {
    return(
        <>
          <h2>This is not the route you are looking for!</h2>
          <Link to="/">
            <Button variant="primary">Go Home!</Button>
          </Link>
        </>
    );
  }

/**
 * This layout should be rendered while we are waiting a response from the server.
 */
function LoadingLayout(props) {
  return (
    <Row className="vh-100">

      <Col className="below-nav d-flex justify-content-center">
        <h1>✈Loading ...</h1>
      </Col>
    </Row>
  )
}

function LoginLayout(props) {
  return (
    <Row className="vh-100">
      <Col md={12} className="below-nav">
        <LoginForm login={props.login} />
      </Col>
    </Row>
  );
}

export { DefaultLayout, SeatsLayout, NotFoundLayout, MainLayout, LoadingLayout, LoginLayout }; 
