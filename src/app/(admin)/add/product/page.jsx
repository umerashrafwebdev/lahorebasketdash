'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Row, Col, Image, Spinner, Alert } from 'react-bootstrap';

// Validation schema for a single variant
const variantSchema = yup.object().shape({
  title: yup.string().required('Variant title is required'),
  price: yup.number().typeError('Price must be a number').required('Price is required').positive('Price must be positive'),
  discount: yup.boolean().default(false),
  discount_price: yup
    .number()
    .nullable()
    .typeError('Discount price must be a number')
    .when('discount', { is: true, then: (schema) => schema.required('Discount price is required when discounted').positive() }),
  sku: yup.string().required('SKU is required'),
  cost: yup.number().nullable().typeError('Cost must be a number').positive('Cost must be positive'),
  quantity: yup.number().nullable().typeError('Quantity must be a number').integer().positive('Quantity must be positive'),
});

// Validation schema for a single product
const singleProductSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  bodyHtml: yup.string().required('Description is required'),
  vendor: yup.string().required('Vendor is required'),
  productType: yup.string().required('Product type is required'),
  categoryId: yup.number().nullable().typeError('Please select a category'),
  subCategoryId: yup.number().nullable().typeError('Please select a subcategory'),
  tags: yup.string().nullable(),
  isFeatured: yup.boolean().default(false),
  status: yup.string().oneOf(['ACTIVE', 'DRAFT']).required('Status is required'),
  images: yup.array().of(yup.mixed()).min(1, 'At least one image is required').required('Images are required'),
  variants: yup.array().of(variantSchema).min(1, 'At least one variant is required'),
});

// Validation schema for bulk products
const productSchema = yup.object().shape({
  products: yup.array().of(singleProductSchema).min(1, 'At least one product is required'),
});

const ProductForm = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [subCategoryLoading, setSubCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [subCategoryError, setSubCategoryError] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

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
      products: [{
        title: '',
        bodyHtml: '',
        vendor: '',
        productType: '',
        categoryId: null,
        subCategoryId: null,
        tags: '',
        isFeatured: false,
        status: 'DRAFT',
        images: [],
        variants: [{ title: '', price: '', discount: false, discount_price: null, sku: '', cost: null, quantity: null }],
      }],
    },
  });

  const { fields: productFields, append: appendProduct, remove: removeProduct } = useFieldArray({
    control,
    name: 'products',
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://api.g3studio.co/api/categories');
        setCategories(Array.isArray(response.data.categories || response.data) ? (response.data.categories || response.data) : []);
      } catch (err) {
        setCategoryError(`Failed to load categories: ${err.message}`);
      } finally {
        setCategoryLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch subcategories
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        setSubCategoryLoading(true);
        const response = await axios.get('https://api.g3studio.co/api/subcategories');
        setSubCategories(Array.isArray(response.data.subCategories || response.data) ? (response.data.subCategories || response.data) : []);
      } catch (err) {
        setSubCategoryError(`Failed to load subcategories: ${err.message}`);
      } finally {
        setSubCategoryLoading(false);
      }
    };
    fetchSubCategories();
  }, []);

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSubmitSuccess(null);
    try {
      const requests = data.products.map(async (product) => {
        const formData = new FormData();
        formData.append('title', product.title);
        formData.append('body_html', product.bodyHtml);
        formData.append('vendor', product.vendor);
        formData.append('product_type', product.productType);
        if (product.categoryId) formData.append('categoryId', product.categoryId);
        if (product.subCategoryId) formData.append('subCategoryId', product.subCategoryId);
        formData.append('tags', product.tags ? JSON.stringify(product.tags.split(',').map(tag => tag.trim())) : '[]');
        formData.append('isFeatured', String(product.isFeatured));
        formData.append('status', product.status);

        // Send variants as individual form fields
        product.variants.forEach((variant, index) => {
          formData.append(`variants[${index}][title]`, variant.title);
          formData.append(`variants[${index}][price]`, variant.price);
          formData.append(`variants[${index}][discount]`, String(variant.discount));
          if (variant.discount_price) formData.append(`variants[${index}][discount_price]`, variant.discount_price);
          formData.append(`variants[${index}][sku]`, variant.sku);
          if (variant.cost) formData.append(`variants[${index}][cost]`, variant.cost);
          if (variant.quantity) formData.append(`variants[${index}][quantity]`, variant.quantity);
        });

        product.images.forEach((image) => formData.append('images', image));

        // Log FormData for debugging
        for (let [key, value] of formData.entries()) {
          console.log(`FormData - ${key}: ${value}`);
        }

        return axios.post('https://api.g3studio.co/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      });

      await Promise.all(requests);
      setSubmitSuccess('All products created successfully!');
      reset();
      setImagePreviews({});
    } catch (error) {
      console.error('Submission Error:', error.response?.data);
      setSubmitError(error.response?.data?.error || 'Failed to create one or more products');
    }
  };

  const handleFileChange = (index, e) => {
    const files = Array.from(e.target.files);
    setValue(`products.${index}.images`, files, { shouldValidate: true });
    trigger(`products.${index}.images`);
    if (imagePreviews[index]) {
      imagePreviews[index].forEach(preview => URL.revokeObjectURL(preview));
    }
    setImagePreviews(prev => ({
      ...prev,
      [index]: files.map(file => URL.createObjectURL(file)),
    }));
  };

  useEffect(() => {
    return () => {
      Object.values(imagePreviews).flat().forEach(preview => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="bg-primary text-white">
        <CardTitle as="h4" className="mb-0">Create Bulk Products</CardTitle>
      </CardHeader>
      <CardBody className="p-4">
        <Form onSubmit={handleSubmit(onSubmit)}>
          {submitError && <Alert variant="danger">{submitError}</Alert>}
          {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}

          {productFields.map((field, index) => (
            <Card key={field.id} className="mb-4 shadow-sm">
              <CardBody>
                <h5>Product {index + 1}</h5>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId={`products.${index}.title`}>
                      <Form.Label>Title</Form.Label>
                      <Form.Control {...register(`products.${index}.title`)} type="text" isInvalid={!!errors.products?.[index]?.title} />
                      {errors.products?.[index]?.title && <Form.Control.Feedback type="invalid">{errors.products[index].title.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId={`products.${index}.vendor`}>
                      <Form.Label>Vendor</Form.Label>
                      <Form.Control {...register(`products.${index}.vendor`)} type="text" isInvalid={!!errors.products?.[index]?.vendor} />
                      {errors.products?.[index]?.vendor && <Form.Control.Feedback type="invalid">{errors.products[index].vendor.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId={`products.${index}.bodyHtml`}>
                  <Form.Label>Description (HTML)</Form.Label>
                  <Form.Control {...register(`products.${index}.bodyHtml`)} as="textarea" rows={3} isInvalid={!!errors.products?.[index]?.bodyHtml} />
                  {errors.products?.[index]?.bodyHtml && <Form.Control.Feedback type="invalid">{errors.products[index].bodyHtml.message}</Form.Control.Feedback>}
                </Form.Group>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId={`products.${index}.productType`}>
                      <Form.Label>Product Type</Form.Label>
                      <Form.Control {...register(`products.${index}.productType`)} type="text" isInvalid={!!errors.products?.[index]?.productType} />
                      {errors.products?.[index]?.productType && <Form.Control.Feedback type="invalid">{errors.products[index].productType.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId={`products.${index}.categoryId`}>
                      <Form.Label>Category</Form.Label>
                      {categoryLoading ? <Spinner animation="border" size="sm" /> : (
                        <Form.Select {...register(`products.${index}.categoryId`)} isInvalid={!!errors.products?.[index]?.categoryId}>
                          <option value="">-- Select --</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                        </Form.Select>
                      )}
                      {errors.products?.[index]?.categoryId && <Form.Control.Feedback type="invalid">{errors.products[index].categoryId.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId={`products.${index}.subCategoryId`}>
                      <Form.Label>Subcategory</Form.Label>
                      {subCategoryLoading ? <Spinner animation="border" size="sm" /> : (
                        <Form.Select {...register(`products.${index}.subCategoryId`)} isInvalid={!!errors.products?.[index]?.subCategoryId}>
                          <option value="">-- Select --</option>
                          {subCategories.map(sub => <option key={sub.id} value={sub.id}>{sub.title}</option>)}
                        </Form.Select>
                      )}
                      {errors.products?.[index]?.subCategoryId && <Form.Control.Feedback type="invalid">{errors.products[index].subCategoryId.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId={`products.${index}.tags`}>
                      <Form.Label>Tags</Form.Label>
                      <Form.Control {...register(`products.${index}.tags`)} type="text" isInvalid={!!errors.products?.[index]?.tags} />
                      {errors.products?.[index]?.tags && <Form.Control.Feedback type="invalid">{errors.products[index].tags.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId={`products.${index}.isFeatured`}>
                      <Form.Label>Featured</Form.Label>
                      <Form.Check {...register(`products.${index}.isFeatured`)} type="checkbox" label="Mark as Featured" />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3" controlId={`products.${index}.status`}>
                      <Form.Label>Status</Form.Label>
                      <Form.Select {...register(`products.${index}.status`)} isInvalid={!!errors.products?.[index]?.status}>
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                      </Form.Select>
                      {errors.products?.[index]?.status && <Form.Control.Feedback type="invalid">{errors.products[index].status.message}</Form.Control.Feedback>}
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId={`products.${index}.images`}>
                  <Form.Label>Images</Form.Label>
                  <Form.Control type="file" multiple onChange={(e) => handleFileChange(index, e)} isInvalid={!!errors.products?.[index]?.images} accept="image/*" />
                  {imagePreviews[index]?.length > 0 && (
                    <Row className="mt-3">
                      {imagePreviews[index].map((preview, i) => (
                        <Col key={i} xs={6} md={4}>
                          <Image src={preview} alt={`Preview ${i + 1}`} width={150} height={150} className="rounded" style={{ objectFit: 'cover' }} />
                        </Col>
                      ))}
                    </Row>
                  )}
                  {errors.products?.[index]?.images && <Form.Text className="text-danger">{errors.products[index].images.message}</Form.Text>}
                </Form.Group>

                <div className="mb-3">
                  <h6>Variants</h6>
                  <VariantFields control={control} register={register} errors={errors} productIndex={index} />
                </div>

                <Button variant="danger" onClick={() => removeProduct(index)} className="mt-2">Remove Product</Button>
              </CardBody>
            </Card>
          ))}

          <Button variant="outline-primary" onClick={() => appendProduct({
            title: '', bodyHtml: '', vendor: '', productType: '', categoryId: null, subCategoryId: null, tags: '',
            isFeatured: false, status: 'DRAFT', images: [], variants: [{ title: '', price: '', discount: false, discount_price: null, sku: '', cost: null, quantity: null }]
          })} className="mb-3">
            Add Another Product
          </Button>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? <><Spinner animation="border" size="sm" className="me-2" />Creating...</> : 'Create Products'}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

// Variant Fields Component
const VariantFields = ({ control, register, errors, productIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `products.${productIndex}.variants`,
  });

  return (
    <>
      {fields.map((field, index) => (
        <Card key={field.id} className="mb-2 shadow-sm">
          <CardBody>
            <Row>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control {...register(`products.${productIndex}.variants.${index}.title`)} type="text" isInvalid={!!errors.products?.[productIndex]?.variants?.[index]?.title} />
                  {errors.products?.[productIndex]?.variants?.[index]?.title && <Form.Control.Feedback type="invalid">{errors.products[productIndex].variants[index].title.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Price</Form.Label>
                  <Form.Control {...register(`products.${productIndex}.variants.${index}.price`)} type="number" step="0.01" isInvalid={!!errors.products?.[productIndex]?.variants?.[index]?.price} />
                  {errors.products?.[productIndex]?.variants?.[index]?.price && <Form.Control.Feedback type="invalid">{errors.products[productIndex].variants[index].price.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Cost</Form.Label>
                  <Form.Control {...register(`products.${productIndex}.variants.${index}.cost`)} type="number" step="0.01" isInvalid={!!errors.products?.[productIndex]?.variants?.[index]?.cost} />
                  {errors.products?.[productIndex]?.variants?.[index]?.cost && <Form.Control.Feedback type="invalid">{errors.products[productIndex].variants[index].cost.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control {...register(`products.${productIndex}.variants.${index}.quantity`)} type="number" isInvalid={!!errors.products?.[productIndex]?.variants?.[index]?.quantity} />
                  {errors.products?.[productIndex]?.variants?.[index]?.quantity && <Form.Control.Feedback type="invalid">{errors.products[productIndex].variants[index].quantity.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group>
                  <Form.Label>Discount</Form.Label>
                  <Form.Check {...register(`products.${productIndex}.variants.${index}.discount`)} type="checkbox" />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Disc. Price</Form.Label>
                  <Form.Control {...register(`products.${productIndex}.variants.${index}.discount_price`)} type="number" step="0.01" isInvalid={!!errors.products?.[productIndex]?.variants?.[index]?.discount_price} />
                  {errors.products?.[productIndex]?.variants?.[index]?.discount_price && <Form.Control.Feedback type="invalid">{errors.products[productIndex].variants[index].discount_price.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col md={1}>
                <Form.Group>
                  <Form.Label>SKU</Form.Label>
                  <Form.Control {...register(`products.${productIndex}.variants.${index}.sku`)} type="text" isInvalid={!!errors.products?.[productIndex]?.variants?.[index]?.sku} />
                  {errors.products?.[productIndex]?.variants?.[index]?.sku && <Form.Control.Feedback type="invalid">{errors.products[productIndex].variants[index].sku.message}</Form.Control.Feedback>}
                </Form.Group>
              </Col>
              <Col md={1}>
                <Button variant="danger" onClick={() => remove(index)}>Remove</Button>
              </Col>
            </Row>
          </CardBody>
        </Card>
      ))}
      <Button variant="outline-primary" onClick={() => append({ title: '', price: '', discount: false, discount_price: null, sku: '', cost: null, quantity: null })} className="mt-2">
        Add Variant
      </Button>
    </>
  );
};

export default ProductForm;