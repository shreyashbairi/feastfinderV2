import React, { useState } from 'react';
import { Image, View } from 'react-native'
import { API_BASE_URL } from '../../../config.js';

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        const username = email.split('@')[0]; // Create username from email

        try {
            const response = await fetch('${API_BASE_URL}/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username, // Username from the email
                    email: email,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Failed to register');
            }

            setSuccess(true);
            console.log('Registration successful:', data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex min-h-screen flex-col bg-gradient-to-tl from-ffRedL via-ffGreyL to-ffGreenL justify-center py-12 sm:px-6 lg:px-8">

                <div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-md justify-center items-center">
                    <Image
                        source={require('../images/FeastFinder-solid-circle.png')}
                        style={{
                            height: 90, 
                            width: 120,  // Increase the width proportionally
                        }}
                        />
                    <h2 className='mt-6 text-center text-5xl font-bold tracking-tight text-white'>
                        FeastFinder
                    </h2>
                    <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
                        Create a new account
                    </h2>
                    <p className='mt-2 text-center text-sm text-white'>
                        Already have an account?{" "}
                        <a
                            href='/account/login'
                            className='font-medium text-indigo-600 hover:text-indigo-500'
                        >
                            Login
                        </a>
                    </p>
                </div>

                <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
                    <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
                        <form className='space-y-6' onSubmit={handleSignup}>
                            <div>
                                <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                                    Email address
                                </label>
                                <div className='mt-1'>
                                    <input
                                        id='email'
                                        name='email'
                                        type='email'
                                        autoComplete='email'
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                                    Password
                                </label>
                                <div className='mt-1'>
                                    <input
                                        id='password'
                                        name='password'
                                        type='password'
                                        autoComplete='current-password'
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type='submit'
                                    className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                                    disabled={loading}
                                >
                                    {loading ? 'Creating account...' : 'Create account'}
                                </button>
                            </div>

                            {error && <p className='text-red-500 text-sm'>{error}</p>}
                            {success && <p className='text-green-500 text-sm'>Registration successful! You can now log in.</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
