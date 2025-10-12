import Stripe from "stripe"
import Course from "../models/Course.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { clerkClient } from "@clerk/express";

// Get users data
export const getUserData = async(req,res)=>{
    try {
        console.log('Auth object:', req.auth);
        console.log('Headers:', req.headers);
        
        const userId = req.auth.userId;
        console.log("Getting user data for userId:", userId);

        if (!userId) {
            console.error("No userId provided in auth");
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        // Try to find the user
        let user = await User.findById(userId);
        console.log("User data found:", user ? "yes" : "no");

        // If user not found, try to create them
        if (!user) {
            console.log("User not found in database for userId:", userId);
            console.log("Attempting to create user from Clerk data...");

            try {
                // Get user data from Clerk
                const clerkUser = await clerkClient.users.getUser(userId);
                console.log("Clerk user data:", clerkUser);

                // Create user in MongoDB
                const userData = {
                    _id: userId,
                    email: clerkUser.emailAddresses[0]?.emailAddress || "",
                    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
                    imageUrl: clerkUser.imageUrl || "",
                    enrolledCourses: []
                };

                console.log("Creating user with data:", userData);
                user = await User.create(userData);
                console.log("User created successfully:", user);
            } catch (error) {
                console.error("Error creating user from Clerk data:", error);
                return res.status(404).json({
                    success: false,
                    message: "Failed to create user. Please try logging out and logging in again.",
                    error: error.message
                });
            }
        }

        return res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error in getUserData:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching user data. Please try again."
        });
    }
}

// User enrolled course with lecture link

export const userEnrolledCourses = async (req,res)=>{
    try {
        const userId = req.auth.userId
        const userData = await User.findById(userId).populate('enrolledCourses')
        
        if (!userData) {
            return res.status(404).json({
                success: false, 
                message: "User not found. Please try logging out and logging in again."
            });
        }

        res.json({
            success: true, 
            enrolledCourses: userData.enrolledCourses || []
        });

    } catch (error) {
        console.error("Error in userEnrolledCourses:", error);
        res.status(500).json({
            success: false, 
            message: "Error fetching enrolled courses. Please try again."
        });
    }
}


// Purchase course

export const purchaseCourse = async (req,res) => {
    try {
        const {courseId} = req.body
        const {origin} = req.headers
        const userId = req.auth.userId;

        const userData = await User.findById(userId)

        const courseData = await Course.findById(courseId)
        if(!userData || !courseData)
        {
            res.json({success: false, message: "Data Not Found"})
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData);

        // stripe gateway initialize
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
        const currency = (process.env.CURRENCY || 'usd').toLowerCase();
        
        // creating line items to for stripe
        const line_items = [{
            price_data:{
                currency,
                product_data:{
                    name: courseData.courseTitle
                },
                unit_amount: Math.floor( newPurchase.amount ) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items: line_items,
            mode: 'payment',
            metadata: {
                purchaseId: newPurchase._id.toString()
            }
        })

        res.json({success: true, session_url: session.url})


    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// Update user Course progress

export const updateUserCourseProgress = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId, lectureId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})

        if(progressData){
            if(progressData.lectureCompleted.includes(lectureId)){
                return res.json({success: true, message: "Lecture Already Completed"})
            }
            
            progressData.lectureCompleted.push(lectureId)
            progressData.completed = true
            await progressData.save()
        }
        else{
            await CourseProgress.create({
                userId,
                courseId,
                lectureCompleted: [lectureId]

            })
        }
        res.json({success:true, message: 'Progress Updated'})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}

// get user course progress

export const getUserCourseProgress = async(req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId} = req.body
        const progressData = await CourseProgress.findOne({userId, courseId})
        res.json({success: true, progressData})
    } catch (error) {
        res.json({success: false, message:error.message})
    }
}


// Add user ratings to course

export const addUserRating = async (req,res)=>{
    try {
        const userId = req.auth.userId
        const {courseId, rating} = req.body
        // console.log("UserId", courseId);
        // console.log("courseId", courseId);
        // console.log("rating", rating);
        

        if(!courseId || !userId || !rating || rating < 1 || rating > 5)
        {
            res.json({success: false, message:"Invalid details"})
        }

        const course = await Course.findById(courseId)
        if(!course){
            return res.json({success: false, message:"Course Not found!"})
        }

        const user = await User.findById(userId)

        if(!user || !user.enrolledCourses.includes(courseId)){
            return res.json({success: false, message:"User has not purchased this course."})
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
        if(existingRatingIndex > -1){
            course.courseRatings[existingRatingIndex].rating = rating;
        }
        else{
            course.courseRatings.push({userId,rating});
        }

        // await courseData.save()
        await course.save()
        res.json({success: true, message:"Rating Added"})

    } catch (error) {
        res.json({success: false, message: error.message});
    }
}