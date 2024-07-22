// src/components/Header.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Navbar, Nav, Button, Container, Row, Col } from 'react-bootstrap';

const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await auth.signOut();
        navigate('/signin');
    };

    return (
        <>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href="/">Collaborative Note</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            {user ? (
                                <Button variant="outline-light" onClick={handleSignOut} className="btn-lg ms-2">Sign Out</Button>
                            ) : (
                                <>
                                    <Nav.Link as={Link} to="/register">
                                        <Button variant="warning" className="btn-lg ms-2">Register</Button>
                                    </Nav.Link>
                                    <Nav.Link as={Link} to="/signin">
                                        <Button variant="warning" className="btn-lg ms-2">Sign In</Button>
                                    </Nav.Link>
                                </>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mt-4">
                <Row className="justify-content-center">
                    <Col md={8}>
                        <div className="bg-secondary text-white p-4 rounded shadow-sm text-center">
                            <h1>Collaborative Notes</h1>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Header;
