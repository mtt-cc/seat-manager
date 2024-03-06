import { useState } from "react";
import { Container, Badge, Card, Button, Form, Col, Row, Spinner} from "react-bootstrap";


const BookingForm = (props) => {

  const [numRequestedSeats, setNumRequestedSeats] = useState(1);
  const loggedIn = props.loggedIn;
  const [maxAvailable, setMax] = useState(props.availableSeats);
  /* to make buttons to confirm booking or cancel visible */
  const requesting = props.requesting;
  const setRequesting = props.setRequesting;
  const booking = props.booking;

  const handleSubmit = (event) => {
    event.preventDefault();
    props.assignRandomSeats(numRequestedSeats);
    setRequesting(true);
  };

  const handleCancel = () => {
    event.preventDefault();
    props.cancelRequest();
    setRequesting(false);
    
  }

  const handleConfirm = () => {
    props.confirmBooking();    
  }

  return(
    <>
    {!loggedIn ?
    <Container >
        <Card bg={'primary'} text='light' className="text-center">
          <Card.Body>
              <Card.Title> To book your seat please login </Card.Title>
          </Card.Body>
        </Card>
    </Container> :
    <>
      <RandomForm requestedSeats={numRequestedSeats} setRequestedSeats={setNumRequestedSeats}
       maxAvailable={maxAvailable} handleSubmit={handleSubmit} requesting={requesting}/>
      <br/>
      {requesting?
      <Container>
        <Row>
          <Col >
            <Container className="d-flex justify-content-center">
            <Button variant={'success'} disabled={booking?true:false} onClick={() => {handleConfirm()}}>
              {booking?
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Booking...
              </>
              :
              <> Confirm Booking</>
              }
              
            </Button>
            <Button variant={'secondary'} disabled={booking?true:false} onClick={() => {handleCancel()}}>Cancel</Button>
            </Container>
         </Col>
        </Row>
      </Container> :
      <></>
      }
    </> 
    }
    
    </>
  )
}

const RandomForm = (props) => {

  const requestedSeats = props.requestedSeats;
  const maxAvailable = props.maxAvailable;
  const handleSubmit = props.handleSubmit;
  const requesting = props.requesting;


  return (
    <>
    <Card className="text-center" border="primary" text={'white'}>
      
      <Card.Header className="bg-primary">
        Auto-assign seats
      </Card.Header>
      
      <Card.Body >
        <Card.Text>
          <span className="text-dark">
            Insert the number of seats you want to request, then click the button below
          </span>
        </Card.Text>
        
        <Form onSubmit={handleSubmit}>
        <Form.Group >
          <Form.Control type="number" min={1} max={maxAvailable} step={1} value={requestedSeats} 
          className="text-center" 
          disabled={requesting ? true : false}
          onChange={event => props.setRequestedSeats(
            () => {
              // if input is greater than max available seats sets back to max
              const val = parseInt(event.target.value);
              if(val > maxAvailable)
                return maxAvailable
              return val
            })}/>
        </Form.Group>
        <br/>
        <Button variant={'warning'} type="submit" disabled={requesting ? true : false}>Assign seats</Button>
        </Form>
      </Card.Body>
    </Card>
    </>
  )
}

const Booking = (props) => {
  const bookedSeats = props.bookedSeats;
  const cancelBooking = props.cancelBooking;
  const canceling = props.canceling;// used to disable cancel button
  const setCanceling = props.setCanceling;

  return(
    <Card className="text-center">
    <Card.Body>
      <Card.Text>
        <p>User has booked seats</p>
        <Button variant="danger" disabled={canceling ? true : false} onClick={() => {cancelBooking()}}>
        {canceling?
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Canceling Booking...
              </>
              :
              <> Cancel Booking</>
              }
        </Button>
      </Card.Text>
    </Card.Body>
  </Card>
  )
}

export {BookingForm, Booking};