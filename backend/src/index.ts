import express from "express"
import queryRouter from "./routes/query.route"


const app = express()
app.use('/api/query', queryRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});