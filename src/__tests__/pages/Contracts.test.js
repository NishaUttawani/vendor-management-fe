import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import Contracts from '../../pages/Contracts';
import { _updateWorker } from '../../shared/api/workerApi';
import { _getWorkerContracts, _deleteWorkerContract } from '../../shared/api/workerContractApi';
import { _getContracts, _deleteContract, _updateContract, _addContract } from '../../shared/api/contractApi';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('../../shared/api/workerApi', () => ({
  _updateWorker: jest.fn(),
}));

jest.mock('../../shared/api/contractApi.js', () => ({
  _getContracts: jest.fn(),
  _updateContract: jest.fn(),
  _addContract: jest.fn(),
  _deleteContract: jest.fn(),
}));

jest.mock('../../shared/api/workerContractApi', () => ({
  _getWorkerContracts: jest.fn(),
  _deleteWorkerContract: jest.fn()
}));

jest.mock('../../shared/authContext', () => ({
  useAuth: () => ({
    user: {id:1}
  }),
}));


describe('Contracts', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders contracts list', async () => {
    const getContractsResponse = {
      data: {
        data: [
          {
            id: 'contract-1',
            attributes: {
              name: 'Contract 1',
              status: 'DRAFT',
            },
          },
          {
            id: 'contract-2',
            attributes: {
              name: 'Contract 2',
              status: 'ACTIVE',
            },
          },
        ],
      },
    }
    _getContracts.mockResolvedValue(getContractsResponse);

    const { getByText } = render(<Contracts />);
    await waitFor(() => {
      expect(getByText('Contract 1')).toBeInTheDocument();
      expect(getByText('DRAFT')).toBeInTheDocument();
      expect(getByText('Contract 2')).toBeInTheDocument();
      expect(getByText('ACTIVE')).toBeInTheDocument();
    });
  });

  it('displays add contract form', async () => {
    const getContractsResponse = {
      data: {
        data: []
      },
    }
    _getContracts.mockResolvedValue(getContractsResponse);
    const { getByText, getByLabelText } = render(<Contracts />);

    await act(async() => {
      fireEvent.click(getByText('Add Contract'));
    });

    await waitFor(() => {
      expect(getByLabelText('Name')).toBeInTheDocument();
      expect(getByLabelText('Status')).toBeInTheDocument();
      expect(getByText('Cancel')).toBeInTheDocument();
      expect(getByText('Add')).toBeInTheDocument();
    })
  });

  it('adds new contract', async () => {
    const getContractsResponse = {
      data: {
        data: []
      },
    }
    _getContracts.mockResolvedValue(getContractsResponse);
    _addContract.mockResolvedValue(() => Promise.resolve());
    uuidv4.mockReturnValue('7352175')

    const { getByText, getByLabelText } = render(<Contracts />);

    await act(async() => fireEvent.click(getByText('Add Contract')));

    fireEvent.change(getByLabelText('Name'), { target: { value: 'New Contract' } });
    fireEvent.change(getByLabelText('Status'), { target: { value: 'DRAFT' } });
    const addButton = getByText('Add');

    await act(async() => {
      fireEvent.click(addButton);
    })

    await waitFor(() => {
      expect(_addContract).toHaveBeenCalledWith({
        data: {
          name: 'New Contract',
          status: 'DRAFT',
          contractId: '7352175',
          ownerId: 1,
        }
      });
      expect(addButton).toBeDisabled();
    });
  });

  it('adds new contract | duplicate', async () => {

    const errorResponse = {
      response: {
        status: 400,
      },
    };

    const getContractsResponse = {
      data: {
        data: []
      },
    }
    _getContracts.mockResolvedValue(getContractsResponse);
    _addContract.mockRejectedValue(errorResponse);
    uuidv4.mockReturnValue('7352175');

    const { getByText, getByLabelText } = render(<Contracts />);

    await act(async() => fireEvent.click(getByText('Add Contract')));

    fireEvent.change(getByLabelText('Name'), { target: { value: 'New Contract' } });
    fireEvent.change(getByLabelText('Status'), { target: { value: 'DRAFT' } });
    const addButton = getByText('Add');

    await act(async() => {
      fireEvent.click(addButton);
    })

    await waitFor(() => {
      expect(_addContract).toHaveBeenCalledWith({
        data: {
          name: 'New Contract',
          status: 'DRAFT',
          contractId: '7352175',
          ownerId: 1,
        }
      });
      expect(getByText('Please check your data it seems to be duplicate')).toBeInTheDocument();
    });
  });

  it('adds new contract | error', async () => {

    const errorResponse = {
      response: {
        status: 500,
      },
    };

    const getContractsResponse = {
      data: {
        data: []
      },
    }
    _getContracts.mockResolvedValue(getContractsResponse);
    _addContract.mockRejectedValue(errorResponse);
    uuidv4.mockReturnValue('7352175');

    const { getByText, getByLabelText } = render(<Contracts />);

    await act(async() => fireEvent.click(getByText('Add Contract')));

    fireEvent.change(getByLabelText('Name'), { target: { value: 'New Contract' } });
    fireEvent.change(getByLabelText('Status'), { target: { value: 'DRAFT' } });
    const addButton = getByText('Add');

    await act(async() => {
      fireEvent.click(addButton);
    })

    await waitFor(() => {
      expect(_addContract).toHaveBeenCalledWith({
        data: {
          name: 'New Contract',
          status: 'DRAFT',
          contractId: '7352175',
          ownerId: 1,
        }
      });
      expect(getByText('Something went wrong!! Please try again.')).toBeInTheDocument();
    });
  });

  it('deletes contract', async () => {
    const getContractsResponse = {
      data: {
        data: [
          {
            id: '1',
            attributes: {
              name: 'Contract 1',
              status: 'DRAFT',
            },
          }
        ],
      },
    }
    _getContracts.mockResolvedValue(getContractsResponse);
    _getWorkerContracts.mockResolvedValue({data: {data: []}})
    _deleteContract.mockResolvedValue(true);

    const { getByText } = render(<Contracts />);
    await waitFor(async () => {
      const deleteButton = getByText('Delete');
      await act(async() => fireEvent.click(deleteButton));
    });

    await waitFor(() => {
      expect(_deleteContract).toHaveBeenCalledWith('1');
      expect(_updateWorker).not.toHaveBeenCalled();
      expect(_deleteWorkerContract).not.toHaveBeenCalled();
    })
  });

  it('update contract', async () => {
    const getContractsResponse = {
      data: {
        data: [
          {
            id: 'contract-1',
            attributes: {
              name: 'Contract 1',
              status: 'ACTIVE',
            },
          },
        ],
      },
    }
    _getContracts.mockResolvedValue(getContractsResponse);

    const { getByText } = render(<Contracts />);
    await waitFor(() => {
      fireEvent.click(getByText('ACTIVE'));
      fireEvent.click(getByText('INACTIVE'));
    });
    //expect updateContract to have been called
  })

})