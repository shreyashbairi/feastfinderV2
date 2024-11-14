import React, { useState, useEffect } from 'react';
import { useCart } from '../RestPageComponents/CartContext.tsx';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../config.js';

interface Dish {
    dishName: string;
    restaurantNames: string[];
    image?: string;
    ubereatsAvailable: boolean;
    doordashAvailable: boolean;
    grubhubAvailable: boolean;
  }

const DishRecommendations = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, updateCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const randomLetter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        const response = await fetch(`${API_BASE_URL}/api/searchDish?name=${randomLetter}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setDishes(data.slice(0, 8));
          setError(null);
        } else {
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching dishes:', error);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  const handleAddToCart = (dish) => {
    // Find the restaurant object from the first restaurant in restaurantNames
    const restaurant = {
      restaurantName: dish.restaurantNames[0],
      ubereatsAvailable: dish.ubereatsAvailable,
      doordashAvailable: dish.doordashAvailable,
      grubhubAvailable: dish.grubhubAvailable,
    };

    const newItem = {
      item: dish.dishName,
      quantity: 1,
      prices: {
        ubereats: 10.99, // You'll need to add actual prices to your dish data
        doordash: 10.99,
        grubhub: 10.99
      }
    };

    const updatedCart = cart ? {
        ...cart,
        items: [...cart.items, newItem]
      } : {
        restaurant,
        items: [newItem],
        quantities: [1],              
        service: 'ubereats',         
        total: 10.99                 
      };
    
    updateCart(updatedCart);
    navigate('/cart');
  };

  if (loading) return <div className="p-4">Loading reccomendations...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!dishes.length) return <div className="p-4">No dishes found</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Reccomended for you</h2>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
          {dishes.map((dish, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden" style={{ width: '200px' }}>
              <img
                src={dish.image || "/api/placeholder/300/200"}
                alt={dish.dishName}
                className="w-full h-32 object-cover"
              />
              <div className="p-3">
                <h3 className="font-semibold text-base truncate">{dish.dishName}</h3>
                <p className="text-gray-600 text-sm truncate">at {dish.restaurantNames[0]}</p>
                <button 
                  className="mt-2 w-full bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700"
                  onClick={() => handleAddToCart(dish)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DishRecommendations;