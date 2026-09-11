# TastyBites

A restaurant ordering and management system built with the MERN stack (MongoDB, Express, React, Node.js).

Customers can browse the menu, add dishes to a cart, check out with a delivery address (the browser can fill it in from their location) and follow their order as the kitchen updates it. Admins get a dashboard to manage menu items, orders and users.

## Tech stack

- **Frontend:** React, React Router, Axios, Tailwind CSS, built with Vite
- **Backend:** Node.js, Express, MongoDB with Mongoose, JWT authentication, bcrypt
- **Image uploads:** Multer and Cloudinary

## Running it locally

You need Node.js 20 or newer, a MongoDB Atlas connection string and a Cloudinary account.

**Backend**

```bash
cd server
npm install
cp .env.example .env   # then fill in your own values
npm run seed           # adds the menu and an admin account
npm run dev            # runs on http://localhost:5000
```

**Frontend**

```bash
cd client
npm install
cp .env.example .env
npm run dev            # runs on http://localhost:5173
```

The seed script creates an admin account you can log in with: `admin@tastybites.com` / `Admin@123`.
