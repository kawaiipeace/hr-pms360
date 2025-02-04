import dotenv from "dotenv";
import path from "path";

// Load .env from the master directory
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const nextConfig = {
  env: {
    MY_SECRET: process.env.MY_SECRET, // Pass env variables to Next.js
  },
};

export default nextConfig;
