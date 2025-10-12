
# 🎓 Edemy LMS - Modern Learning Management System

<div align="center">
  <img src="client/public/favicon.svg" alt="Edemy LMS Logo" width="200"/>
  
  [![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://lms-backend-chi-henna.vercel.app)
  [![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)
  [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)](https://expressjs.com)
</div>

## 🌟 Overview

Edemy LMS is a full-featured Learning Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a seamless platform for educators to create and manage courses, and for students to learn through an intuitive interface.

### 🔥 Live Demo
- Frontend: [https://edemy-lms.vercel.app](https://edemy-lms.vercel.app)
- Backend API: [https://lms-backend-chi-henna.vercel.app](https://lms-backend-chi-henna.vercel.app)

## 🏗️ System Architecture

![Placeholder Image](https://i.postimg.cc/0N6TWSVj/Untitled-diagram-2025-10-12-161406.png)

## 📊 Database Schema

### User Schema
```typescript
{
  _id: ObjectId,
  clerkId: string,
  email: string,
  firstName: string,
  lastName: string,
  role: {
    type: string,
    enum: ['student', 'educator']
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Course Schema
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  thumbnail: string,
  price: number,
  educator: {
    type: ObjectId,
    ref: 'User'
  },
  chapters: [{
    title: string,
    description: string,
    lectures: [{
      title: string,
      description: string,
      videoUrl: string,
      isPreview: boolean
    }]
  }],
  enrolledStudents: [{
    type: ObjectId,
    ref: 'User'
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### CourseProgress Schema
```typescript
{
  _id: ObjectId,
  user: {
    type: ObjectId,
    ref: 'User'
  },
  course: {
    type: ObjectId,
    ref: 'Course'
  },
  completedLectures: [{
    chapterIndex: number,
    lectureIndex: number,
    completedAt: Date
  }],
  progress: number,
  startedAt: Date,
  lastAccessedAt: Date
}
```

### Purchase Schema
```typescript
{
  _id: ObjectId,
  user: {
    type: ObjectId,
    ref: 'User'
  },
  course: {
    type: ObjectId,
    ref: 'Course'
  },
  amount: number,
  currency: string,
  stripePaymentId: string,
  status: {
    type: string,
    enum: ['pending', 'completed', 'failed']
  },
  purchasedAt: Date
}
```

## ✨ Key Features

### 👨‍🏫 For Educators
- **Course Management**
  - Create and publish courses
  - Organize content into chapters and lectures
  - Upload course thumbnails
  - Set preview lectures
  - Track student progress
  - Monitor course analytics

### 👨‍🎓 For Students
- **Learning Experience**
  - Browse course catalog
  - Preview free lectures
  - Purchase courses
  - Track learning progress
  - Watch video lectures
  - Access course materials

### 🛠️ Technical Features
- **Authentication & Authorization**
  - Secure user authentication with Clerk
  - Role-based access control (Student/Educator)
  - Protected routes and API endpoints

- **Payment Integration**
  - Secure payments with Stripe
  - Course purchase system
  - Payment history tracking

- **Media Management**
  - Video streaming via YouTube integration
  - File uploads with Cloudinary
  - Course thumbnail management

- **User Interface**
  - Responsive design for all devices
  - Modern and intuitive UI with Tailwind CSS
  - Rich text editing with Quill
  - Toast notifications
  - Progress tracking visualization

## 🚀 Tech Stack

### Frontend
- **Core**: React (Vite), React Router DOM
- **State Management**: Context API
- **UI/UX**:
  - Tailwind CSS for styling
  - Framer Motion for animations
  - React Toastify for notifications
  - Quill for rich text editing
  - RC Progress for progress bars
- **Media**: React YouTube for video playback
- **HTTP Client**: Axios

### Backend
- **Server**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **File Storage**: Cloudinary
- **Payment Processing**: Stripe
- **API Security**: CORS, Environment Variables

## 📦 Project Structure

### Frontend (`client/`)
```typescript
📦 client
 ├── src/
 │   ├── assets/          # Static assets
 │   ├── components/      # Reusable components
 │   │   ├── educator/    # Educator-specific components
 │   │   └── student/     # Student-specific components
 │   ├── context/        # React Context providers
 │   ├── pages/          # Page components
 │   │   ├── educator/   # Educator pages
 │   │   └── student/    # Student pages
 │   ├── App.jsx         # Main app component
 │   └── main.jsx        # Entry point
 └── public/            # Public assets
```

### Backend (`server/`)
```typescript
📦 server
 ├── configs/           # Configuration files
 ├── controllers/       # Request handlers
 ├── middlewares/      # Custom middlewares
 ├── models/           # MongoDB schemas
 ├── routes/           # API routes
 └── server.js         # Entry point
```

## 🛠️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/TejasSavla663/LMS.git
   cd edemy-lms
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   
   # Create .env file with these variables:
   VITE_BACKEND_URL=your_backend_url
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_CURRENCY=USD
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   
   # Start development server
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Create .env file with these variables:
   MONGODB_URI=your_mongodb_uri
   CLERK_SECRET_KEY=your_clerk_secret
   STRIPE_SECRET_KEY=your_stripe_secret
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   CURRENCY=USD
   
   # Start server
   npm start
   ```

## 🚀 Deployment

This project is configured for deployment on Vercel.

### Backend Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to server directory: `cd server`
3. Deploy: `vercel --prod`
4. Configure environment variables in Vercel dashboard:
   ```env
   # Required Backend Environment Variables
   MONGODB_URI=your_mongodb_uri
   CLERK_SECRET_KEY=your_clerk_secret_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   CURRENCY=USD
   ```

### Frontend Deployment
1. Navigate to client directory: `cd client`
2. Deploy: `vercel --prod`
3. Configure environment variables in Vercel dashboard:
   ```env
   # Required Frontend Environment Variables
   VITE_BACKEND_URL=your_backend_url
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_CURRENCY=USD
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```

## 📚 References & Documentation

### Core Technologies
- [React Documentation](https://react.dev/learn) - Frontend library
- [Vite Documentation](https://vite.dev/guide/) - Frontend build tool
- [Node.js Documentation](https://nodejs.org/docs/latest/api/) - Backend runtime
- [Express.js Guide](https://expressjs.com/) - Backend framework
- [MongoDB Manual](https://www.mongodb.com/docs/) - Database
- [Mongoose Documentation](https://mongoosejs.com/docs/) - MongoDB ODM

### Authentication & Payment
- [Clerk Documentation](https://clerk.com/docs) - Authentication service
- [Stripe Documentation](https://stripe.com/docs) - Payment processing
- [Stripe React Components](https://stripe.com/docs/stripe-js/react) - Stripe React integration

### UI & Styling
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - CSS framework
- [Framer Motion API](https://www.framer.com/motion/) - Animation library
- [React Toastify](https://fkhadra.github.io/react-toastify/) - Toast notifications
- [React Quill](https://github.com/zenoamaro/react-quill) - Rich text editor
- [RC Progress](https://github.com/react-component/progress) - Progress bars

### Media & Storage
- [Cloudinary Documentation](https://cloudinary.com/documentation) - Media storage
- [YouTube Player API](https://developers.google.com/youtube/iframe_api_reference) - Video player
- [React YouTube](https://github.com/tjallingt/react-youtube) - YouTube player component

### Deployment & Tools
- [Vercel Documentation](https://vercel.com/docs) - Deployment platform
- [Axios Documentation](https://axios-http.com/docs/intro) - HTTP client
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) - Security

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tejas Kiran Savla**
- Email: [tejas.18296@sakec.ac.in](mailto:tejas.18296@sakec.ac.in)
- GitHub: [@TejasSavla663](https://github.com/TejasSavla663)

## 📞 Contact & Support
- WhatsApp: [Click to Chat](https://wa.me/xxxxxxxxx)

- Give this project a ⭐ if you found it helpful!

---
Made with ❤️ by Tejas Kiran Savla
