import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinay from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

// initialize express 
const app = express();


// connect to db
await connectDB();
await connectCloudinay();


// middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Webhook raw body logging middleware
const logWebhookBody = (req, res, next) => {
    if (req.body) {
        const rawBody = req.body.toString('utf8');
        console.log('Raw webhook body:', rawBody);
        try {
            const parsedBody = JSON.parse(rawBody);
            console.log('Parsed webhook body:', JSON.stringify(parsedBody, null, 2));
        } catch (error) {
            console.error('Error parsing webhook body:', error);
        }
    }
    next();
};

// Webhooks (must be before Clerk middleware)
app.post('/clerk', express.raw({ type: 'application/json' }), logWebhookBody, clerkWebhooks);
app.post('/stripe', express.raw({ type: 'application/json' }), logWebhookBody, stripeWebhooks);

// Auth middleware
app.use(clerkMiddleware());

// Protected Routes
app.get('/', (req,res)=>{res.send("Edemy API is working fine!")});
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);



// port
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=> {
    console.log(`Server is running on ${PORT}`);
    
})
// server/server.js
console.log("Triggered CI from server changee");
