import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './dbConnect.js'; // Import the connection module
import User from './models/User.js';  
import restaurantData from './restaurantData.js'; 
import Restaurant from './models/Restaurant.js';
import cors from 'cors';
import authRoutes from './routes/auth.js'; 
import restaurantAuthRoutes from './routes/restaurantAuth.js'; // Import your restaurant routes
import addressRoutes from './routes/address.js';
import preferencesRoutes from './routes/preferences.js'; // Import preferences routes
import chatRoutes from './routes/chat.js';
import diningHallsRoutes from './routes/dininghalls.js';
import locationRoutes from './routes/location.js';
import Cart from './models/Cart.js'; // Import the Cart model
import cartRoutes from './routes/cartroute.js'; // Import the cart route
import restaurantRoutes from './routes/restaurantAuth.js';
import reviewRoutes from './routes/reviews.js';
import Review from './models/Review.js';



dotenv.config();

const app = express();


app.use(express.json());

app.use(cors({
  origin: ['http://localhost:3000', 'https://feastfinderapp.netlify.app'],  
  credentials: true, // If you need to send cookies or other credentials
}));

// Routes
app.use('/api/auth', authRoutes); 
app.use('/api/address', addressRoutes);
app.use('/api/preferences', preferencesRoutes); // Preferences-related routes
app.use('/api/chat', chatRoutes);
app.use('/api/dining-halls', diningHallsRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/restaurantAuth', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);
// Use the restaurant routes
app.use('/api', restaurantAuthRoutes);
app.use('/api/cartroute', cartRoutes); // Use the cart routes for checkout
app.get('/', (req, res) => {
  res.send('API is running...');
});




// Function to populate database with test users
const populateUsers = async () => {
  try {
    // Check if any users already exist to avoid duplication
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Users already exist in the database.');
      return;
    }

    // Array of test users
    const testUsers = [
      { username: 'user1', email: 'user1_test@example.com', password: 'password1' },
      { username: 'user2', email: 'user2_test@example.com', password: 'password2' },
      { username: 'user3', email: 'user3_test@example.com', password: 'password3' },
      { username: 'user4', email: 'user4_test@example.com', password: 'password4' }
    ];

    // Insert test users into the database
    await User.insertMany(testUsers);
    console.log('Test users have been added to the database.');
  } catch (err) {
    console.error('Error populating users:', err);
  }
};

const dropReviewIndexes = async () => {
  try {
    console.log('Attempting to drop indexes from reviews collection...');
    await mongoose.connection.collection('reviews').dropIndexes();
    console.log('Successfully dropped indexes from reviews collection');
  } catch (error) {
    console.log('No indexes to drop or already dropped:', error.message);
  }
};

// Function to populate the database with restaurant data
const populateRestaurants = async () => {
  try {
    const existingRestaurants = await Restaurant.find({});
    
    // Only insert restaurants that don't already exist in the database
    const newRestaurants = restaurantData.filter(
      newRestaurant => !existingRestaurants.some(
        existingRestaurant => existingRestaurant.restaurantID === newRestaurant.restaurantID
      )
    );

    if (newRestaurants.length > 0) {
      await Restaurant.insertMany(newRestaurants);
      console.log('New restaurant data has been added to the database.');
    } else {
      console.log('No new restaurants to add.');
    }
  } catch (err) {
    console.error('Error populating restaurants:', err);
  }
};

const populateInitialReviews = async () => {
  try {
    // Check if reviews already exist
    const reviewCount = await Review.countDocuments();
    if (reviewCount > 0) {
      console.log('Reviews already exist in the database.');
      return;
    }

    // Get all restaurants
    const restaurants = await Restaurant.find({});
    
    // Create some initial reviews for each restaurant
    const initialReviews = [];
    
    for (const restaurant of restaurants) {
      // Add 2-3 initial reviews per restaurant
      initialReviews.push({
        restaurantID: restaurant.restaurantID,
        username: 'InitialReviewer1',
        rating: 4,
        reviewText: `Initial review for ${restaurant.restaurantName}. Great place!`,
        createdAt: new Date()
      });
      
      initialReviews.push({
        restaurantID: restaurant.restaurantID,
        username: 'InitialReviewer2',
        rating: 5,
        reviewText: `Another initial review for ${restaurant.restaurantName}. Excellent service!`,
        createdAt: new Date()
      });
    }

    // Insert the initial reviews
    await Review.insertMany(initialReviews);
    console.log('Initial reviews have been added to the database.');
  } catch (err) {
    console.error('Error populating initial reviews:', err);
  }
};

console.log(process.env.MONGO_URI); 

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB(); // Establish MongoDB connection
  await dropReviewIndexes();
  //await populateUsers();
  await populateRestaurants();
  await populateInitialReviews();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();




export default app;