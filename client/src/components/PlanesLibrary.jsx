import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Row, Col, CardGroup } from 'react-bootstrap';


function PlanesList (props) {

    const planes = props.planes;
    
    if(planes.length === 0)
        return<p>There are non planes available</p>
    else
        return (
           planes.map(plane => 
            <Row key={'plane '+plane.planeId}>
                <Col className="d-flex justify-content-center">
                    <PlaneRow  planeData={plane}/>
                </Col> 
            </Row>
                
                )
        )
}

function PlaneRow (props) {

    const plane = props.planeData;
    const url = "/booking/" + plane.planeId;

    return (
        <Card style={{ width: '18rem' }} className="text-center">
        <Card.Body>
            <Card.Title>Plane {plane.planeId} - { plane.type.charAt(0).toUpperCase() + plane.type.slice(1) }</Card.Title>
            <Link to={url}>
                <Button variant="primary">Book a seat</Button>
            </Link>
        </Card.Body>
        </Card>
    );
      
}

function SeatGrid (props){
    /* const [seats, setSeats] = useState(props.seats); */
    const seats = props.seats;
    const manualRequest = props.manualRequest;
    const autoAssignMode = props.autoAssignMode;
    const hasBookedSeats = props.hasBookedSeats;
    const failedBooking = props.failedBooking;

    return(
        seats.map((row, i) => {
            return(
                <Row className='g-0' key={'row '+i}>
                    <SeatRow seatrow={row} manualRequest={manualRequest} 
                    autoAssignMode={autoAssignMode} hasBookedSeats={hasBookedSeats}
                    failedBooking={failedBooking}/>
                </Row>
            )
        })
    );
}

/* used in seat row to set color of seat according to status */
const seatColor = {
    occupied: "danger",
    available: "light",
    requested: "warning",
    alreadyBooked: "dark"
}

function SeatRow (props){
    const row = props.seatrow;
    const manualRequest = props.manualRequest;
    const autoAssignMode = props.autoAssignMode;
    const hasBookedSeats = props.hasBookedSeats;
    const failedBooking = props.failedBooking;

    return(
        row.map(seat => {
            return(
                <Col key={'seat '+seat.seatId}>
                {/* if seat is occupied red seat, otherwise white */}
                <div className="d-grid gap-2"  key={'seat '+seat.seatId}>
                    <Button size="lg"
                    variant={seatColor[seat.status]}
                    disabled={seat.status === 'occupied' || failedBooking ? true : false}
                    onClick={autoAssignMode || hasBookedSeats ? () => {} : ()=>manualRequest(seat)}
                    >
                        {seat.row}{seat.position}

                    </Button>
                </div>
                </Col>
            )
            
        })
    );
}

function SeatAvailability(props){

    const {availableSeats, occupiedSeats, totalSeats, numRequestedSeats} = props.seatsNumber;
    return(<>
        <CardGroup>
        
        <Card bg={'light'} key={'available'} className="text-center">

        <Card.Body>
            <Card.Title> Available: {availableSeats} </Card.Title>
            </Card.Body>
        </Card>
        
        <Card bg={'warning'} key={'requested'} className="text-center">

        <Card.Body>
            <Card.Title> Requested: {numRequestedSeats} </Card.Title>
            </Card.Body>
        </Card>
                
        <Card bg={'danger'} key={'occupied'} text='light' className="text-center">

            <Card.Body>
                <Card.Title>Occupied: {occupiedSeats} </Card.Title>
                </Card.Body>
            </Card>
        

        <Card bg={'primary'} key={'total'} text='light' className="text-center">

            <Card.Body>
                <Card.Title> Total: {totalSeats} </Card.Title>
            </Card.Body>
            </Card>
        </CardGroup>
    </>)
}

export {PlanesList, SeatGrid, SeatAvailability};
