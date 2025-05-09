'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { Card, CardBody, CardHeader, CardTitle, Button, Form, Image } from 'react-bootstrap';

// Validation schema
const categorySchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  link: yup.string().url('Enter a valid URL').nullable(),
  images: yup.mixed().nullable(),
  products: yup.string().default(''),
});

const CategoryForm = ({ categoryId }) => {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      title: '',
      link: '',
      images: null,
      products: '',
    },
  });

  const images = watch('images');
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch category data
  useEffect(() => {
    const fetchCategory = async () => {
      console.log('Fetching data for categoryId:', categoryId);
      try {
        const response = await axios.get(`https://api.g3studio.co/api/categories/${categoryId}`, {
          headers: {
            // 'Cookie': 'connect.sid=s%3AWTaWTVo_2u7uckzBSR-PZ37Sa9b-bs1Z.Z73xy7vn5XDKQX%2FWOyLYC0WauCMJ3em75dLS%2FT4FuzQ',
          },
        });
        console.log('API Response Status:', response.status);
        console.log('API Response Data:', response.data);
        setInitialData(response.data);

        // Adjust field names based on actual API response
        const data = response.data;
        reset({
          title: data.title || data.name || '',
          link: data.link || data.url || '',
          images: null,
          products: data.products || data.productList || '',
        });
        setImagePreview(data.images || data.imageUrl || null);
      } catch (err) {
        console.error('Fetch Error:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        setError(`Failed to fetch category data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    } else {
      console.log('No categoryId provided');
      setError('No category ID provided');
      setLoading(false);
    }
  }, [categoryId, reset]);

  const onSubmit = async (data) => {
    console.log('Submitting data:', data);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.link) formData.append('link', data.link);
      if (data.images) formData.append('images', data.images);
      formData.append('products', data.products || '');

      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      const response = await axios.put(
        `https://api.g3studio.co/api/categories/${categoryId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Cookie': 'connect.sid=s%3AWTaWTVo_2u7uckzBSR-PZ37Sa9b-bs1Z.Z73xy7vn5XDKQX%2FWOyLYC0WauCMJ3em75dLS%2FT4FuzQ',
          },
        }
      );

      console.log('Category Updated:', response.data);
      reset();
      setImagePreview(null);
    } catch (error) {
      console.error('Error updating category:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  useEffect(() => {
    register('images');
  }, [register]);

  useEffect(() => {
    console.log('Watched images:', images);
    if (images instanceof File) {
      const previewUrl = URL.createObjectURL(images);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [images]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    setValue('images', file, { shouldValidate: true });
    trigger('images');
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <p>Loading category data...</p>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <p className="text-danger">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">Edit Category (ID: {categoryId})</CardTitle>
      </CardHeader>
      <CardBody>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              {...register('title')}
              type="text"
              placeholder="Enter category title"
              isInvalid={!!errors.title}
            />
            {errors.title && (
              <Form.Control.Feedback type="invalid">
                {errors.title.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="link">
            <Form.Label>Link</Form.Label>
            <Form.Control
              {...register('link')}
              type="url"
              placeholder="Enter category link (optional)"
              isInvalid={!!errors.link}
            />
            {errors.link && (
              <Form.Control.Feedback type="invalid">
                {errors.link.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="images">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              isInvalid={!!errors.images}
              accept="image/*"
            />
            {imagePreview && (
              <div className="mt-3">
                <Image
                  src={imagePreview}
                  alt="Category image preview"
                  width={200}
                  height={200}
                  className="rounded"
                  style={{ objectFit: 'cover' }}
                />
                <p className="mt-1">
                  {images instanceof File ? `${images.name} - ${(images.size / 1024).toFixed(2)} KB` : 'Current Image'}
                </p>
              </div>
            )}
            {errors.images && (
              <Form.Text className="text-danger">
                {errors.images.message}
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="products">
            <Form.Label>Products</Form.Label>
            <Form.Control
              {...register('products')}
              type="text"
              placeholder="Enter products (optional)"
              isInvalid={!!errors.products}
            />
            {errors.products && (
              <Form.Control.Feedback type="invalid">
                {errors.products.message}
              </Form.Control.Feedback>
            )}
          </Form.Group>

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Category'}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CategoryForm;