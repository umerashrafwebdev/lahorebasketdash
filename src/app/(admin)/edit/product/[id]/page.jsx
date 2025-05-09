'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col, Image, Spinner, Alert, Collapse } from 'react-bootstrap';
import { useParams } from 'next/navigation';

// Validation schema
const variantSchema = yup.object().shape({
  title: yup.string().required('Variant title is required'),
  price: yup
    .number()
    .typeError('Price must be a number')
    .required('Price is required')
    .positive('Price must be positive'),
  discount: yup.boolean().default(false),
  discount_price: yup
    .number()
    .nullable()
    .typeError('Discount price must be a number')
    .when('discount', {
      is: true,
      then: (schema) => schema.required('Discount price is required when discounted').positive('Discount price must be positive'),
    }),
  sku: yup.string().required('SKU is required'),
});

const ProductForm = () => {
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [openVariants, setOpenVariants] = useState({});
  const [loadingProduct, setLoadingProduct] = useState(!!id);
  const [existingImages, setExistingImages] = useState([]); // Store existing image URLs

  // Dynamic schema based on whether editing or creating
  const productSchema = yup.object().shape({
    title: yup.string().required('Title is required'),
    bodyHtml: yup.string().required('Description is required'),
    vendor: yup.string().required('Vendor is required'),
    productType: yup.string().required('Product type is required'),
    categoryId: yup
      .number()
      .nullable()
      .typeError('Please select a category'),
    tags: yup.string().nullable(),
    isFeatured: yup.boolean().default(false),
    images: yup
      .array()
      .of(yup.mixed())
      .test('at-least-one-image', 'At least one image is required', function (value) {
        // If creating (no id), require at least one new image
        if (!id) return value && value.length > 0;
        // If editing (id exists), check combined existingImages and new images
        return (existingImages.length + (value ? value.length : 0)) > 0;
      }),
    variants: yup.array().of(variantSchema).min(1, 'At least one variant is required'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      title: '',
      bodyHtml: '',
      vendor: '',
      productType: '',
      categoryId: null,
      tags: '',
      isFeatured: false,
      images: [],
      variants: [{ title: '', price: '', discount: false, discount_price: null, sku: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  });

  const images = watch('images'); // New images as File objects
  const [imagePreviews, setImagePreviews] = useState([]); // Combined previews (existing + new)
  const API_BASE_URL = 'https://api.g3studio.co';

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/categories`);
        console.log('Fetched Categories:', response.data);
        const fetchedCategories = response.data;
        if (Array.isArray(fetchedCategories)) {
          setCategories(fetchedCategories);
        } else if (fetchedCategories && typeof fetchedCategories === 'object') {
          setCategories(fetchedCategories.categories || []);
        } else {
          setCategoryError('Invalid category data format received');
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setCategoryError(`Failed to load categories: ${err.message}`);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch product data if ID exists
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/products/${id}`);
        console.log('Fetched Product:', response.data);
        const product = response.data.product;

        const formData = {
          title: product.title || '',
          bodyHtml: product.bodyHtml || '',
          vendor: product.vendor || '',
          productType: product.productType || '',
          categoryId: product.categoryId || null,
          tags: product.tags ,
          // ? product.tags.join(', ') : '',
          isFeatured: product.isFeatured || false,
          variants: product.variants && product.variants.length > 0
            ? product.variants.map(v => ({
                title: v.title || '',
                price: v.price || '',
                discount: v.discount || false,
                discount_price: v.discountPrice || null,
                sku: v.sku || '',
              }))
            : [{ title: '', price: '', discount: false, discount_price: null, sku: '' }],
          images: [], // New images will be added via file input
        };

        reset(formData);
        if (product.images && product.images.length > 0) {
          const imageUrls = product.images.map(img => img.src || img);
          setExistingImages(imageUrls);
          setImagePreviews(imageUrls);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setSubmitError(`Failed to load product data: ${err.message}`);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, reset]);

  // Update image previews when new images are added
  useEffect(() => {
    const newPreviews = images.map(image => URL.createObjectURL(image));
    setImagePreviews([...existingImages, ...newPreviews]);
    return () => newPreviews.forEach(preview => URL.revokeObjectURL(preview));
  }, [images, existingImages]);

  const onSubmit = async (data) => {
    console.log('Submitting data:', data);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('body_html', data.bodyHtml);
      formData.append('vendor', data.vendor);
      formData.append('product_type', data.productType);
      if (data.categoryId) formData.append('categoryId', data.categoryId);
      formData.append('tags', data.tags ? JSON.stringify(data.tags.split(',').map(tag => tag.trim())) : '[]');
      formData.append('isFeatured', String(data.isFeatured));

      data.variants.forEach((variant, index) => {
        formData.append(`variants[${index}][title]`, variant.title);
        formData.append(`variants[${index}][price]`, variant.price);
        formData.append(`variants[${index}][discount]`, String(variant.discount));
        if (variant.discount_price) formData.append(`variants[${index}][discount_price]`, variant.discount_price);
        formData.append(`variants[${index}][sku]`, variant.sku);
      });

      // Append existing image URLs
      existingImages.forEach((url, index) => {
        formData.append(`existingImages[${index}]`, url);
      });

      // Append new image files
      data.images.forEach((image) => {
        formData.append('images', image);
      });

      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      const url = id ? `${API_BASE_URL}/api/products/${id}` : `${API_BASE_URL}/api/products`;
      const method = id ? axios.put : axios.post;

      const response = await method(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Response:', response.data);
      if (response.status === 200 || response.status === 201) {
        reset();
        setImagePreviews([]);
        setExistingImages([]);
        alert(id ? 'Product updated successfully!' : 'Product created successfully!');
      }
    } catch (error) {
      console.error('Error submitting product:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setSubmitError(error.response?.data?.message || `Failed to ${id ? 'update' : 'create'} product`);
    }
  };

  useEffect(() => {
    register('images');
  }, [register]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    console.log('Files selected:', files);
    setValue('images', files, { shouldValidate: true });
    trigger('images');
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      // Remove from existing images
      const newExistingImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(newExistingImages);
      setImagePreviews([...newExistingImages, ...images.map(image => URL.createObjectURL(image))]);
    } else {
      // Remove from new images
      const newImages = images.filter((_, i) => i !== (index - existingImages.length));
      setValue('images', newImages, { shouldValidate: true });
      trigger('images');
    }
  };

  const toggleVariant = (index) => {
    setOpenVariants((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-primary text-white">
        <CardTitle as="h4" className="mb-0">{id ? 'Edit Product' : 'Create Product'}</CardTitle>
      </CardHeader>
      <CardBody className="p-4">
        {loadingProduct ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading product data...</p>
          </div>
        ) : (
          <Form onSubmit={handleSubmit(onSubmit)}>
            {submitError && (
              <Alert variant="danger" className="shadow-sm">
                {submitError}
              </Alert>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    {...register('title')}
                    type="text"
                    placeholder="Enter product title"
                    isInvalid={!!errors.title}
                    className="shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">{errors.title?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="vendor">
                  <Form.Label>Vendor</Form.Label>
                  <Form.Control
                    {...register('vendor')}
                    type="text"
                    placeholder="Enter vendor name"
                    isInvalid={!!errors.vendor}
                    className="shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">{errors.vendor?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="bodyHtml">
              <Form.Label>Description (HTML)</Form.Label>
              <Form.Control
                {...register('bodyHtml')}
                as="textarea"
                rows={3}
                placeholder="Enter product description"
                isInvalid={!!errors.bodyHtml}
                className="shadow-sm"
              />
              <Form.Control.Feedback type="invalid">{errors.bodyHtml?.message}</Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="productType">
                  <Form.Label>Product Type</Form.Label>
                  <Form.Control
                    {...register('productType')}
                    type="text"
                    placeholder="Enter product type"
                    isInvalid={!!errors.productType}
                    className="shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">{errors.productType?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="categoryId">
                  <Form.Label>Category</Form.Label>
                  {categoryLoading ? (
                    <div className="d-flex align-items-center">
                      <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                      <span>Loading categories...</span>
                    </div>
                  ) : categoryError ? (
                    <Alert variant="warning" className="p-2 mb-0">{categoryError}</Alert>
                  ) : (
                    <Form.Select
                      {...register('categoryId')}
                      isInvalid={!!errors.categoryId}
                      className="shadow-sm"
                    >
                      <option value="">-- Select a category --</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                  <Form.Control.Feedback type="invalid">{errors.categoryId?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="tags">
                  <Form.Label>Tags</Form.Label>
                  <Form.Control
                    {...register('tags')}
                    type="text"
                    placeholder="Enter tags (comma-separated)"
                    isInvalid={!!errors.tags}
                    className="shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">{errors.tags?.message}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="isFeatured">
                  <Form.Label>Featured</Form.Label>
                  <Form.Check
                    {...register('isFeatured')}
                    type="checkbox"
                    label="Mark as Featured"
                    className="mt-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="images">
              <Form.Label>Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
                isInvalid={!!errors.images}
                accept="image/*"
                className="shadow-sm"
              />
              {imagePreviews.length > 0 && (
                <div className="mt-3">
                  <Row>
                    {imagePreviews.map((preview, index) => (
                      <Col key={index} xs={6} md={4} className="mb-3">
                        <div className="position-relative">
                          <Image
                            src={`https://api.g3studio.co/${preview}`}
                            alt={`Preview ${index + 1}`}
                            width={150}
                            height={150}
                            className="rounded shadow-sm"
                            style={{ objectFit: 'cover' }}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={() => removeImage(index)}
                          >
                            X
                          </Button>
                        </div>
                        <p className="mt-1 text-muted small">
                          {index < existingImages.length
                            ? 'Existing Image'
                            : images[index - existingImages.length]?.name || 'New Image'}
                          {index >= existingImages.length && images[index - existingImages.length]?.size
                            ? ` - ${(images[index - existingImages.length].size / 1024).toFixed(2)} KB`
                            : ''}
                        </p>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
              <Form.Text className="text-danger">{errors.images?.message}</Form.Text>
            </Form.Group>

            <div className="mb-4">
              <h5 className="mb-3">Variants</h5>
              {fields.map((field, index) => (
                <Card key={field.id} className="mb-3 shadow-sm border-0">
                  <CardHeader
                    className="bg-light p-2 d-flex justify-content-between align-items-center"
                    onClick={() => toggleVariant(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <span>Variant {index + 1}: {watch(`variants.${index}.title`) || 'Untitled'}</span>
                    <Button variant="link" size="sm" className="p-0">
                      {openVariants[index] ? 'Collapse' : 'Expand'}
                    </Button>
                  </CardHeader>
                  <Collapse in={openVariants[index]}>
                    <div>
                      <CardBody>
                        <Row>
                          <Col md={3}>
                            <Form.Group>
                              <Form.Label>Variant Title</Form.Label>
                              <Form.Control
                                {...register(`variants.${index}.title`)}
                                type="text"
                                placeholder="e.g., 64GB"
                                isInvalid={!!errors.variants?.[index]?.title}
                                className="shadow-sm"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.variants?.[index]?.title?.message}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label>Price</Form.Label>
                              <Form.Control
                                {...register(`variants.${index}.price`)}
                                type="number"
                                step="0.01"
                                placeholder="e.g., 499.99"
                                isInvalid={!!errors.variants?.[index]?.price}
                                className="shadow-sm"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.variants?.[index]?.price?.message}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label>Discount</Form.Label>
                              <Form.Check
                                {...register(`variants.${index}.discount`)}
                                type="checkbox"
                                label="Apply Discount"
                                className="mt-2"
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label>Discount Price</Form.Label>
                              <Form.Control
                                {...register(`variants.${index}.discount_price`)}
                                type="number"
                                step="0.01"
                                placeholder="e.g., 399.99"
                                isInvalid={!!errors.variants?.[index]?.discount_price}
                                className="shadow-sm"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.variants?.[index]?.discount_price?.message}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                            <Form.Group>
                              <Form.Label>SKU</Form.Label>
                              <Form.Control
                                {...register(`variants.${index}.sku`)}
                                type="text"
                                placeholder="e.g., SKU123"
                                isInvalid={!!errors.variants?.[index]?.sku}
                                className="shadow-sm"
                              />
                              <Form.Control.Feedback type="invalid">
                                {errors.variants?.[index]?.sku?.message}
                              </Form.Control.Feedback>
                            </Form.Group>
                          </Col>
                          <Col md={1} className="d-flex align-items-end">
                            <Button variant="danger" onClick={() => remove(index)} className="w-100 shadow-sm">
                              Remove
                            </Button>
                          </Col>
                        </Row>
                      </CardBody>
                    </div>
                  </Collapse>
                </Card>
              ))}
              {errors.variants && !errors.variants.some(v => v) && (
                <Form.Text className="text-danger">{errors.variants?.message}</Form.Text>
              )}
              <Button
                variant="outline-primary"
                onClick={() => append({ title: '', price: '', discount: false, discount_price: null, sku: '' })}
                className="shadow-sm"
              >
                Add Variant
              </Button>
            </div>

            <div className="d-flex gap-2">
              <Button type="submit" variant="primary" disabled={isSubmitting} className="shadow-sm">
                {isSubmitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {id ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  id ? 'Update Product' : 'Create Product'
                )}
              </Button>
              <Button variant="outline-secondary" onClick={() => reset()} disabled={isSubmitting} className="shadow-sm">
                Reset Form
              </Button>
            </div>
          </Form>
        )}
      </CardBody>
    </Card>
  );
};

export default ProductForm;