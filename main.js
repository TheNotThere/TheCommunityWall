import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import { ethers } from "ethers";
dotenv.config();
const app = express();
const PORT = 3000;

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where files are saved
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
// Serve static files from public/ (optional)
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl }); // return the URL to the client
});
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const ABI = ["function getAllTokenURIs() view returns (string[])"];
const contract = new ethers.Contract("0x4FF850670C77D43c6BDa6Cdb837fF50F757e64A8",ABI,provider)


// Serve index.html on root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/create", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "create.html"));
});
app.get("/mosaic", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mosaic.html"));
});
app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});
app.get("/api/tiles", async (req, res) => {
  const images = await contract.getAllTokenURIs();
  res.json(images)
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
