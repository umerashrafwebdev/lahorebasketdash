'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardBody, Form, Button } from 'react-bootstrap';
import { useTable, usePagination, useSortBy } from 'react-table';

const CustomersList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers from the API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get('https://api.g3studio.co/api/customers', {
          headers: {
            'Content-Type': 'application/json',
          },
          // Uncomment if authentication is required
          // withCredentials: true,
        });

        console.log('Fetched Customers:', response.data);
        setCustomers(response.data.customers || response.data); // Fallback if 'customers' key isn’t present
        setLoading(false);
      } catch (err) {
        console.error('Error fetching customers:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError('Failed to load customers. Please try again.');
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Define columns for react-table
  const columns = React.useMemo(
    () => [
      { Header: 'ID', accessor: 'id' },
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Email',
        accessor: 'email',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Phone',
        accessor: 'phone',
        Cell: ({ value }) => value || 'N/A',
      },
      {
        Header: 'Created At',
        accessor: 'createdAt',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: 'Updated At',
        accessor: 'updatedAt',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
    ],
    []
  );

  // Prepare data for react-table with search filtering
  const data = React.useMemo(() => {
    const filteredCustomers = customers.filter((customer) => {
      const matchesSearch = searchQuery
        ? customer.id.toString().includes(searchQuery) ||
          (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSearch;
    });

    return filteredCustomers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
  }, [customers, searchQuery]);

  // Initialize react-table with pagination and sorting
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    gotoPage,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    useSortBy, // Enable sorting
    usePagination // Enable pagination
  );

  // Reset page to 0 when search changes
  useEffect(() => {
    gotoPage(0);
  }, [searchQuery, gotoPage]);

  return (
    <div className="container my-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-primary text-white p-4">
          <CardTitle as="h5" className="mb-0 fw-bold">
            Customers List
          </CardTitle>
          <p className="card-subtitle mt-2 text-light">
            View and manage all customers. Use the search, sort, and pagination features to navigate the list.
          </p>
        </CardHeader>
        <CardBody className="p-4">
          {/* Search Filter */}
          <div className="row g-3 mb-4">
            <div className="col-md-6 col-lg-4">
              <Form.Group controlId="searchQuery">
                <Form.Label className="fw-medium">Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by ID, Name, or Email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-control"
                />
              </Form.Group>
            </div>
          </div>

          {/* Table or Loading/Error States */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading customers...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger shadow-sm" role="alert">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table {...getTableProps()} className="table table-striped table-hover table-bordered">
                  <thead className="table-dark">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(column.getSortByToggleProps())}
                            key={column.id}
                            className="fw-medium"
                          >
                            {column.render('Header')}
                            <span>
                              {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()} key={row.id}>
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} key={cell.column.id}>
                              {cell.render('Cell')}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
                <div className="btn-group" role="group">
                  <Button
                    variant="outline-primary"
                    onClick={() => previousPage()}
                    disabled={!canPreviousPage}
                    className="px-4"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline-primary"
                    onClick={() => nextPage()}
                    disabled={!canNextPage}
                    className="px-4"
                  >
                    Next
                  </Button>
                </div>
                <span className="text-muted">
                  Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
                </span>
                <Form.Select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-auto"
                  style={{ maxWidth: '150px' }}
                >
                  {[5, 10, 20, 30, 50].map((size) => (
                    <option key={size} value={size}>
                      Show {size}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CustomersList;