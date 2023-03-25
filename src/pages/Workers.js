import React from 'react';
import { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';

import { v4 as uuidv4 } from 'uuid';
import { _addWorker, _deleteWorker, _getWorkers } from '../shared/api/workerApi';
import { _deleteWorkerContract, _getWorkerContracts } from '../shared/api/workerContractApi';

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
    },{
      dataField: 'allocation',
      text: 'Allocated',
      sort: true,
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


  const getWorkers = async () => {
    try{
      const workers = await _getWorkers('filters[role][$eq]=WORKER');
      setWorkers(workers.data.data.map(item => {
        return {
          ...item.attributes,
          id: item.id,
        }
      }));
    } catch (err) {
      console.log({
        message: 'get workers failed!!',
        err
      })
    }
  }

  const addWorker = async (e) => {
    e.preventDefault();
    const payload = {
      data: {
        ...worker,
        employeeId: uuidv4(),
        role: 'WORKER'
      }
    };
    try {
      await _addWorker(payload);
      setWorkerData(initialState);
      setValidated();
      setErrorCode();
      setRefreshKey(key => key +1);

    } catch(err) {
      setErrorCode(err.response.status);
    }
  }

  const deleteWorker = async (id) => {
    try {
      //get Worker Contracts
      const response = await _getWorkerContracts(`filters[workerId]=${id}`);
      if(response.data?.data?.length > 0) {
        //delete worker contract
        const serviceContractId = response.data.data[0].id;
        await _deleteWorkerContract(serviceContractId);
      }

      //delete worker
      await _deleteWorker(id);

      setWorkers(workers => workers.filter(item => item.id !== id));
      setRefreshKey(key => key); //TODO: implement success toast
    } catch(err) {
      console.log({
        message: 'error deleting worker!!!',
        err
      })
    }
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
