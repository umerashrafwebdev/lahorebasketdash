'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Alert } from 'react-bootstrap';

const BannerForm = () => {
    const [link, setLink] = useState('');
    const [position, setPosition] = useState('1');
    const [type, setType] = useState('general');
    const [status, setStatus] = useState('active');
    const [images, setImages] = useState([]);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(null);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        console.log('Selected files:', files);
        setImages(files);
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        setSubmitSuccess(null);

        const formData = new FormData();
        formData.append('link', link);
        formData.append('position', position);
        formData.append('type', type);
        formData.append('status', status);
        images.forEach((image) => formData.append('images', image));

        for (let [key, value] of formData.entries()) {
            console.log(`FormData - ${key}: ${value}`);
        }

        try {
            const response = await axios.post('https://api.g3studio.co/api/banners', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Response status:', response.status);
            console.log('Response data:', response.data);
            setSubmitSuccess('Banner created successfully!');
        } catch (error) {
            console.error('Axios error:', error);
            if (error.response) {
                console.log('Response status:', error.response.status);
                console.log('Response data:', error.response.data);
                setSubmitError(`${error.response.data.error || 'Failed to create banner'}${error.response.data.details ? `: ${error.response.data.details}` : ''}`);
            } else if (error.request) {
                console.log('No response received:', error.request);
                setSubmitError('Network error: No response from server');
            } else {
                console.log('Error message:', error.message);
                setSubmitError(`Request error: ${error.message}`);
            }
        }
    };

    return (
        <Form onSubmit={onSubmit}>
            {submitError && <Alert variant="danger">{submitError}</Alert>}
            {submitSuccess && <Alert variant="success">{submitSuccess}</Alert>}
            <Form.Group>
                <Form.Label>Link (Optional)</Form.Label>
                <Form.Control value={link} onChange={(e) => setLink(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Position</Form.Label>
                <Form.Control type="number" value={position} onChange={(e) => setPosition(e.target.value)} />
            </Form.Group>
            <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="general">General</option>
                    <option value="discount">Discount</option>
                    <option value="homepage">Homepage</option>
                    <option value="fourinone">Four-in-One</option>
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </Form.Select>
            </Form.Group>
            <Form.Group>
                <Form.Label>Images</Form.Label>
                <Form.Control type="file" name="images" multiple onChange={handleFileChange} />
            </Form.Group>
            <Button type="submit">Create Banner</Button>
        </Form>
    );
};

export default BannerForm;