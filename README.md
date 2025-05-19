# Backend
orbital summer25 backend

# PennyWise Backend
Backend for the PennyWise app, built with Node.js, Express, and MongoDB.

## Setup
1. **Prerequisites**:
   - Node.js (v22.13.0)
   - MongoDB Community Server
   - Git
2. **Clone the Repository**:
   ```bash
   git clone https://github.com/PennyWiseNUS/pennywise-backend.git
   cd pennywise-backend
   ```

## Install Dependencies
```bash
npm install
```
## Environment Variables
### Copy .env.example to .env and configure:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/authdb
JWT_SECRET=your_jwt_secret_key
```
## Start MongoDB:
Ensure MongoDB is running: net start MongoDB or mongod --dbpath C:\data\db.

## Run the Backend
``` bash
npm start
```
