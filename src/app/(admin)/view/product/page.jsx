'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter for navigation
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardBody, Form, Spinner, Alert, Row, Col, Button, Table, Pagination } from 'react-bootstrap';

// Category selector component
const CategorySelector = ({ categories, isLoading, onCategorySelect }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    console.log('Selected Category ID:', categoryId);
    setSelectedCategoryId(categoryId);
  };

  const handleSubmit = () => {
    if (selectedCategoryId) {
      console.log('Submitting Category ID:', selectedCategoryId);
      onCategorySelect(selectedCategoryId);
    }
  };

  console.log('Categories in CategorySelector:', categories);

  return (
    <Card className="mb-4 shadow-lg border-0">
      <CardHeader className="bg-primary text-white p-3">
        <h6 className="fw-bold mb-0">Select a Category</h6>
      </CardHeader>
      <CardBody className="p-4">
        <Row className="align-items-end">
          <Col md={8}>
            <Form.Group controlId="categorySelector">
              <Form.Label className="fw-medium text-primary">Choose Category</Form.Label>
              <Form.Select
                value={selectedCategoryId}
                onChange={handleCategoryChange}
                className="form-select shadow-sm"
                disabled={isLoading}
                size="lg"
              >
                <option value="">-- Select a category --</option>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No categories available
                  </option>
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4} className="mt-3 mt-md-0">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedCategoryId || isLoading}
              className="w-100 shadow-sm"
            >
              Apply Category
            </Button>
          </Col>
        </Row>
        {selectedCategoryId && (
          <div className="mt-3 p-3 bg-light rounded border shadow-sm">
            <strong>Selected Category ID:</strong>{' '}
            <code className="ms-2 text-primary">{selectedCategoryId}</code>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

// Filter component for product list filtering
const CategoryFilter = ({ categories, selectedCategory, onChange, isLoading }) => (
  <Form.Group controlId="categoryFilter" className="mb-4" style={{ maxWidth: '300px' }}>
    <Form.Label className="fw-medium text-primary">Filter Products by Category</Form.Label>
    <Form.Select
      value={selectedCategory}
      onChange={onChange}
      className="form-select shadow-sm"
      disabled={isLoading}
    >
      <option value="all">All Categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.title}
        </option>
      ))}
    </Form.Select>
  </Form.Group>
);

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryError, setCategoryError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 10;

  const router = useRouter(); // Initialize useRouter for navigation

  // Fetch products and categories from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsResponse = await axios.get('https://api.g3studio.co/api/products', {
          headers: { 'Content-Type': 'application/json' },
        });
        const fetchedProducts = productsResponse.data.products || productsResponse.data;
        console.log('Fetched Products:', fetchedProducts);
        setProducts(fetchedProducts);

        const categoriesResponse = await axios.get('https://api.g3studio.co/api/categories', {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Raw Categories Response:', categoriesResponse.data);
        const fetchedCategories = categoriesResponse.data;

        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
        } else if (fetchedCategories && typeof fetchedCategories === 'object') {
          setCategories(fetchedCategories.categories || []);
        } else {
          setCategoryError('Invalid category data format received');
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle selected category ID
  const handleCategorySelect = (categoryId) => {
    console.log('Category Selected in Parent:', categoryId);
    setSelectedCategoryId(categoryId);
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  // Handle Edit - Redirect to /edit/product/{id}
  const handleEdit = (productId) => {
    console.log(`Redirecting to edit product with ID: ${productId}`);
    router.push(`/edit/product/${productId}`);
  };

  // Handle Delete
  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`https://api.g3studio.co/api/products/${productId}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        setProducts(products.filter((product) => product.id !== productId));
        console.log(`Deleted product with ID: ${productId}`);
      } catch (err) {
        console.error('Error deleting product:', err);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  // Filter and search products
  const filteredProducts = products
    .filter((product) => {
      const categoryId = product.categoryId || product.category_id || (product.category && product.category.id);
      console.log('Product Category ID:', categoryId, 'Selected Category:', selectedCategory);
      const matchesCategory = selectedCategory === 'all' || String(categoryId) === String(selectedCategory);
      const matchesSearch = searchQuery
        ? (product.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.vendor || '').toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    })
    .map((product) => {
      const categoryId = product.categoryId || product.category_id || (product.category && product.category.id);
      const category = categories.find((cat) => String(cat.id) === String(categoryId));
      return {
        id: product.id, // Ensure ID is included for edit/delete
        title: product.title || 'N/A',
        vendor: product.vendor || 'N/A',
        productType: (product.product_type || product.productType) || 'N/A',
        categoryName: category ? category.title : 'Unknown',
        isFeatured: product.isFeatured,
      };
    });

  console.log('Filtered Products:', filteredProducts);

  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    const newCategory = e.target.value;
    console.log('Category Filter Changed To:', newCategory);
    setSelectedCategory(newCategory);
    setCurrentPage(1);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container my-4">
      {/* Category Selector Component */}
      <CategorySelector categories={categories} isLoading={loading} onCategorySelect={handleCategorySelect} />

      <Card className="shadow-lg border-0 rounded-3">
        <CardHeader className="bg-primary text-white p-4 rounded-top">
          <CardTitle as="h5" className="mb-0 fw-bold">
            <i className="bi bi-box-seam me-2"></i>Products Management
          </CardTitle>
          <p className="card-subtitle mt-2 text-light mb-0">
            View and manage all products. Use the category filter, search, and pagination features to navigate the list.
          </p>
        </CardHeader>
        <CardBody className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" role="status" />
              <p className="mt-3 text-primary fw-medium">Loading products and categories...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="shadow-sm">
              <Alert.Heading>Error Loading Data</Alert.Heading>
              <p>{error}</p>
            </Alert>
          ) : (
            <>
              {categoryError && (
                <Alert variant="warning" className="shadow-sm mb-4">
                  <Alert.Heading>Category Loading Issue</Alert.Heading>
                  <p>{categoryError}</p>
                  <p className="mb-0">Product list will still be displayed, but category filtering may be limited.</p>
                </Alert>
              )}

              {/* Filters */}
              <Row className="mb-4">
                <Col md={6} lg={4}>
                  <CategoryFilter
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onChange={handleCategoryChange}
                    isLoading={loading}
                  />
                </Col>
                <Col md={6} lg={4}>
                  <Form.Group controlId="searchQuery">
                    <Form.Label className="fw-medium text-primary">Search Products</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by title or vendor..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="shadow-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {filteredProducts.length === 0 ? (
                <Alert variant="info" className="shadow-sm text-center">
                  <i className="bi bi-info-circle me-2"></i>
                  No products found matching your criteria.
                </Alert>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table striped bordered hover className="shadow-sm">
                      <thead className="table-dark">
                        <tr>
                          <th className="fw-medium">Product Title</th>
                          <th className="fw-medium">Vendor</th>
                          <th className="fw-medium">Product Type</th>
                          <th className="fw-medium">Category</th>
                          <th className="fw-medium">Featured</th>
                          <th className="fw-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedProducts.map((product) => (
                          <tr key={product.id}>
                            <td>{product.title}</td>
                            <td>{product.vendor}</td>
                            <td>{product.productType}</td>
                            <td>{product.categoryName}</td>
                            <td>
                              <span
                                className={`badge ${product.isFeatured ? 'bg-success' : 'bg-secondary'}`}
                              >
                                {product.isFeatured ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleEdit(product.id)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Pagination className="justify-content-center mt-4">
                      <Pagination.Prev
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      />
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Pagination.Item
                          key={page}
                          active={page === currentPage}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      />
                    </Pagination>
                  )}
                </>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductsList;