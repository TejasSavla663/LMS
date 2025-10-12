// import { Webhook } from "svix";
// import User from "../models/User.js";

// // Api controller function to manage clerk user with databse

// export const clerkWebhooks = async (req,res)=>{

//     try {
//         const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
//         await whook.verify(JSON.stringify(req.body),{
//             "svix-id": req.headers["svix-id"],
//             "svix-timestamp": req.headers["svix-timestamp"],
//             "svix-signature": req.headers["svix-signature"]
//         })

//         const {data, type} = req.body

//         switch (type) {
//             case 'user.created':{
//                 const userData = {
//                     _id: data.id,
//                     email:data.email_addresses[0].email_address,
//                     name: data.first_name + " " + data.last_name,
//                     imageUrl: data.image_url,
//                 }
//                 await User.create(userData)
//                 res.json({})
//                 break;
//             }
                
//                 case 'user.updated':{
//                     const userData = {
//                         email:data.email_address[0].email_address,
//                         name: data.first_name + " " + data.last_name,
//                         imageUrl: data.image_url,
//                     }
//                     await User.findByIdAndUpdate(data.id, userData)
//                     res.json({})
//                     break;
//                 }

//                 case 'user.deleted': {
//                     await User.findByIdAndDelete(data.id);
//                     res.json({})
//                     break;
//                 }
        
//             default:
//                 break;
//         }

//     } catch (error) {
//         res.json({success: false, message: error.message})
//     }

// }

import { Webhook } from "svix";
import User from "../models/User.js";
import Stripe from "stripe";
import { request, response } from "express";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

export const clerkWebhooks = async (req, res) => {
    try {
        console.log('Received webhook event');
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        
        if (!req.body) {
            console.error('No request body received');
            return res.status(400).json({ success: false, message: 'No request body' });
        }

        // Get the raw body as a string and verify it's properly formatted
        let rawBody;
        try {
            rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            console.log('Raw body:', rawBody);
        } catch (error) {
            console.error('Error processing request body:', error);
            return res.status(400).json({ success: false, message: 'Invalid request body format' });
        }

        // Verify webhook signature
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        try {
            await whook.verify(rawBody, {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"]
            });
            console.log('Webhook signature verified successfully');
        } catch (error) {
            console.error('Webhook verification failed:', error);
            return res.status(400).json({ success: false, message: 'Webhook verification failed' });
        }

        // Parse the webhook payload
        let data, type;
        try {
            const payload = JSON.parse(rawBody);
            ({ data, type } = payload);
            console.log('Webhook event type:', type);
            console.log('Webhook data:', JSON.stringify(data, null, 2));

        switch (type) {
            case 'user.created': {
                console.log("Creating new user in MongoDB");
                try {
                    // Check if user already exists
                    const existingUser = await User.findById(data.id);
                    if (existingUser) {
                        console.log("User already exists:", existingUser);
                        return res.json({ success: true, message: "User already exists" });
                    }

                    // Extract email from email_addresses array
                    const email = data.email_addresses && data.email_addresses.length > 0
                        ? data.email_addresses[0].email_address
                        : "";

                    // Construct name from first_name and last_name, defaulting to "User" if both are empty
                    const firstName = data.first_name || "";
                    const lastName = data.last_name || "";
                    const name = `${firstName} ${lastName}`.trim() || "User";

                    // Prepare user data
                    const userData = {
                        _id: data.id,
                        email: email,
                        name: name,
                        imageUrl: data.image_url || "",
                        enrolledCourses: []
                    };
                    
                    console.log('Prepared user data:', userData);

                    // Validate required fields
                    if (!userData._id) {
                        console.error("Missing user ID:", userData);
                        return res.status(400).json({ 
                            success: false, 
                            message: "Missing user ID" 
                        });
                    }

                    // Create user in MongoDB
                    console.log("Creating user with data:", JSON.stringify(userData, null, 2));
                    const newUser = await User.create(userData);
                    console.log("User created successfully:", JSON.stringify(newUser, null, 2));
                    
                    return res.json({ 
                        success: true,
                        message: "User created successfully",
                        user: newUser
                    });
                } catch (error) {
                    console.error("Error creating user:", error);
                    console.error("Error stack:", error.stack);
                    return res.status(500).json({ 
                        success: false, 
                        message: "Error creating user",
                        error: error.message,
                        stack: error.stack
                    });
                }
            }

            case 'user.updated': {
                console.log('Updating user:', data.id);
                try {
                    const userData = {
                        email: data.email_addresses?.[0]?.email_address || "",
                        name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || "User",
                        imageUrl: data.image_url || data.image_url || "",
                    };
                    console.log('Update data:', userData);
                    
                    const updatedUser = await User.findByIdAndUpdate(data.id, userData, { new: true });
                    if (!updatedUser) {
                        console.log('User not found for update:', data.id);
                        return res.status(404).json({ success: false, message: 'User not found' });
                    }
                    console.log('User updated successfully:', updatedUser);
                    return res.json({ success: true });
                } catch (error) {
                    console.error('Error updating user:', error);
                    return res.status(500).json({ success: false, message: error.message });
                }
            }

            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.json({});
            }

            default:
                return res.status(400).json({ success: false, message: "Unhandled event type" });
        }
    } catch (error) {
            console.error('Error parsing webhook payload:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);


// export const stripeWebhooks = async (request,response) => {
//     const sig = request.headers['stripe-signature'];

//   let event;

//   try {
//     event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   }
//   catch (err) {
//     response.status(400).send(`Webhook Error: ${err.message}`);
//   }
//     // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':{
//       const paymentIntent = event.data.object;
//       const paymentIntentId = paymentIntent.id;
//       const session = await stripeInstance.checkout.sessions.list({
//         payment_intent: paymentIntentId
//       })
//       const {purchaseId} = session.data[0].metadata;
//       const purchaseData = await Purchase.findById(purchaseId)

//       const userData = await User.findById(purchaseData.userId)
//       const courseData = await Course.findById(purchaseData.courseId.toString())

//       courseData.enrolledStudents.push(userData)
//       await courseData.save()

//       userData.enrolledCourses.push(courseData._id)
//       await userData.save()

//       purchaseData.status = 'completed'

//       await purchaseData.save()

//       break;
//     }


//     case 'payment_intent.payment_failed':{
//         const paymentIntent = event.data.object;
//         const paymentIntentId = paymentIntent.id;
//         const session = await stripeInstance.checkout.sessions.list({
//           payment_intent: paymentIntentId
//         })
//         const {purchaseId} = session.data[0].metadata;
//         const purchaseData = await Purchase.findById(purchaseId)

//         purchaseData.status = 'failed'
//         await purchaseData.save();
      
//       break;
//     }
//     // ... handle other event types
//     default:
//       console.log(`Unhandled event type ${event.type}`);
//   }

//   // Return a response to acknowledge receipt of the event
//   response.json({received: true});
// }


// import Stripe from 'stripe';

// const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        console.log('Attempting to verify Stripe webhook signature');
        console.log('Webhook Secret:', process.env.STRIPE_WEBHOOK_SECRET ? 'Present' : 'Missing');
        console.log('Signature:', sig ? 'Present' : 'Missing');
        
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('Webhook verified successfully');
        console.log('Event type:', event.type);
    } catch (err) {
        console.error('Webhook verification failed:', err);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            console.log('Processing successful payment for intent:', paymentIntent.id);
            
            const paymentIntentId = paymentIntent.id;
            console.log('Fetching session data for payment intent:', paymentIntentId);
            
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            if (!session.data.length) {
                console.error("No session data found for payment intent:", paymentIntentId);
                return;
            }
            console.log('Found session data:', session.data[0].id);

            const { purchaseId } = session.data[0].metadata;
            console.log('Looking up purchase record:', purchaseId);
            
            const purchaseData = await Purchase.findById(purchaseId);

            if (!purchaseData) {
                console.error("No purchase found for ID:", purchaseId);
                return;
            }
            console.log('Found purchase data:', purchaseData);

            console.log('Looking up user:', purchaseData.userId);
            const userData = await User.findById(purchaseData.userId);
            
            console.log('Looking up course:', purchaseData.courseId);
            const courseData = await Course.findById(purchaseData.courseId.toString());

            if (!userData || !courseData) {
                console.error("User or Course not found");
                console.log('User found:', !!userData);
                console.log('Course found:', !!courseData);
                return;
            }

            console.log('Enrolling user in course');
            console.log('Before enrollment - Course enrolled students:', courseData.enrolledStudents);
            console.log('Before enrollment - User enrolled courses:', userData.enrolledCourses);

            // Add user to enrolled students
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();
            console.log('Updated course enrolled students');

            // Add course to user's enrolled courses
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
            console.log('Updated user enrolled courses');

            // Update purchase status
            purchaseData.status = 'completed';
            await purchaseData.save();
            console.log('Updated purchase status to completed');
        } catch (error) {
            console.error("Error handling payment success:", error);
        }
    };

    const handlePaymentFailed = async (paymentIntent) => {
        try {
            const paymentIntentId = paymentIntent.id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            if (!session.data.length) {
                console.error("No session data found for failed payment intent:", paymentIntentId);
                return;
            }

            const { purchaseId } = session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId);

            if (!purchaseData) {
                console.error("No purchase found for ID:", purchaseId);
                return;
            }

            purchaseData.status = 'failed';
            await purchaseData.save();
        } catch (error) {
            console.error("Error handling payment failure:", error);
        }
    };

    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object);
            break;

        case 'payment_intent.payment_failed':
            await handlePaymentFailed(event.data.object);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
};




