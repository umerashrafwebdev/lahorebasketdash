'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';

const SubCategoryForm = () => {
    const [title, setTitle] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [images, setImages] = useState([]);
    const [categories, setCategories] = useState([]);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('https://api.g3studio.co/api/categories');
                const fetchedCategories = response.data.categories || [];
                setCategories(fetchedCategories);
                // Set default categoryId if categories exist
                if (fetchedCategories.length > 0) {
                    setCategoryId(fetchedCategories[0].id.toString());
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        console.log('Selected files:', files);
        setImages(files);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(null);

        // Client-side validation
        if (!title.trim() || !categoryId) {
            setSubmitError('Title and categoryId are required');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('categoryId', categoryId);
        images.forEach((image) => formData.append('images', image));

        for (let [key, value] of formData.entries()) {
            console.log(`FormData - ${key}: ${value}`);
        }

        try {
            const response = await axios.post('https://api.g3studio.co/api/subcategories', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            setSubmitSuccess('Subcategory created successfully!');
            setTitle('');
            setCategoryId(categories.length > 0 ? categories[0].id.toString() : ''); // Reset to default
            setImages([]);
        } catch (error) {
            console.error('Axios error:', error);
            if (error.response) {
                setSubmitError(`${error.response.data.error || 'Failed to create subcategory'}${error.response.data.details ? `: ${error.response.data.details}` : ''}`);
            } else if (error.request) {
                console.log('No response received:', error.request);
                setSubmitError('Network error: No response from server');
            } else {
                setSubmitError(`Request error: ${error.message}`);
            }
        }
    };

    return (
        <Form onSubmit={onSubmit}>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}
            <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter subcategory title"
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.title} {/* Changed from 'title' assuming category has 'name' */}
                        </option>
                    ))}
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Form.Label>Image (Optional)</Form.Label>
                <Form.Control
                    type="file"
                    name="images"
                    onChange={handleFileChange}
                />
            </Form.Group>
            <Button type="submit" disabled={!title.trim() || !categoryId}>
                Create Subcategory
            </Button>
        </Form>
    );
};

export default SubCategoryForm;