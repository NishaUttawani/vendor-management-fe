import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import AsyncSelect from 'react-select/async';

import axios from 'axios';
import { getBaseUrl, getToken } from '../shared/common';
import { debounce } from '../shared/utility';
import { useAuth } from '../shared/authContext';


export default function WorkerContracts() {
  const deleteButton = (cell, row, rowIndex, formatExtraData) => {
    return (
      <Button variant="outline-secondary"
        onClick={() => {
          deleteWorkerContract(row)
        }}
      >
        Delete
      </Button>
    );
  };

  const initialState = {
    workerId: null,
    serviceContractId: null,
  }


  const columns = [
    {
      dataField: 'name',
      text: 'Contract Name',
      sort: true,
      filter: textFilter()
    }, {
      dataField: 'username',
      text: 'Worker Email Address',
      sort: true,
      filter: textFilter()

    }, {
      dataField: 'id',
      text: 'Delete',
      formatter: deleteButton,
    }
  ];

  const [workerContracts, setWorkerContracts] = useState([]);
  const [workerContract, setWorkerContractData] = useState(initialState);
  const [validated, setValidated] = useState();
  const [adding, setAdding] = useState(false);
  const [errorCode, setErrorCode] = useState();
  const [refreshKey, setRefreshKey] = useState(0);

  const auth = useAuth();

  const getWokerContracts = () => {
    axios.get(`${getBaseUrl()}/worker-service-contracts?populate=*`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(response => {
        setWorkerContracts(response.data.data.map(item => {
          return {
            username: item.attributes.workerId.data?.attributes?.username,
            workerId: item.attributes.workerId.data?.id,
            name: item.attributes.serviceContractId.data?.attributes?.name,
            serviceContractId: item.attributes.serviceContractId.data?.id,
            id: item.id,
          }
        }))
      })
      .catch(err => console.log(err))
  }

  const getWorkers = (inputValue, callback) => {
    if (inputValue.length === 0) { callback([]) }
    else {
      axios.get(`${getBaseUrl()}/app-users?filters[role][$eq]=WORKER&filters[allocation][$eq]=false&filters[username][$contains]=${inputValue}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
        .then(response => {
          callback(response.data.data.map(item => {
            return {
              label: item.attributes.username,
              value: item.id,
            }
          }))
        })
        .catch(err => console.log(err))
    }
  }

  const getContracts = (inputValue, callback) => {
    const mappedServiceContracts = workerContracts.map(item => item.serviceContractId);
    let idFilter = '';
    mappedServiceContracts.forEach((id, index) => {
      idFilter = idFilter + `filters[id][$notIn][${index}]=` + id + '&';
    });

    if (inputValue.length === 0) { callback([]) } 
    else {
      axios.get(`${getBaseUrl()}/service-contracts?filters[ownerId][id][$eq]=${auth.user?.id}&filters[status][$eq]=ACTIVE&${idFilter}filters[name][$contains]=${inputValue}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
        .then(response => {
          callback(response.data.data.map(item => {
            return {
              label: item.attributes.name,
              value: item.id,
            }
          }))
        })
        .catch(err => console.log(err))
    }
  }

  const updateWorker = (id, allocation) => {
    axios.put(`${getBaseUrl()}/app-users/${id}`,
      {
        data: {
          allocation,
        }
      },
      {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
  }

  const addWorkerContract = (e) => {
    e.preventDefault();
    axios.all([
      axios.post(`${getBaseUrl()}/worker-service-contracts`,
        {
          data: {
            serviceContractId: workerContract.serviceContractId?.value,
            workerId: workerContract.workerId?.value
          }
        },
        {
          headers: { 'Authorization': `Bearer ${getToken()}` },
        }),
      updateWorker(workerContract.workerId.value, true)
    ]).then(response => {
      setWorkerContractData(initialState);
      setValidated();
      setRefreshKey(key => key +1 );
    }).catch(err => {
      setErrorCode(err.response.status);
    })
  }

  const deleteWorkerContract = (row) => {
    axios.all([
      axios.delete(`${getBaseUrl()}/worker-service-contracts/${row.id}`,
        {
          headers: { 'Authorization': `Bearer ${getToken()}` },
        }),
      updateWorker(row.workerId, false)
    ]
    ).then(response => {
      setWorkerContracts(workers => workers.filter(item => item.id !== row.id));
      setRefreshKey(key => key +1); //TODO: implement success toast
    })
  }

  const handleCancel = () => {
    setWorkerContractData(initialState);
    setAdding(false);
    setErrorCode();
    setValidated();
  }

  const handleContractChange = (e) => {
    setWorkerContractData(data => ({...data, serviceContractId: {value: e.value, label: e.label} }))
  }

  const handleWorkerChange = (e) => {
    setWorkerContractData(data => ({...data, workerId: {value: e.value, label: e.label}}))
  }

  const checkValidity = (e) => {
    const form = e.currentTarget;
    console.log(workerContract)
    if (form.checkValidity() === false) {
      setValidated(false);
      e.preventDefault();
      e.stopPropagation();
    } else {
      setValidated(true);
    }
  }

  const loadContracts = useCallback(debounce(getContracts, 1000), [workerContracts]);
  const loadWorkers = useCallback(debounce(getWorkers, 1000), []);

  useEffect(() => {
    getWokerContracts();
  }, [refreshKey])

  return (
    <>
      <h3>
        Worker Contracts
      </h3>
      <Row>
        <Col lg={2}>
          <Button className='mb-4' variant='dark' disabled={adding} onClick={() => setAdding(true)}>Add New</Button>
        </Col>
      </Row>
      <Col>
        {adding && <Card className='worker-card'>
          <Card.Body>
            <Card.Title>Add New Worker Contract</Card.Title>
            <Form noValidate validated={validated} onSubmit={addWorkerContract} onChange={checkValidity}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Contract Name</Form.Label>
                <AsyncSelect value={workerContract.serviceContractId} loadOptions={loadContracts} name="checkname" onChange={handleContractChange} defaultOptions />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicStatus">
                <Form.Label>Worker Email Address</Form.Label>
                <AsyncSelect value={workerContract.workerId} loadOptions={loadWorkers} onChange={handleWorkerChange} defaultOptions />
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
          <h6>List of Worker Contract</h6>
        </Col>
      </Row>
      <BootstrapTable keyField='employeeId' data={workerContracts} columns={columns} filter={filterFactory()} />
    </>
  )
}



/**
 * TODO
 * 1. Duplicate Contracts should not be allowed to add again - DONE
 * 2. Edit Contract status - DONE
 * 3. Error Boundary - DONE
 * 4. Route Gaurd - DONE
 * 5. Logout - DONE
 * 6. Delete cascade COntract relation on deletion of contract and worker -> strapi
 * 7. Form validation for react select
 */