'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  Form,
  Button,
  Badge,
  Spinner,
  Pagination,
  InputGroup,
} from 'react-bootstrap';

const CategoriesList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const itemsPerPage = 10;

  // Fetch categories from the API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://api.g3studio.co/api/categories', {
          headers: { 'Content-Type': 'application/json' },
        });

        console.log('Fetched Categories:', response.data);
        setCategories(response.data.categories || response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching categories:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError('Failed to load categories. Please try again.');
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle delete action
  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      const response = await axios.delete(
        `https://api.g3studio.co/api/categories/${categoryId}`,
        {
          headers: {
            'Cookie': 'connect.sid=s%3AWTaWTVo_2u7uckzBSR-PZ37Sa9b-bs1Z.Z73xy7vn5XDKQX%2FWOyLYC0WauCMJ3em75dLS%2FT4FuzQ',
          },
        }
      );
      
      console.log('Category Deleted:', response.data);
      setCategories(categories.filter(category => category.id !== categoryId));
      alert('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert('Failed to delete category: ' + error.message);
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  // Prepare and filter data
  const filteredCategories = categories
    .filter((category) =>
      searchQuery
        ? category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.link || 'N/A').toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      if (sortField === 'products') {
        const aCount = a.products ? a.products.length : 0;
        const bCount = b.products ? b.products.length : 0;
        return sortOrder === 'asc' ? aCount - bCount : bCount - aCount;
      }
      if (sortField === 'images') {
        const aCount = a.images ? 1 : 0;
        const bCount = b.images ? 1 : 0;
        return sortOrder === 'asc' ? aCount - bCount : bCount - aCount;
      }
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  // Pagination logic
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div className="container my-4">
      <Card className="shadow-lg border-0 rounded-3">
        <CardHeader className="bg-primary text-white p-4 rounded-top">
          <CardTitle as="h5" className="mb-0 fw-bold">
            Categories Management
          </CardTitle>
          <p className="card-subtitle mt-2 text-light mb-0">
            Explore and manage all categories with ease. Search, sort, and paginate through the list.
          </p>
        </CardHeader>
        <CardBody className="p-4">
          {/* Search Bar */}
          <Form className="mb-4">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by title or link..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="shadow-sm"
              />
            </InputGroup>
          </Form>

          {/* Loading/Error/Data States */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-primary fw-medium">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger shadow-sm rounded-3" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <strong>Error:</strong> {error}
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="alert alert-info shadow-sm rounded-3 text-center" role="alert">
              <i className="bi bi-info-circle-fill me-2"></i>
              No categories found.
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="table table-striped table-hover table-bordered rounded shadow-sm">
                  <thead className="table-dark">
                    <tr>
                      {[
                        { key: 'title', label: 'Title' },
                        { key: 'link', label: 'Link' },
                        { key: 'images', label: 'Images' },
                        { key: 'products', label: 'Products' },
                        { key: 'actions', label: 'Actions' },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          onClick={key !== 'actions' ? () => handleSort(key) : undefined}
                          className={`fw-medium py-3 ${key !== 'actions' ? 'cursor-pointer' : ''}`}
                          style={{ userSelect: 'none' }}
                        >
                          {label}
                          {sortField === key && key !== 'actions' && (
                            <span className="ms-2">
                              {sortOrder === 'asc' ? (
                                <i className="bi bi-arrow-up"></i>
                              ) : (
                                <i className="bi bi-arrow-down"></i>
                              )}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.map((category) => (
                      <tr key={category.id || category.title} className="align-middle">
                        <td className="py-3">
                          <span className="fw-medium text-primary">{category.title}</span>
                        </td>
                        <td className="py-3">
                          <a
                            href={category.link || '#'}
                            className={`text-decoration-underline ${
                              category.link ? 'text-info' : 'text-muted'
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {category.link || 'N/A'}
                          </a>
                        </td>
                        <td className="py-3">
                          <Badge bg={category.images ? 'success' : 'secondary'} className="px-2 py-1">
                            {category.images ? 1 : 0}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Badge bg="primary" className="px-2 py-1">
                            {category.products ? category.products.length : 0}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            className="shadow-sm"
                          >
                            <i className="bi bi-trash me-1"></i>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-3">
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                    {paginationItems}
                    <Pagination.Next
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                  <span className="text-muted">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of{' '}
                    {totalItems} categories
                  </span>
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default CategoriesList;