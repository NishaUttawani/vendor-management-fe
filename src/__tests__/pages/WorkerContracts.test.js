import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkerContracts from '../../../src/pages/WorkerContracts';

describe('WorkerContracts', () => {
  test('renders without errors', () => {
    render(<WorkerContracts />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('displays worker contracts correctly', async () => {
    // mock API calls
    const mockGetWorkerContracts = jest.fn(() => ({
      data: {
        data: [
          {
            attributes: {
              workerId: { data: { attributes: { username: 'worker1' } }, id: 1 },
              serviceContractId: { data: { attributes: { name: 'contract1' } }, id: 1 },
            },
            id: 1,
          },
        ],
      },
    }));
    const mockGetContracts = jest.fn(() => ({
      data: {
        data: [
          {
            attributes: { name: 'contract2' },
            id: 2,
          },
        ],
      },
    }));
    const mockGetWorkers = jest.fn(() => ({
      data: {
        data: [
          {
            attributes: { username: 'worker2' },
            id: 2,
          },
        ],
      },
    }));
    jest.mock('../shared/api/workerContractApi', () => ({
      _getWorkerContracts: mockGetWorkerContracts,
      _addWorkerContract: jest.fn(),
      _deleteWorkerContract: jest.fn(),
    }));
    jest.mock('../shared/api/contractApi', () => ({ _getContracts: mockGetContracts }));
    jest.mock('../shared/api/workerApi', () => ({ _getWorkers: mockGetWorkers }));

    render(<WorkerContracts />);

    // wait for table to load
    await waitFor(() => expect(screen.getByText('Contract Name')).toBeInTheDocument());

    // check table content
    expect(screen.getByText('contract1')).toBeInTheDocument();
    expect(screen.getByText('worker1')).toBeInTheDocument();

    // check filters
    userEvent.type(screen.getByPlaceholderText('Search'), '2');
    expect(screen.queryByText('contract1')).not.toBeInTheDocument();
    expect(screen.queryByText('worker1')).not.toBeInTheDocument();
    expect(screen.getByText('contract2')).toBeInTheDocument();
    expect(screen.getByText('worker2')).toBeInTheDocument();
  });

})