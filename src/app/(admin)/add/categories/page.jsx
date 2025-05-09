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
  images: yup.mixed().required('An image is required'),
  products: yup.string().default(''),
});

const CategoryForm = () => {
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
  const [imagePreview, setImagePreview] = useState(null); // State for image preview URL

  const onSubmit = async (data) => {
    console.log('Submitting data:', data);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.link) formData.append('link', data.link);
      formData.append('images', data.images);
      formData.append('products', data.products || '');

      for (let [key, value] of formData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      const response = await axios.post('http://52.74.115.234:5000/api/categories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Cookie': 'connect.sid=s%3AWTaWTVo_2u7uckzBSR-PZ37Sa9b-bs1Z.Z73xy7vn5XDKQX%2FWOyLYC0WauCMJ3em75dLS%2FT4FuzQ',
        },
      });

      console.log('Category Created:', response.data);
      reset();
      setImagePreview(null); // Clear preview on reset
    } catch (error) {
      console.error('Error creating category:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
  };

  // Register images field
  useEffect(() => {
    register('images');
  }, [register]);

  // Debug images and update preview
  useEffect(() => {
    console.log('Watched images:', images);
    if (images) {
      const previewUrl = URL.createObjectURL(images);
      setImagePreview(previewUrl);
      // Cleanup previous URL if it exists
      return () => URL.revokeObjectURL(previewUrl);
    } else {
      setImagePreview(null);
    }
  }, [images]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    setValue('images', file, { shouldValidate: true });
    trigger('images');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h4">Create Category</CardTitle>
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
              accept="image/*" // Restrict to image files
            />
            {imagePreview && (
              <div className="mt-3">
                <Image
                  src={imagePreview}
                  alt="Uploaded preview"
                  width={200} // Adjust size as needed
                  height={200}
                  className="rounded"
                  style={{ objectFit: 'cover' }}
                />
                <p className="mt-1">
                  {images.name} - {(images.size / 1024).toFixed(2)} KB
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
            {isSubmitting ? 'Creating...' : 'Create Category'}
          </Button>
        </Form>
      </CardBody>
    </Card>
  );
};

export default CategoryForm;