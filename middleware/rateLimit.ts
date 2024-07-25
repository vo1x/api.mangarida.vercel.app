import rateLimit from "express-rate-limit";

const limiter = rateLimit({
    windowMs:5000,
    max:1,
    message:'Too many requests form this IP, please try again later.'
})


export default limiter;