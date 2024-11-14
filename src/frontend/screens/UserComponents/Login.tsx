import React, { useState } from "react";
import { Image, View } from 'react-native'
import { useAuth } from "./Authorizer.tsx";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config.js';

// import { coreForm } from '../CoreComponents/CoreStyles.tsx';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("Internal Issue");
  const {user, setUserToken} = useAuth();

  const navigate = useNavigate();

  const goToFeed = () => {
      navigate('/');  // Replaces navigation.navigate("Profile")
  };

  const example = async(e) => {
    e.preventDefault();
    setUserToken("emailToken", "email")
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsError(false);  // Reset error state

    try {
      const res = await fetch('${API_BASE_URL}/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('User logged in:', data);
        setUserToken(data.token, email);
        console.log(user);
        goToFeed()
        // Store token or redirect user
      } else {
        const errorData = await res.json();
        console.error('Error during login:', errorData);
        setIsError(true);  // Set error state on failure
        setErrorMsg(errorData.msg);
      }
    } catch (error) {
      console.error('Network error:', error);
      setIsError(true);  // Handle network error
      setErrorMsg("Network error")
    }
  };

  return (
    
    <div>
      {/* <CoreBanner /> */}
      <div className="flex min-h-screen flex-col bg-gradient-to-tl from-ffRedL via-ffGreyL to-ffGreenL justify-center py-12 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:mx-auto sm:w-full sm:max-w-md justify-center items-center">
          <Image
              source={require('../images/FeastFinder-solid-circle.png')}
              style={{
                height: 90, 
                width: 120,  // Increase the width proportionally
              }}
            />
          <h2 className="mt-3 text-center text-5xl font-bold tracking-tight text-white">
            FeastFinder
          </h2>
          <h2 className="mt-5 text-center text-3xl font-bold tracking-tight text-black">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{" "}
            <a
              href="/account/signup"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create an account
            </a>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {isError && (
                <div className="flex items-center">
                  <p className="text-red-500">Error during login: {errorMsg}. Try again.</p>
                </div>
              )}

              {/* <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot your password?
                  </a>
                </div>
              </div> */}

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
