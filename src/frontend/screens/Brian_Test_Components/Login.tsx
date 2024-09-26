import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
//import Router from "next/router";
import { useEffect, useState } from "react";
function Login() {

    //const { user, login, logout, updateCurrentUserInfo } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isError, setIsError] = useState(false);

    
    return (
    <div>
        <div className='flex min-h-full flex-col bg-white justify-center py-12 sm:px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
            {/* Replace with logo  */}
            <h2 className='mt-6 text-center text-5xl font-bold tracking-tight text-orange-400'>
            {" "}
            {/* Replace with expected Colors*/}
            FeastFinder
            </h2>
            <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-gray-900'>
            Login to your account
            </h2>
            <p className='mt-2 text-center text-sm text-gray-600'>
            Or{" "}
            <a
                href='/account/signup'
                className='font-medium text-indigo-600 hover:text-indigo-500'
            >
                create an account
            </a>
            </p>
        </div>

        <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
            <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10'>
            <form className='space-y-6' >
                <div>
                <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700'
                >
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
                <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700'
                >
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
                {isError && (
                <div className='flex items-center'>
                    <p className='text-red-500'>Error during login. Try again.</p>
                </div>
                )}

                <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                    <input
                    id='remember-me'
                    name='remember-me'
                    type='checkbox'
                    className='h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                    />
                    <label
                    htmlFor='remember-me'
                    className='ml-2 block text-sm text-gray-900'
                    >
                    Remember me
                    </label>
                </div>

                <div className='text-sm'>
                    <a
                    href='#'
                    className='font-medium text-indigo-600 hover:text-indigo-500'
                    >
                    Forgot your password?{" "}
                    {/* TODO: Add functionality from backend*/}
                    </a>
                </div>
                </div>

                <div>
                <button
                    type='submit'
                    className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                >
                    Login {/* TODO: Add functionality from backend*/}
                </button>
                </div>
            </form>
            <button
                onClick={() => {
                console.log("Clicked!")
                }}
                className='flex w-full justify-center rounded-md border border-transparent bg-indigo-600 my-2 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
                Temporal Logout {/* TODO: Add functionality from backend*/}
            </button>
            </div>
        </div>
        </div>
    </div>
    );
}


export default Login;