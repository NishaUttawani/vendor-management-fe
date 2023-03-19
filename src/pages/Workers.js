import React from 'react';
import { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getBaseUrl, getToken } from '../shared/common';

export default function Workers() {
  const deleteButton = (cell, row, rowIndex, formatExtraData) => {
    return (
      <Button variant="outline-secondary"
        onClick={() => {
          deleteWorker(row.id)
        }}
      >
        Delete
      </Button>
    );
  };

  const initialState = {
    username: '',
    firstName: '',
    lastName: ''
  }


  const columns = [
    {
      dataField: 'username',
      text: 'Email Address',
      sort: true,
      filter: textFilter()
    }, {
      dataField: 'firstName',
      text: 'First Name',
      sort: true,
      filter: textFilter()

    }, {
      dataField: 'lastName',
      text: 'Last Price',
      sort: true,
      filter: textFilter()
    }, {
      dataField: 'id',
      text: 'Delete',
      formatter: deleteButton,
    }
  ];
  
  const [workers, setWorkers] = useState([]);
  const [worker, setWorkerData] = useState(initialState);
  const [validated, setValidated] = useState();
  const [addingWorker, setAddingWorker] = useState(false);
  const [errorCode, setErrorCode] = useState();
  const [refreshKey, setRefreshKey] = useState(0);


  const getWorkers = () => {
    axios.get(`${getBaseUrl()}/app-users?filters[role][$eq]=WORKER`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(response => setWorkers(response.data.data.map(item => {
        return {
          ...item.attributes,
          id: item.id,
        }
      })))
      .catch(err => console.log(err))
  }

  const addWorker = (e) => {
    e.preventDefault();
    axios.post(`${getBaseUrl()}/app-users`,
      {
        data: {
          ...worker,
          employeeId: uuidv4(),
          role: 'WORKER'
        }
      },
      {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      .then(response => {
        setWorkerData(initialState);
        setValidated();
        setRefreshKey(key => key +1);
      })
      .catch(err => {
        setErrorCode(err.response.status);
      });

  }

  const deleteWorker = (id) => {
    axios.delete(`${getBaseUrl()}/app-users/${id}`,
      {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      .then(response => {
        setWorkers(workers => workers.filter(item => item.id !== id));
        setRefreshKey(key => key); //TODO: implement success toast
      })
      .catch(err => {
        console.log(err); //TODO: Implement failure tost
      });
  } 

  const handleChange = (e) => {
    setWorkerData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
  }

  const handleCancel = () => {
    setWorkerData(initialState);
    setAddingWorker(false);
    setErrorCode();
    setValidated();
  }

  const checkValidity = (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(false);
      e.preventDefault();
      e.stopPropagation();
    } else {
      setValidated(true);
    }
  }

  useEffect(() => {
    getWorkers();
  }, [refreshKey])

  return (
    <>
      <h3>
        Workers
      </h3>
      <Row>
        <Col lg={2}>
          <Button  className='mb-4' variant='dark' disabled={addingWorker} onClick={() => setAddingWorker(true)}>Add Worker</Button>
        </Col>
      </Row>
      <Col>
        {addingWorker && <Card className='worker-card'>
          <Card.Body>
            <Card.Title>Add New Worker</Card.Title>
            <Form noValidate validated={validated} onSubmit={addWorker} onChange={checkValidity}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter email"
                  value={worker.username}
                  name="username"
                  onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter first name"
                  value={worker.firstName}
                  name="firstName"
                  onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter last name"
                  value={worker.lastName}
                  name="lastName"
                  onChange={handleChange} />
              </Form.Group>
              <Row>
                <Col lg={2}>
                  <Button className='mb-4' disabled={!validated} variant="dark" type="submit">
                    Add
                  </Button>
                </Col>
                <Col lg={2}>
                  <Button variant="outline-danger" onClick={handleCancel}>Cancel</Button>{' '}
                </Col>
              </Row>
            </Form>
            {errorCode && errorCode === 400 &&
              <p className='error'>Please check your data it seems to be duplicate</p>
            }
            {errorCode && errorCode !== 400 &&
              <p className='error'>Something went wrong!!. Please try again. </p>
            }
          </Card.Body>
        </Card>}
      </Col>
      <Row>
        <Col lg={10}>
          <h6>List of Workers</h6>
        </Col>
      </Row>
      <BootstrapTable keyField='employeeId' data={workers} columns={columns} filter={filterFactory()} />
    </>
  )
}
