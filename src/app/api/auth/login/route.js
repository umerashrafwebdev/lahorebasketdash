// app/api/auth/login/route.js
import axios from 'axios';

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await axios.post('https://api.g3studio.co/api/auth/login', {
      user: {
        email: body.user.email,
        password: body.user.password,
      },
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      maxBodyLength: Infinity,
    });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const message = error.response?.data?.error || error.message;
    return new Response(JSON.stringify({ error: message }), {
      status: error.response?.status || 500,
    });
  }
}