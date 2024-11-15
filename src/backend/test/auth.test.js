import dotenv from 'dotenv';
dotenv.config();

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../models/User.js';
import { expect } from 'chai';

const MONGO_URI = process.env.MONGO_URI;

let token;
let testUser = {}; // Declare testUser variable

describe('Auth Routes', function () {
  this.timeout(5000);

  before(async function () {
    console.log('Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
  });

  after(async function () {
    // Close the database connection after all tests
    await mongoose.connection.close();
  });

  beforeEach(async function () {
    // Register a new user and obtain the token
    const timestamp = Date.now();
    const testEmail = `testuser_${timestamp}@example.com`;
    const testUsername = `TestUser_${timestamp}`;

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: testUsername,
        email: testEmail,
        password: 'password123',
      });

    token = res.body.token;
    testUser = {
      id: res.body.userId,
      email: testEmail,
      username: testUsername,
    };
  });

  
  afterEach(async function () {
    // comment this method out to keep users created from test
    if (testUser && testUser.email) {
      await User.findOneAndDelete({ email: testUser.email });
    }
  });

  describe('POST /api/auth/register', function () {
    it('should register a new user', async function () {
      const timestamp = Date.now();
      const testEmail = `newuser_${timestamp}@example.com`;
      const testUsername = `NewUser_${timestamp}`;

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsername,
          email: testEmail,
          password: 'password123',
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('token');

      // Optional: Clean up the created user
      await User.findOneAndDelete({ email: testEmail });
    });

    it('should not register an existing user', async function () {
      // Attempt to register the same user again
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUser.username,
          email: testUser.email, // Use the email of the user created in beforeEach
          password: 'password123',
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('msg', 'User already exists');
    });
  });

  describe('POST /api/auth/login', function () {
    it('should log in a user and return a token', async function () {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
    });

    it('should not log in a user with invalid credentials', async function () {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('msg', 'Invalid credentials');
    });
  });

  describe('GET /api/auth/me', function () {
    it('should return user details', async function () {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('username');
      expect(res.body).to.not.have.property('password');
    });

    it('should return 401 for invalid token', async function () {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('msg', 'Token is not valid');
    });
  });

  describe('PUT /api/auth/address', function () {
    it('should update the user address', async function () {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'Anystate',
        postalCode: '12345',
        country: 'USA',
      };

      const res = await request(app)
        .put('/api/auth/address')
        .set('Authorization', `Bearer ${token}`)
        .send(address);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('address');
      expect(res.body.address).to.include(address);
    });

    it('should not update address without authentication', async function () {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        state: 'Anystate',
        postalCode: '12345',
        country: 'USA',
      };

      const res = await request(app)
        .put('/api/auth/address')
        .send(address);

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property(
        'msg',
        'No token, authorization denied'
      );
    });

    it('should return error if address fields are missing', async function () {
      const address = {
        street: '123 Main St',
        city: 'Anytown',
        // Missing 'state' field
        postalCode: '12345',
        country: 'USA',
      };

      const res = await request(app)
        .put('/api/auth/address')
        .set('Authorization', `Bearer ${token}`)
        .send(address);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property(
        'msg',
        'Please provide all address fields'
      );
    });

    it('should retrieve updated address in user profile', async function () {
      const address = {
        street: '456 Elm St',
        city: 'Othertown',
        state: 'Otherstate',
        postalCode: '67890',
        country: 'USA',
      };

      // Update the address
      await request(app)
        .put('/api/auth/address')
        .set('Authorization', `Bearer ${token}`)
        .send(address);

      // Get the user profile
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('address');
      expect(res.body.address).to.include(address);
    });
  });
});
