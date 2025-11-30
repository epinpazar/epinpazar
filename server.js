const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const app = express();

// *** CORS Ayarı (Frontend Domaini) ***
app.use(cors({
  origin: "https://epinpazar-frontend.onrender.com",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(bodyParser.json());

// *** MongoDB Bağlantısı ***
mongoose.connect(process.env.MONGO_URL || "mongodb+srv://kullanici:sifre@cluster.mongodb.net/epinpazar", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// *** Modeller ***
const UserSchema = new mongoose.Schema({
  username: String,
  password: String
});

const ListingSchema = new mongoose.Schema({
  owner: String,
  title: String,
  description: String,
  price: Number,
  approved: { type: Boolean, default: false }
});

const User = mongoose.model("User", UserSchema);
const Listing = mongoose.model("Listing", ListingSchema);

// *** JWT Secret ***
const SECRET = "epin-secret-key-123";

// *** Kullanıcı Kayıt ***
app.post(
