import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext.tsx'; // Corrected path
import CoreBanner from '../CoreComponents/CoreBanner.tsx'; // Corrected path
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../../../types/Cart'; // Adjusted path
import { useAuth } from '../UserComponents/Authorizer.tsx'; // Authentication hook
import CorePopup from '../CoreComponents/CorePopup.tsx'; // Popup component for login
import { coreForm, ffColors } from '../CoreComponents/CoreStyles.tsx'; // Import colors for consistent styling
import { API_BASE_URL } from '../../../config.js';

const CartPage: React.FC = () => {
  const { cart, clearCart } = useCart(); // Destructure clearCart from useCart
  const navigate = useNavigate();
  const { user } = useAuth(); // Authentication context

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [errPop, setErrPop] = useState(false);
  const [errText, setErrText] = useState('Error Undefined');
  const [loginPop, setLoginPop] = useState(false);
  const [buttonService, setButtonService] = useState<string>('Error Undefined'); // Ensure it's string type
  const [holdCartData, setHoldCartData] = useState<any | null>(null); // Store cart data for later processing
  const [userValue, setUserValue] = useState(''); // Store username input
  const [passValue, setPassValue] = useState(''); // Store password input

  // Redirect to home if cart is empty
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/home');
    }
  }, [cart, navigate]);

  // Function to calculate total for a specific service
  const calculateServiceTotal = (service: string) => {
    return cart?.items.reduce((total: number, item: CartItem) => {
      console.log(service, cart.service)
      const discount = cart.discount ?? 0;
      const price = item.prices[service.toLowerCase()]; // We still lower-case the key lookup here since the backend data uses lowercase keys
      return total + (price * item.quantity);
    }, 0);
  };

  // Function to calculate total for a specific service
  // use cart.service to see if the discount should be applied to this service or not.
  const calculateAfterDiscountTotal = (service: string) => {
    if (service.toLowerCase() != cart?.service.toLowerCase()) return calculateServiceTotal(service);
    return cart?.items.reduce((total: number, item: CartItem) => {
      const discount = cart.discount ?? 0;
      const price = item.prices[service.toLowerCase()]; // We still lower-case the key lookup here since the backend data uses lowercase keys
      return total + (price * item.quantity * (100 - discount) / 100);
    }, 0);
  };

  const resetUserPass = () => {
    setUserValue('');
    setPassValue('');
  };

  const checkLogin = async (service: string) => {
    let fetchAddr = `${API_BASE_URL}/api/auth/app-status`;
    
    try {
      const res = await fetch(fetchAddr, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
      });
      if (res.ok) {
        const data = await res.json();
        let isStored;
        console.log(service + "Hello")
        switch (service) {
          case "doordash":
              isStored = data.doordash_logged_in;
              break;
          case "grubhub":
              isStored = data.grubhub_logged_in;
              break;
          case "ubereats":
              isStored = data.uber_logged_in;
              break;
          default:
            console.error("switchFailure");
            setErrText(
              "Internal Service Error\nDelivery Service not recognized"
            );
            setErrPop(true);
            return false;
        }

        if (isStored) {
          return true;
        } else {
          setButtonService(service);
          setHoldCartData(cart);
          setLoginPop(true);
          return false;
        }
      } else {
        const errorData = await res.json();
        setErrText(errorData.msg);
        setErrPop(true);
        return false;
      }
    } catch (error) {
      setErrText("Network error\nCheck internet connection");
      setErrPop(true);
      return false;
    }
  };

  const popSubmitHandler = async () => {
    if (!userValue) {
      setErrText("Username Blank");
      setErrPop(true);
      return;
    } else if (!passValue) {
      setErrText("Password Blank");
      setErrPop(true);
      return;
    }

    try {
      let response;
      var fetchAddr = `${API_BASE_URL}/api/auth/app-login`;
      response = await fetch(fetchAddr, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + user.token,
        },
        body: JSON.stringify({
          email: userValue,
          password: passValue,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Failed to register");
      }
      console.log(buttonService)
      switch (buttonService) {
        case "doordash":
            localStorage.setItem("doordash_token", data.token);
            break;
        case "grubhub":
            localStorage.setItem("grubhub_token", data.token);
            break;
        case "ubereats":
            localStorage.setItem("ubereats_token", data.token);
            break;
        default:
            console.error('switchFailure');
            return;
    }

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to login');
      }

      setLoginPop(false);
      setButtonService('Error Undefined');
      resetUserPass();

      await proceedToCheckout(buttonService, holdCartData);
    } catch (err) {
      setErrText(err.message || 'Login failed');
      setErrPop(true);
    }
  };  

  const proceedToCheckout = async (serviceName: string, cartData: any) => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        alert('You are not logged in. Please log in to proceed.');
        return;
      }

      const user = JSON.parse(userData);
      const token = user.token;

      const response = await fetch(`${API_BASE_URL}/api/cartroute/cart/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...cartData, service: serviceName }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response from server:', data);
        alert(`Error: ${data.message}`);
        return;
      }

      window.open(getServiceURL(serviceName), '_blank');
      clearCart();
      navigate('/home');
    } catch (error) {
      alert('An unexpected error occurred while saving the cart.');
    }
  };

  const handleCheckout = async (serviceName: string) => {
    const isLoggedIn = await checkLogin(serviceName);

    if (isLoggedIn) {
      window.open(getServiceURL(serviceName), '_blank');
      await proceedToCheckout(serviceName, cart);
    }
  };

  const getServiceURL = (serviceName: string) => {
    switch (serviceName) {
      case 'ubereats':
        return 'https://www.ubereats.com';
      case 'doordash':
        return 'https://www.doordash.com';
      case 'grubhub':
        return 'https://www.grubhub.com';
      default:
        return '#';
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return (
    <div
      style={{backgroundColor: ffColors.ffBackground, height: '100vh'}}
    >
      <CoreBanner />
      <div className="container mx-auto p-4">
        <h1 
          className="text-2xl font-bold mb-4"
          style={{color: ffColors.ffText}}
        >
          Your Cart
        </h1>

        {['DoorDash', 'UberEats', 'Grubhub'].map((service) => {
          const serviceAvailable = cart.restaurant[`${service.toLowerCase()}Available`];
          const serviceTotal = calculateServiceTotal(service);
          const discountTotal = calculateAfterDiscountTotal(service);
          return (
            <div 
              key={service} 
              className="border p-4 mb-4"
              style={coreForm.card}
            >
              <h2 
                className="text-xl font-semibold mb-2"
                style={coreForm.header}
              >
                {service}
              </h2>
              {serviceAvailable ? (
                <div
                  style={coreForm.body}
                >
                  <ul>
                    {cart.items.map((item: CartItem, index: number) => (
                      <li 
                        key={index} 
                        className="flex justify-between"
                      >
                        <span>
                          <p
                            style={{color: ffColors.ffBody}}
                          >
                            {item.item} x {item.quantity}
                          </p>
                        </span>
                        <span>
                          <p
                            style={{color: ffColors.ffBody}}
                          >
                            ${(item.prices[service.toLowerCase()] * item.quantity).toFixed(2)}
                          </p>
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-bold mt-2">
                    <p style={{ color: ffColors.ffHeading }}>Total:</p>
                      <div className="flex items-center">
                        {serviceTotal !== discountTotal && (
                          <p 
                            className="text-gray-500 line-through mr-2"
                            style={{ color: ffColors.ffText }}
                          >
                            ${serviceTotal?.toFixed(2)}
                          </p>
                        )}
                        <p style={{ color: ffColors.ffHeading }}>
                          ${discountTotal?.toFixed(2)}
                        </p>
                      </div>
                  </div>
                  <button
                    onClick={() => handleCheckout(service.toLowerCase())}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                    style={{backgroundColor: ffColors.ffGreenL}}
                  >
                    Checkout with {service}
                  </button>
                </div>
              ) : (
                <p
                  style={{color: ffColors.ffBody}}
                >
                  Not Available
                </p>
              )}
            </div>
          );
        })}
      </div>

      <CorePopup
        pop={errPop}
        popTitle={"Error:"}
        popText={errText}
        closeFunc={() => setErrPop(false)}
        titleColor={ffColors.ffRedL}
        buttons={[
          {
            bText: 'Close',
            bColor: ffColors.ffRedL,
            bFunc: () => setErrPop(false),
          },
        ]}
      />

      <CorePopup
        pop={loginPop}
        popTitle={`Not logged into ${buttonService}:`}
        popText={""}
        closeFunc={() => setLoginPop(false)}
        titleColor={ffColors.ffRedL}
        buttons={[
          {
            bText: 'Submit',
            bColor: ffColors.ffGreenL,
            bFunc: popSubmitHandler,
          },
          {
            bText: 'Close',
            bColor: ffColors.ffRedL,
            bFunc: () => {
              setLoginPop(false);
              resetUserPass();
            },
          },
        ]}
      >
        <div style={styles.loginContainer}>
          <div style={styles.popupText}>Login:</div>
          <input
            type="text"
            style={styles.popInput}
            value={userValue}
            onChange={(event) => setUserValue(event.target.value)}
            placeholder="Username..."
          />
          <input
            type="password"
            style={styles.popInput}
            value={passValue}
            onChange={(event) => setPassValue(event.target.value)}
            placeholder="Password..."
          />
        </div>
      </CorePopup>
    </div>
  );
};

// Adding styles for the CartPage login popup from SearchCards
const styles = {
  loginContainer: {
    marginTop: 0,
    margin: 20,
  },
  popupText: {
    marginBottom: 10,
    fontSize: 15,
    fontWeight: 'bold',
  },
  popInput: {
    height: 'auto',
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    width: '100%',
  },
};

export default CartPage;
