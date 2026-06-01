import cors, { type CorsOptions } from "cors";

const allowedOrigins = [
  "https://ocf.workbrink.com",
  "http://localhost:5173",
  "http://localhost:5000",
  "https://ocb.workbrink.com",
  "https://lsf.workbrink.com",
  "http://localhost:3000",
  "http://localhost:3026",
  "https://lsd.senew-tech.com",
];

const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Authorization, Content-Type, X-Requested-With",
  optionsSuccessStatus: 204,
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware;
