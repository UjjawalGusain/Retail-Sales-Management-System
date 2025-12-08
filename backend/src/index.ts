import express from "express"
import queryRouter from "./routes/query.route.js"
import cors from 'cors';

const app = express()

app.use(cors({
  origin: ['https://retail-sales-management-dashboard.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use('/api/query', queryRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});