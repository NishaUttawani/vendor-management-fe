import React from 'react';
import { useEffect, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import filterFactory, { textFilter } from 'react-bootstrap-table2-filter';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import cellEditFactory, { Type } from 'react-bootstrap-table2-editor';

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { getBaseUrl, getToken } from '../shared/common';
import { useAuth } from '../shared/authContext';

export default function Contracts() {
  const deleteButton = (cell, row, rowIndex, formatExtraData) => {
    return (
      <Button variant="outline-secondary"
        onClick={() => {
          deleteContract(row.id)
        }}
      >
        Delete
      </Button>
    );
  };

  const ContractStatus = {
    draft: { value: 'DRAFT', label: 'DRAFT' },
    approved: { value: 'APPROVED', label: 'APPROVED' },
    active: { value: 'ACTIVE', label: 'ACTIVE' },
    inactive: { value: 'INACTIVE', label: 'INACTIVE' }
  }

  const statusOptions = Object.values(ContractStatus);

  const initialState = {
    name: '',
    status: ContractStatus.draft
  }

  const columns = [{
    dataField: 'name',
    text: 'Name',
    sort: true,
    filter: textFilter(),
    editable: false
  }, {
    dataField: 'status',
    text: 'Status',
    sort: true,
    filter: textFilter(),
    editor: {
      type: Type.SELECT,
      options: statusOptions,
    },
  }, {
    dataField: 'id',
    text: 'Delete',
    formatter: deleteButton,
    editable: false
  }];

  const [contracts, setContracts] = useState([]);
  const [contract, setContractData] = useState(initialState);
  const [validated, setValidated] = useState();
  const [addingContract, setAddingContract] = useState(false);
  const [errorCode, setErrorCode] = useState();
  const [refreshKey, setRefreshKey] = useState(0);

  const auth = useAuth();

  const getContracts = () => {
    axios.get(`${getBaseUrl()}/service-contracts?filters[ownerId][id]=${auth.user?.id}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(response => setContracts(response.data.data.map(item => {
        return {
          ...item.attributes,
          id: item.id,
        }
      })))
      .catch(err => console.log(err))
  }

  const addContract = (e) => {
    e.preventDefault();
    axios.post(`${getBaseUrl()}/service-contracts`,
      {
        data: {
          name: contract.name,
          status: contract.status.value,
          contractId: uuidv4(),
          ownerId: auth.user.id,
        }
      },
      {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      .then(response => {
        setContractData(initialState);
        setValidated();
        setErrorCode();
        setRefreshKey(key => key +1);
      })
      .catch(err => {
        setErrorCode(err.response.status);
      });

  }

  const deleteContract = (id) => {
    axios.all([
      //delete workerContract
      deleteWorkerContract(id),

      //delete contract
      axios.delete(`${getBaseUrl()}/service-contracts/${id}`,{
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
    ]
    ).then(response => {
      setContracts(contracts => contracts.filter(item => item.id !== id))
      setRefreshKey(key => key +1); //TODO: Implement success toast
    }).catch(err => {
      console.log(err); //TODO: Implement failure tost
    });

  }

  const deleteWorkerContract = (contractId) => {
    axios.get(`${getBaseUrl()}/worker-service-contracts?populate=*&filters[serviceContractId]=${contractId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    })
      .then(response => {
        if(response.data.data.length > 0) {
          console.log(response);
          const serviceContractId = response.data.data[0].id;
          const workerId = response.data.data[0].attributes.workerId.data.id;
          axios.all([
            axios.delete(`${getBaseUrl()}/worker-service-contracts/${serviceContractId}`, {
              headers: { 'Authorization': `Bearer ${getToken()}` },
            }),
            axios.put(`${getBaseUrl()}/app-users/${workerId}`,
              {
                data: { allocation: false }
              },
              {
                headers: { 'Authorization': `Bearer ${getToken()}` },
              })
          ])
        }
      })
  }

  const updateContractStatus = (id, status) => {
    axios.put(`${getBaseUrl()}/service-contracts/${id}`,
      {
        data: {
          status
        }
      },
      {
        headers: { 'Authorization': `Bearer ${getToken()}` },
      })
      .then(response => {
        setRefreshKey(key => key +1);
      })
      .catch(err => {
        console.log(err); // TODO: Implement failure tost
      });
  }

  const handleChange = (e) => {
    if(e.target.name === 'name') {
      setContractData(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    } else {
      setContractData(prevState => {
        return {
          ...prevState,
          status: {label: e.target.value, value: e.target.value}
        }
      })
    }
  }

  const handleCancel = () => {
    setContractData(initialState);
    setAddingContract(false);
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
    getContracts();
  }, [refreshKey]);

  return (
    <>
      <h3>
        Contracts
      </h3>
      <Row>
        <Col lg={2}>
          <Button className='mb-4' variant="dark" disabled={addingContract} onClick={() => setAddingContract(true)}>Add Contract</Button>
        </Col>
      </Row>
      <Col>
        {addingContract && <Card className='worker-card'>
          <Card.Body>
            <Card.Title>Add New Contract</Card.Title>
            <Form noValidate validated={validated} onSubmit={addContract} onChange={checkValidity}>
              <Form.Group className="mb-3" controlId="formBasicName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter contract name"
                  value={contract.name}
                  name="name"
                  onChange={handleChange} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formBasicStatus">
                <Form.Label>Status</Form.Label>
                <Form.Select name="status" value={contract.status.label} onChange={handleChange}>
                  <option>{ContractStatus.draft.label}</option>
                  <option>{ContractStatus.approved.label}</option>
                  <option>{ContractStatus.active.label}</option>
                  <option>{ContractStatus.inactive.label}</option>
                </Form.Select>
              </Form.Group>
              <Row>
                <Col lg={2} className='mb-4'>
                  <Button variant="dark" disabled={!validated} type="submit">
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
          <h6>List of Contracts</h6>
        </Col>
      </Row>
      <BootstrapTable 
        keyField='id'
        data={contracts} 
        columns={columns}
        filter={filterFactory()}
        cellEdit={cellEditFactory({ 
          mode: 'click',
          afterSaveCell: (oldValue, newValue, row, column) => {updateContractStatus(row.id, row.status)}
        })}/>
    </>
  )
}
