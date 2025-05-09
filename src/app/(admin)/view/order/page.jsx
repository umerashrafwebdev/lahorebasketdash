'use client';

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardBody, Form, Button, Dropdown, Spinner, Badge } from 'react-bootstrap';
import { useTable, usePagination } from 'react-table';

// Status badge component for cleaner rendering
const StatusBadge = ({ status }) => {
  const getBadgeVariant = () => {
    switch (status) {
      case 'pending': return 'warning text-dark';
      case 'shipped': return 'info';
      case 'completed': return 'success';
      case 'canceled': return 'danger'; // Added for canceled status
      default: return 'secondary';
    }
  };

  return <Badge bg={getBadgeVariant()}>{status}</Badge>;
};

// Action dropdown component
const StatusUpdateDropdown = ({ orderId, currentStatus, onUpdateStatus, isUpdating }) => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-primary"
        size="sm"
        disabled={isUpdating}
        className="d-flex align-items-center"
      >
        {isUpdating ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Updating...
          </>
        ) : (
          'Update Status'
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item onClick={() => onUpdateStatus(orderId, 'pending')}>Pending</Dropdown.Item>
        <Dropdown.Item onClick={() => onUpdateStatus(orderId, 'completed')}>Completed</Dropdown.Item>
        <Dropdown.Item onClick={() => onUpdateStatus(orderId, 'shipped')}>Shipped</Dropdown.Item>
        <Dropdown.Item onClick={() => onUpdateStatus(orderId, 'canceled')}>Canceled</Dropdown.Item> {/* Added canceled option */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

// Filter and search component
const OrderFilters = ({ statusFilter, searchQuery, onStatusChange, onSearchChange }) => (
  <div className="row g-3 mb-4">
    <div className="col-md-4 col-lg-3">
      <Form.Group controlId="statusFilter">
        <Form.Label className="fw-medium">Filter by Status</Form.Label>
        <Form.Select
          value={statusFilter}
          onChange={onStatusChange}
          className="form-select shadow-sm"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="shipped">Shipped</option>
          <option value="canceled">Canceled</option> {/* Added canceled option */}
        </Form.Select>
      </Form.Group>
    </div>
    <div className="col-md-8 col-lg-4">
      <Form.Group controlId="searchQuery">
        <Form.Label className="fw-medium">Search</Form.Label>
        <Form.Control
          type="text"
          placeholder="Search by ID or Customer Name"
          value={searchQuery}
          onChange={onSearchChange}
          className="form-control shadow-sm"
        />
      </Form.Group>
    </div>
  </div>
);

// Pagination component
const TablePagination = ({ 
  pageIndex, 
  pageSize, 
  pageOptions, 
  canPreviousPage, 
  canNextPage, 
  previousPage, 
  nextPage, 
  setPageSize 
}) => (
  <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
    <div className="btn-group shadow-sm" role="group">
      <Button
        variant="outline-primary"
        onClick={previousPage}
        disabled={!canPreviousPage}
        className="px-4"
      >
        Previous
      </Button>
      <Button
        variant="outline-primary"
        onClick={nextPage}
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
      className="w-auto shadow-sm"
      style={{ maxWidth: '150px' }}
    >
      {[10, 20, 30, 40, 50].map((size) => (
        <option key={size} value={size}>
          Show {size}
        </option>
      ))}
    </Form.Select>
  </div>
);

// Main OrdersList component
const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('https://api.g3studio.co/api/orders', {
          headers: { 'Content-Type': 'application/json' },
        });
        
        const rawOrders = response.data.orders || response.data;
        setOrders(rawOrders);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  // Function to update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await axios.put(
        `https://api.g3studio.co/api/orders/${orderId}`,
        { status: newStatus },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Define columns for react-table
  const columns = useMemo(
    () => [
      { 
        Header: 'Order ID', 
        accessor: 'id',
        Cell: ({ value }) => <span className="fw-medium">{value}</span>
      },
      {
        Header: 'Customer',
        accessor: 'customerName',
        Cell: ({ row, value }) => (
          <a
            href={`http://localhost:3000/orders/${row.original.id}`}
            className="text-primary text-decoration-underline fw-medium"
          >
            {value || 'N/A'}
          </a>
        ),
      },
      {
        Header: 'Total',
        accessor: 'total',
        Cell: ({ value }) => <span className="fw-medium">PKR.{value.toFixed(2)}</span>,
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => <StatusBadge status={value} />,
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
      {
        Header: 'Actions',
        accessor: 'actions',
        Cell: ({ row }) => (
          <StatusUpdateDropdown
            orderId={row.original.id}
            currentStatus={row.original.status}
            onUpdateStatus={updateOrderStatus}
            isUpdating={updatingOrderId === row.original.id}
          />
        ),
      },
    ],
    [updatingOrderId]
  );

  // Filter, sort, and prepare data in descending order by createdAt
  const data = useMemo(() => {
    const filteredOrders = orders
      .filter((order) => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = searchQuery
          ? order.id.toString().includes(searchQuery) ||
            (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
          : true;
        return matchesStatus && matchesSearch;
      })
      // Sort in descending order by createdAt
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map((order) => ({
        id: order.id,
        customerName: order.customer?.name,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

    return filteredOrders;
  }, [orders, statusFilter, searchQuery]);

  // Initialize react-table with pagination
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
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    usePagination
  );

  // Reset page to 0 when filter or search changes
  useEffect(() => {
    gotoPage(0);
  }, [statusFilter, searchQuery, gotoPage]);

  return (
    <div className="container my-4">
      <Card className="shadow-lg border-0 rounded-3">
        <CardHeader className="bg-primary text-white p-4 rounded-top">
          <CardTitle as="h5" className="mb-0 fw-bold">
            Orders Management
          </CardTitle>
          <p className="card-subtitle mt-2 text-light mb-0">
            View and manage all orders. Use the search, sort, and pagination features to navigate the list.
          </p>
        </CardHeader>
        <CardBody className="p-4">
          {/* Filters */}
          <OrderFilters
            statusFilter={statusFilter}
            searchQuery={searchQuery}
            onStatusChange={(e) => setStatusFilter(e.target.value)}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Table or Loading/Error States */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-primary fw-medium">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger shadow-sm rounded-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Error:</strong> {error}
            </div>
          ) : data.length === 0 ? (
            <div className="alert alert-info shadow-sm rounded-3 text-center" role="alert">
              <i className="bi bi-info-circle-fill me-2"></i>
              No orders found matching your criteria.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table {...getTableProps()} className="table table-striped table-hover table-bordered rounded">
                  <thead className="table-dark">
                    {headerGroups.map((headerGroup) => (
                      <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                        {headerGroup.headers.map((column) => (
                          <th 
                            {...column.getHeaderProps()} 
                            key={column.id} 
                            className="fw-medium py-3"
                          >
                            {column.render('Header')}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                      prepareRow(row);
                      return (
                        <tr {...row.getRowProps()} key={row.id} className="align-middle">
                          {row.cells.map((cell) => (
                            <td {...cell.getCellProps()} key={cell.column.id} className="py-3">
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
              <TablePagination
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageOptions={pageOptions}
                canPreviousPage={canPreviousPage}
                canNextPage={canNextPage}
                previousPage={previousPage}
                nextPage={nextPage}
                setPageSize={setPageSize}
              />
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default OrdersList;