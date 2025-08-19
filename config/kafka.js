const { Kafka } = require('kafkajs');
const winston = require('winston');

// Enhanced Kafka configuration for scalable event-driven architecture
class KafkaManager {
    constructor() {
        this.kafka = null;
        this.producer = null;
        this.consumer = null;
        this.isConnected = false;
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/kafka.log' })
            ]
        });
    }

    async initialize() {
        try {
            // Kafka configuration for high throughput
            this.kafka = new Kafka({
                clientId: process.env.KAFKA_CLIENT_ID || 'cab-booking-service',
                brokers: process.env.KAFKA_BROKERS 
                    ? process.env.KAFKA_BROKERS.split(',') 
                    : ['localhost:9092'],
                retry: {
                    initialRetryTime: 100,
                    retries: 8,
                    maxRetryTime: 30000,
                    factor: 2
                },
                connectionTimeout: 3000,
                requestTimeout: 30000,
                // SSL and SASL configuration for production
                ssl: process.env.KAFKA_SSL === 'true',
                sasl: process.env.KAFKA_USERNAME ? {
                    mechanism: 'plain',
                    username: process.env.KAFKA_USERNAME,
                    password: process.env.KAFKA_PASSWORD
                } : undefined
            });

            // Initialize producer with optimized settings
            this.producer = this.kafka.producer({
                maxInFlightRequests: 1,
                idempotent: true,
                transactionTimeout: 30000,
                // Batch settings for better throughput
                allowAutoTopicCreation: false,
                compression: 'gzip'
            });

            // Initialize consumer
            this.consumer = this.kafka.consumer({
                groupId: process.env.KAFKA_GROUP_ID || 'cab-booking-group',
                sessionTimeout: 30000,
                rebalanceTimeout: 60000,
                heartbeatInterval: 3000,
                maxBytesPerPartition: 1048576,
                minBytes: 1,
                maxBytes: 10485760,
                maxWaitTimeInMs: 5000
            });

            await this.producer.connect();
            await this.consumer.connect();

            this.isConnected = true;
            this.logger.info('✅ Kafka Client Connected Successfully');

            return true;
        } catch (error) {
            this.logger.error('❌ Kafka Connection Failed:', error);
            throw error;
        }
    }

    // High-performance message publishing
    async publishEvent(topic, message, key = null) {
        try {
            if (!this.isConnected) {
                throw new Error('Kafka not connected');
            }

            const startTime = Date.now();
            
            await this.producer.send({
                topic,
                messages: [{
                    key: key || message.id || null,
                    value: JSON.stringify({
                        ...message,
                        timestamp: new Date().toISOString(),
                        service: 'cab-booking-service'
                    }),
                    headers: {
                        'content-type': 'application/json',
                        'source': 'cab-booking-backend'
                    }
                }]
            });

            const duration = Date.now() - startTime;
            this.logger.info(`Event published to ${topic} - ${duration}ms`);
            
            return true;
        } catch (error) {
            this.logger.error('Failed to publish event:', error);
            throw error;
        }
    }

    // Batch publishing for better performance
    async publishBatch(topic, messages) {
        try {
            if (!this.isConnected) {
                throw new Error('Kafka not connected');
            }

            const startTime = Date.now();
            
            const kafkaMessages = messages.map(message => ({
                key: message.key || message.id || null,
                value: JSON.stringify({
                    ...message,
                    timestamp: new Date().toISOString(),
                    service: 'cab-booking-service'
                }),
                headers: {
                    'content-type': 'application/json',
                    'source': 'cab-booking-backend'
                }
            }));

            await this.producer.send({
                topic,
                messages: kafkaMessages
            });

            const duration = Date.now() - startTime;
            this.logger.info(`Batch of ${messages.length} events published to ${topic} - ${duration}ms`);
            
            return true;
        } catch (error) {
            this.logger.error('Failed to publish batch events:', error);
            throw error;
        }
    }

    // Event subscription with automatic retry
    async subscribe(topics, messageHandler) {
        try {
            if (!this.isConnected) {
                throw new Error('Kafka not connected');
            }

            await this.consumer.subscribe({ 
                topics: Array.isArray(topics) ? topics : [topics],
                fromBeginning: false 
            });

            await this.consumer.run({
                eachMessage: async ({ topic, partition, message }) => {
                    const startTime = Date.now();
                    
                    try {
                        const parsedMessage = JSON.parse(message.value.toString());
                        await messageHandler(topic, parsedMessage, {
                            partition,
                            offset: message.offset,
                            timestamp: message.timestamp,
                            key: message.key?.toString()
                        });

                        const duration = Date.now() - startTime;
                        this.logger.debug(`Message processed from ${topic} - ${duration}ms`);
                        
                    } catch (error) {
                        this.logger.error('Message processing failed:', error);
                        // Implement dead letter queue logic here
                        await this.handleFailedMessage(topic, message, error);
                    }
                }
            });

            this.logger.info(`Subscribed to topics: ${Array.isArray(topics) ? topics.join(', ') : topics}`);
            
        } catch (error) {
            this.logger.error('Failed to subscribe to topics:', error);
            throw error;
        }
    }

    async handleFailedMessage(topic, message, error) {
        try {
            // Send to dead letter queue
            const dlqTopic = `${topic}.dlq`;
            await this.publishEvent(dlqTopic, {
                originalTopic: topic,
                originalMessage: message.value.toString(),
                error: error.message,
                failedAt: new Date().toISOString()
            });
            
            this.logger.warn(`Message sent to DLQ: ${dlqTopic}`);
        } catch (dlqError) {
            this.logger.error('Failed to send message to DLQ:', dlqError);
        }
    }

    // Graceful shutdown
    async disconnect() {
        try {
            if (this.producer) {
                await this.producer.disconnect();
            }
            if (this.consumer) {
                await this.consumer.disconnect();
            }
            this.isConnected = false;
            this.logger.info('Kafka connections closed gracefully');
        } catch (error) {
            this.logger.error('Error closing Kafka connections:', error);
        }
    }
}

// Event types for the cab booking system
const EVENTS = {
    RIDE: {
        REQUESTED: 'ride.requested',
        ACCEPTED: 'ride.accepted',
        STARTED: 'ride.started',
        COMPLETED: 'ride.completed',
        CANCELLED: 'ride.cancelled',
        DRIVER_ASSIGNED: 'ride.driver_assigned'
    },
    USER: {
        REGISTERED: 'user.registered',
        LOCATION_UPDATED: 'user.location_updated',
        PROFILE_UPDATED: 'user.profile_updated'
    },
    DRIVER: {
        REGISTERED: 'driver.registered',
        STATUS_CHANGED: 'driver.status_changed',
        LOCATION_UPDATED: 'driver.location_updated',
        AVAILABILITY_CHANGED: 'driver.availability_changed'
    },
    PAYMENT: {
        INITIATED: 'payment.initiated',
        COMPLETED: 'payment.completed',
        FAILED: 'payment.failed',
        REFUNDED: 'payment.refunded'
    },
    NOTIFICATION: {
        PUSH_SENT: 'notification.push_sent',
        SMS_SENT: 'notification.sms_sent',
        EMAIL_SENT: 'notification.email_sent'
    }
};

// Event publishing service for business logic
class EventPublisher {
    static async publishRideEvent(eventType, rideData) {
        const kafkaManager = require('./kafka').kafkaManager;
        return await kafkaManager.publishEvent(eventType, {
            id: rideData.id || rideData._id,
            type: eventType,
            data: rideData,
            version: '1.0'
        });
    }

    static async publishUserEvent(eventType, userData) {
        const kafkaManager = require('./kafka').kafkaManager;
        return await kafkaManager.publishEvent(eventType, {
            id: userData.id || userData._id,
            type: eventType,
            data: userData,
            version: '1.0'
        });
    }

    static async publishDriverEvent(eventType, driverData) {
        const kafkaManager = require('./kafka').kafkaManager;
        return await kafkaManager.publishEvent(eventType, {
            id: driverData.id || driverData._id,
            type: eventType,
            data: driverData,
            version: '1.0'
        });
    }

    static async publishBatchEvents(events) {
        const kafkaManager = require('./kafka').kafkaManager;
        const groupedEvents = events.reduce((acc, event) => {
            if (!acc[event.topic]) acc[event.topic] = [];
            acc[event.topic].push(event);
            return acc;
        }, {});

        const promises = Object.entries(groupedEvents).map(([topic, topicEvents]) => 
            kafkaManager.publishBatch(topic, topicEvents)
        );

        return await Promise.all(promises);
    }
}

// Singleton instance
const kafkaManager = new KafkaManager();

module.exports = {
    kafkaManager,
    EventPublisher,
    EVENTS
};
