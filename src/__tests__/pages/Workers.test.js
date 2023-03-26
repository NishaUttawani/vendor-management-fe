import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import Workers from '../../pages/Workers';
import { _addWorker, _getWorkers, _deleteWorker } from '../../shared/api/workerApi';
import { _getWorkerContracts } from '../../shared/api/workerContractApi';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.mock('../../shared/api/workerApi', () => ({
  _getWorkers: jest.fn(),
  _addWorker: jest.fn(),
  _deleteWorker: jest.fn()
}));

jest.mock('../../shared/api/workerContractApi', () => ({
  _getWorkerContracts: jest.fn(),
  _deleteWorkerContract: jest.fn()
}));

describe('Workers', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders workers list', async () => {
    const getWorkersResponse = {
      data: {
        data: [
          {
            id: '1',
            attributes: {
              username: 'worker1@example.com',
              firstName: 'firstName1',
              lastName: 'lastName1',
              allocation: true
            }
          },
          {
            id: '2',
            attributes: {
              username: 'worker2@example.com',
              firstName: 'firstName2',
              lastName: 'lastName2',
              allocation: false
            }
          }
        ]
      }
    }
    _getWorkers.mockResolvedValue(getWorkersResponse);

    const { getByText, getAllByText } = render(<Workers />);
    await waitFor(() => {
      expect(getByText('worker1@example.com')).toBeInTheDocument();
      expect(getByText('firstName1')).toBeInTheDocument();
      expect(getByText('lastName1')).toBeInTheDocument();
      expect(getByText(true)).toBeInTheDocument();
      expect(getByText('worker2@example.com')).toBeInTheDocument();
      expect(getByText('firstName2')).toBeInTheDocument();
      expect(getByText('lastName2')).toBeInTheDocument();
      expect(getByText(false)).toBeInTheDocument();
      expect(getAllByText('Delete Worker')[0]).toBeInTheDocument();
    });
  });

  it('displays add worker form', async () => {
    const getWorkersResponse = {
      data: {
        data: []
      }
    }
    _getWorkers.mockResolvedValue(getWorkersResponse);
    const { getByText, getByLabelText } = render(<Workers />);

    await act(async() => {
      fireEvent.click(getByText('Add Worker'));
    });

    await waitFor(() => {
      expect(getByLabelText('Email address')).toBeInTheDocument();
      expect(getByLabelText('First Name')).toBeInTheDocument();
      expect(getByLabelText('Last Name')).toBeInTheDocument();
      expect(getByText('Cancel')).toBeInTheDocument();
      expect(getByText('Add')).toBeInTheDocument();
    })
  });

  it('adds new worker', async () => {
    const getWorkersResponse = {
      data: {
        data: []
      }
    }
    _getWorkers.mockResolvedValue(getWorkersResponse);
    _addWorker.mockResolvedValue(() => Promise.resolve());
    uuidv4.mockReturnValue('7352175')

    const { getByText, getByLabelText } = render(<Workers />);

    await act(async() => fireEvent.click(getByText('Add Worker')));

    fireEvent.change(getByLabelText('Email address'), { target: { value: 'newworker@example.com' } });
    fireEvent.change(getByLabelText('First Name'), { target: { value: 'New' } });
    fireEvent.change(getByLabelText('Last Name'), { target: { value: 'Worker' } });
    const addButton = getByText('Add');

    await act(async() => {
      fireEvent.click(addButton);
    })

    await waitFor(() => {
      expect(_addWorker).toHaveBeenCalledWith({
        data: {
          username: 'newworker@example.com',
          firstName: 'New',
          lastName: 'Worker',
          role: 'WORKER',
          employeeId: '7352175'
        }
      });
      expect(addButton).toBeDisabled();
    });
  });

  it('adds new worker | duplicate', async () => {
    const getWorkersResponse = {
      data: {
        data: []
      }
    }

    const errorResponse = {
      response: {
        status: 400,
      },
    };

    _getWorkers.mockResolvedValue(getWorkersResponse);
    _addWorker.mockRejectedValue(errorResponse);
    uuidv4.mockReturnValue('7352175');

    const { getByText, getByLabelText } = render(<Workers />);

    await act(async() => fireEvent.click(getByText('Add Worker')));

    fireEvent.change(getByLabelText('Email address'), { target: { value: 'newworker@example.com' } });
    fireEvent.change(getByLabelText('First Name'), { target: { value: 'New' } });
    fireEvent.change(getByLabelText('Last Name'), { target: { value: 'Worker' } });
    const addButton = getByText('Add');

    await act(async() => {
      fireEvent.click(addButton);
    })

    await waitFor(() => {
      expect(_addWorker).toHaveBeenCalledWith({
        data: {
          username: 'newworker@example.com',
          firstName: 'New',
          lastName: 'Worker',
          role: 'WORKER',
          employeeId: '7352175'
        }
      });
      expect(getByText('Please check your data it seems to be duplicate')).toBeInTheDocument();
    });
  });

  it('adds new worker | error', async () => {
    const getWorkersResponse = {
      data: {
        data: []
      }
    }

    const errorResponse = {
      response: {
        status: 500,
      },
    };

    _getWorkers.mockResolvedValue(getWorkersResponse);
    _addWorker.mockRejectedValue(errorResponse);
    uuidv4.mockReturnValue('7352175');

    const { getByText, getByLabelText } = render(<Workers />);

    await act(async() => fireEvent.click(getByText('Add Worker')));

    fireEvent.change(getByLabelText('Email address'), { target: { value: 'newworker@example.com' } });
    fireEvent.change(getByLabelText('First Name'), { target: { value: 'New' } });
    fireEvent.change(getByLabelText('Last Name'), { target: { value: 'Worker' } });
    const addButton = getByText('Add');

    await act(async() => {
      fireEvent.click(addButton);
    })

    await waitFor(() => {
      expect(_addWorker).toHaveBeenCalledWith({
        data: {
          username: 'newworker@example.com',
          firstName: 'New',
          lastName: 'Worker',
          role: 'WORKER',
          employeeId: '7352175'
        }
      });
      expect(getByText('Something went wrong!! Please try again.')).toBeInTheDocument();
    });
  });

  it('deletes worker', async () => {
    const getWorkersResponse = {
      data: {
        data: [
          {
            id: '1',
            attributes: {
              username: 'worker1@example.com',
              firstName: 'firstName1',
              lastName: 'lastName1',
              allocation: true
            }
          }
        ]
      }
    }
    _getWorkers.mockResolvedValue(getWorkersResponse);
    _getWorkerContracts.mockResolvedValue({data: {data: []}})
    _deleteWorker.mockResolvedValue(true);

    const { getByText } = render(<Workers />);
    await waitFor(async () => {
      const deleteButton = getByText('Delete');
      await act(async() => fireEvent.click(deleteButton));
    });

    await waitFor(() => {
      expect(_deleteWorker).toHaveBeenCalledWith('1');
    })
  });
});
