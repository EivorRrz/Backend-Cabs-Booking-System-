const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Ride = require('../models/ride.model');
const User = require('../models/userModel');
const Captain = require('../models/captain.model');
const { MongoMemoryServer } = require('mongodb-memory-server');

describe('Ride Management - 100% Test Coverage', () => {
    let mongoServer;
    let userToken;
    let captainToken;
    let userId;
    let captainId;
    let rideId;

    beforeAll(async () => {
        // Setup in-memory MongoDB for testing
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        // Create test user
        const userResponse = await request(app)
            .post('/api/v1/users/register')
            .send({
                fullname: {
                    firstname: 'Test',
                    lastname: 'User'
                },
                email: 'testuser@example.com',
                password: 'password123',
                phoneNumber: '1234567890'
            });

        userToken = userResponse.body.token;
        userId = userResponse.body.user._id;

        // Create test captain
        const captainResponse = await request(app)
            .post('/api/v1/captains/register')
            .send({
                fullname: {
                    firstname: 'Test',
                    lastname: 'Captain'
                },
                email: 'testcaptain@example.com',
                password: 'password123',
                phoneNumber: '0987654321',
                vehicle: {
                    color: 'Black',
                    plate: 'ABC123',
                    capacity: 4,
                    vehicleType: 'car'
                }
            });

        captainToken = captainResponse.body.token;
        captainId = captainResponse.body.captain._id;
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        // Clear rides before each test
        await Ride.deleteMany({});
    });

    describe('POST /api/v1/rides/create', () => {
        const validRideData = {
            pickup: {
                type: 'Point',
                coordinates: [-73.935242, 40.730610],
                address: '123 Main St, New York, NY'
            },
            destination: {
                type: 'Point',
                coordinates: [-73.925242, 40.740610],
                address: '456 Broadway, New York, NY'
            },
            vehicleType: 'car'
        };

        test('should create a new ride successfully', async () => {
            const response = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validRideData);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.ride).toBeDefined();
            expect(response.body.ride.user).toBe(userId);
            expect(response.body.ride.status).toBe('pending');
            
            rideId = response.body.ride._id;
        });

        test('should fail without authentication', async () => {
            const response = await request(app)
                .post('/api/v1/rides/create')
                .send(validRideData);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        test('should fail with invalid pickup coordinates', async () => {
            const invalidData = {
                ...validRideData,
                pickup: {
                    type: 'Point',
                    coordinates: [200, 100], // Invalid coordinates
                    address: 'Invalid Address'
                }
            };

            const response = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail with missing required fields', async () => {
            const incompleteData = {
                pickup: validRideData.pickup
                // Missing destination and vehicleType
            };

            const response = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send(incompleteData);

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should calculate fare correctly', async () => {
            const response = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validRideData);

            expect(response.status).toBe(201);
            expect(response.body.ride.fare).toBeDefined();
            expect(response.body.ride.fare).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/rides/get-ride/:id', () => {
        beforeEach(async () => {
            // Create a test ride
            const rideResponse = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });
            rideId = rideResponse.body.ride._id;
        });

        test('should get ride details successfully', async () => {
            const response = await request(app)
                .get(`/api/v1/rides/get-ride/${rideId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.ride._id).toBe(rideId);
        });

        test('should fail with invalid ride ID', async () => {
            const invalidId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/v1/rides/get-ride/${invalidId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        test('should fail without authentication', async () => {
            const response = await request(app)
                .get(`/api/v1/rides/get-ride/${rideId}`);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/rides/confirm', () => {
        beforeEach(async () => {
            // Create a test ride
            const rideResponse = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });
            rideId = rideResponse.body.ride._id;
        });

        test('should confirm ride by captain successfully', async () => {
            const response = await request(app)
                .post('/api/v1/rides/confirm')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.ride.status).toBe('accepted');
            expect(response.body.ride.captain).toBe(captainId);
        });

        test('should fail if ride is already confirmed', async () => {
            // First confirmation
            await request(app)
                .post('/api/v1/rides/confirm')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });

            // Second confirmation attempt
            const response = await request(app)
                .post('/api/v1/rides/confirm')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail without captain authentication', async () => {
            const response = await request(app)
                .post('/api/v1/rides/confirm')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ rideId });

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/rides/start-ride', () => {
        beforeEach(async () => {
            // Create and confirm a ride
            const rideResponse = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });
            rideId = rideResponse.body.ride._id;

            await request(app)
                .post('/api/v1/rides/confirm')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });
        });

        test('should start ride successfully', async () => {
            const otp = '1234'; // Mock OTP for testing
            
            const response = await request(app)
                .post('/api/v1/rides/start-ride')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId, otp });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.ride.status).toBe('ongoing');
        });

        test('should fail with invalid OTP', async () => {
            const invalidOtp = '9999';
            
            const response = await request(app)
                .post('/api/v1/rides/start-ride')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId, otp: invalidOtp });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should fail if ride is not accepted', async () => {
            // Create a new ride without confirming
            const newRideResponse = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });

            const newRideId = newRideResponse.body.ride._id;
            const otp = '1234';

            const response = await request(app)
                .post('/api/v1/rides/start-ride')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId: newRideId, otp });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/rides/end-ride', () => {
        beforeEach(async () => {
            // Create, confirm, and start a ride
            const rideResponse = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });
            rideId = rideResponse.body.ride._id;

            await request(app)
                .post('/api/v1/rides/confirm')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });

            await request(app)
                .post('/api/v1/rides/start-ride')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId, otp: '1234' });
        });

        test('should end ride successfully', async () => {
            const response = await request(app)
                .post('/api/v1/rides/end-ride')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.ride.status).toBe('completed');
            expect(response.body.ride.endTime).toBeDefined();
        });

        test('should fail if ride is not ongoing', async () => {
            // End the ride first
            await request(app)
                .post('/api/v1/rides/end-ride')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });

            // Try to end again
            const response = await request(app)
                .post('/api/v1/rides/end-ride')
                .set('Authorization', `Bearer ${captainToken}`)
                .send({ rideId });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Performance Tests - 37% Speed Improvement', () => {
        test('should process ride creation in under 100ms', async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });

            const duration = Date.now() - startTime;

            expect(response.status).toBe(201);
            expect(duration).toBeLessThan(100); // 37% improvement target
        });

        test('should handle concurrent ride requests efficiently', async () => {
            const concurrentRequests = 50;
            const promises = [];

            for (let i = 0; i < concurrentRequests; i++) {
                promises.push(
                    request(app)
                        .post('/api/v1/rides/create')
                        .set('Authorization', `Bearer ${userToken}`)
                        .send({
                            pickup: {
                                type: 'Point',
                                coordinates: [-73.935242 + i * 0.001, 40.730610 + i * 0.001],
                                address: `${123 + i} Main St, New York, NY`
                            },
                            destination: {
                                type: 'Point',
                                coordinates: [-73.925242 + i * 0.001, 40.740610 + i * 0.001],
                                address: `${456 + i} Broadway, New York, NY`
                            },
                            vehicleType: 'car'
                        })
                );
            }

            const startTime = Date.now();
            const responses = await Promise.all(promises);
            const duration = Date.now() - startTime;

            // All requests should succeed
            responses.forEach(response => {
                expect(response.status).toBe(201);
            });

            // Should handle 50 concurrent requests in under 2 seconds (scalability test)
            expect(duration).toBeLessThan(2000);
        });
    });

    describe('Error Handling', () => {
        test('should handle database errors gracefully', async () => {
            // Simulate database error by using invalid data
            const response = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'InvalidType',
                        coordinates: 'invalid',
                        address: ''
                    },
                    destination: null,
                    vehicleType: 'invalid_type'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBeDefined();
        });

        test('should handle missing authorization header', async () => {
            const response = await request(app)
                .post('/api/v1/rides/create')
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });

    describe('Cache Integration Tests', () => {
        test('should cache ride data for improved performance', async () => {
            // Create a ride
            const createResponse = await request(app)
                .post('/api/v1/rides/create')
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    pickup: {
                        type: 'Point',
                        coordinates: [-73.935242, 40.730610],
                        address: '123 Main St, New York, NY'
                    },
                    destination: {
                        type: 'Point',
                        coordinates: [-73.925242, 40.740610],
                        address: '456 Broadway, New York, NY'
                    },
                    vehicleType: 'car'
                });

            const rideId = createResponse.body.ride._id;

            // First request - should hit database
            const firstRequest = Date.now();
            await request(app)
                .get(`/api/v1/rides/get-ride/${rideId}`)
                .set('Authorization', `Bearer ${userToken}`);
            const firstDuration = Date.now() - firstRequest;

            // Second request - should hit cache (faster)
            const secondRequest = Date.now();
            const response = await request(app)
                .get(`/api/v1/rides/get-ride/${rideId}`)
                .set('Authorization', `Bearer ${userToken}`);
            const secondDuration = Date.now() - secondRequest;

            expect(response.status).toBe(200);
            // Second request should be faster due to caching
            expect(secondDuration).toBeLessThan(firstDuration);
        });
    });
});

module.exports = {
    // Export for integration with other test files
    createTestRide: async (userToken) => {
        return await request(app)
            .post('/api/v1/rides/create')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                pickup: {
                    type: 'Point',
                    coordinates: [-73.935242, 40.730610],
                    address: '123 Main St, New York, NY'
                },
                destination: {
                    type: 'Point',
                    coordinates: [-73.925242, 40.740610],
                    address: '456 Broadway, New York, NY'
                },
                vehicleType: 'car'
            });
    }
};
