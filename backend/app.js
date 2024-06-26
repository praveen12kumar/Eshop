import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

const app  = express();

const __dirname = path.resolve();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}));
app.use(express.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(cookieParser());

// routes
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import reviewRouter from "./routes/review.routes.js";
import paymentRouter from "./routes/payment.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1", productRouter);
app.use("/api/v1", cartRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", reviewRouter);
app.use("/api/v1/payment", paymentRouter);


app.use(express.static(path.join(__dirname, "/frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend","build","index.html"));
});

export default app;