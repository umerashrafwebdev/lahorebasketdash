'use client';

import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import TextFormInput from '@/components/from/TextFormInput';
import { useNotificationContext } from '@/context/useNotificationContext';
import Image from 'next/image';
import Link from 'next/link';
import DarkLogo from '@/assets/images/logo-dark.png';
import LightLogo from '@/assets/images/logo-light.png';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const SignIn = () => {
  const { showNotification } = useNotificationContext() || {
    showNotification: (msg) => alert(msg?.message),
  };
  const router = useRouter();

  useEffect(() => {
    document.body.classList.add('authentication-bg');
    return () => document.body.classList.remove('authentication-bg');
  }, []);

  const { handleSubmit, control } = useForm({
    defaultValues: { email: '', password: '' },
    resolver: yupResolver(schema),
  });

  const handleLogin = async (data) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: data }),
      });

      const result = await res.json();

      if (res.ok) {
        showNotification({ message: 'Welcome!', variant: 'success' });
        if (result.token) localStorage.setItem('token', result.token);
        router.push('/dashboards');
      } else {
        showNotification({ message: result.error || 'Login failed', variant: 'danger' });
      }
    } catch (err) {
      console.error(err);
      showNotification({ message: 'Something went wrong', variant: 'danger' });
    }
  };

  return (
    <div className="authentication-bg">
      <div className="account-pages py-5">
        <div className="container">
          <Row className="justify-content-center">
            <Col md={6} lg={5}>
              <Card className="border-0 shadow-lg">
                <CardBody className="p-5">
                  <div className="text-center">
                    <div className="mx-auto mb-4 auth-logo">
                      <Link href="/" className="logo-dark">
                        <Image src={DarkLogo} width={100} height={32} alt="logo dark" />
                      </Link>
                      <Link href="/" className="logo-light">
                        <Image src={LightLogo} width={100} height={28} alt="logo light" />
                      </Link>
                    </div>
                    <h4 className="fw-bold text-dark mb-2">Welcome Back!</h4>
                    <p className="text-muted">Sign in to your account to continue</p>
                  </div>
                  <form onSubmit={handleSubmit(handleLogin)} className="mt-4">
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="email"
                        placeholder="Enter your email"
                        className="form-control"
                        label="Email Address"
                      />
                    </div>
                    <div className="mb-3">
                      <TextFormInput
                        control={control}
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        className="form-control"
                        label="Password"
                      />
                    </div>
                    <div className="form-check mb-3">
                      <input type="checkbox" className="form-check-input" id="remember-me" />
                      <label className="form-check-label" htmlFor="remember-me">Remember me</label>
                    </div>
                    <div className="d-grid">
                      <button className="btn btn-dark btn-lg fw-medium" type="submit">
                        Sign In
                      </button>
                    </div>
                  </form>
                </CardBody>
              </Card>
              <p className="text-center mt-4 text-white text-opacity-50">
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="text-decoration-none text-white fw-bold">
                  Sign Up
                </Link>
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
