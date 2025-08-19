const winston = require('winston');

// Performance monitoring middleware for 37% speed improvement tracking
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/performance.log' })
    ]
});

const performanceMonitor = (req, res, next) => {
    const startTime = Date.now();
    const startCpuUsage = process.cpuUsage();
    const startMemory = process.memoryUsage();

    // Generate unique request ID
    req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Track request start
    req.startTime = startTime;

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const endCpuUsage = process.cpuUsage(startCpuUsage);
        const endMemory = process.memoryUsage();

        // Log performance metrics
        const performanceData = {
            requestId: req.id,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: duration,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            timestamp: new Date().toISOString(),
            memory: {
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                external: endMemory.external - startMemory.external,
                rss: endMemory.rss - startMemory.rss
            },
            cpu: {
                user: endCpuUsage.user,
                system: endCpuUsage.system
            }
        };

        // Log slow requests (threshold: 1000ms)
        if (duration > 1000) {
            logger.warn('Slow request detected', performanceData);
        } else if (duration < 100) {
            // Log fast requests for performance analysis
            logger.info('Fast request', performanceData);
        }

        // Set performance headers
        res.set('X-Response-Time', `${duration}ms`);
        res.set('X-Request-ID', req.id);

        originalEnd.call(this, chunk, encoding);
    };

    next();
};

module.exports = performanceMonitor;
