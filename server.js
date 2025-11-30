
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sequelize, User, Listing } = require('./models');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@epin.test';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname,'uploads')));

// helpers
function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({error:'no auth'});
  const token = auth.split(' ')[1];
  try{
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data; next();
  }catch(e){ return res.status(401).json({error:'invalid token'}); }
}

function adminMiddleware(req,res,next){
  if(req.user && req.user.role === 'admin') return next();
  return res.status(403).json({error:'admin only'});
}

// auth
app.post('/api/register', async (req,res)=>{
  try{
    const { email, password, name } = req.body;
    if(!email || !password) return res.status(400).json({error:'missing'});
    const exists = await User.findOne({ where:{ email } });
    if(exists) return res.status(400).json({error:'exists'});
    const hash = await bcrypt.hash(password,10);
    const role = (email === ADMIN_EMAIL) ? 'admin' : 'user';
    const user = await User.create({ email, password:hash, name, role });
    return res.json({ ok:true, userId:user.id });
  }catch(e){ console.error(e); res.status(500).json({error:'server'}); }
});

app.post('/api/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ where:{ email } });
    if(!user) return res.status(401).json({ error:'invalid' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(401).json({ error:'invalid' });
    const token = jwt.sign({ id:user.id, email:user.email, role:user.role }, JWT_SECRET, { expiresIn:'7d' });
    res.json({ ok:true, token, user:{ id:user.id, email:user.email, name:user.name, role:user.role } });
  }catch(e){ console.error(e); res.status(500).json({error:'server'}); }
});

// create listing (auth) - supports image upload (single)
app.post('/api/listings', authMiddleware, upload.single('image'), async (req,res)=>{
  try{
    const { title, description, category, price, type } = req.body;
    let imageUrl = null;
    if(req.file){
      imageUrl = '/uploads/' + req.file.filename;
    } else if(req.body.imageUrl){
      imageUrl = req.body.imageUrl;
    }
    const listing = await Listing.create({ title, description, category, price: Number(price||0), type, imageUrl, userId: req.user.id, status:'pending' });
    res.json({ ok:true, listing });
  }catch(e){ console.error(e); res.status(500).json({error:'server'}); }
});

// list public listings
app.get('/api/listings', async (req,res)=>{
  const listings = await Listing.findAll({ where:{ status:'approved' }, include:['owner'], order:[['createdAt','DESC']] });
  res.json(listings);
});

// get a single listing
app.get('/api/listings/:id', async (req,res)=>{
  const l = await Listing.findByPk(req.params.id, { include:['owner'] });
  if(!l) return res.status(404).json({ error:'not found' });
  res.json(l);
});

// get my listings
app.get('/api/my-listings', authMiddleware, async (req,res)=>{
  const listings = await Listing.findAll({ where:{ userId: req.user.id }, order:[['createdAt','DESC']] });
  res.json(listings);
});

// admin: list all listings & approve/delete
app.get('/api/admin/listings', authMiddleware, adminMiddleware, async (req,res)=>{
  const listings = await Listing.findAll({ include:['owner'], order:[['createdAt','DESC']] });
  res.json(listings);
});

app.post('/api/admin/listings/:id/approve', authMiddleware, adminMiddleware, async (req,res)=>{
  const id = req.params.id;
  const l = await Listing.findByPk(id);
  if(!l) return res.status(404).json({error:'not found'});
  l.status = 'approved'; await l.save();
  res.json({ ok:true });
});

app.delete('/api/admin/listings/:id', authMiddleware, adminMiddleware, async (req,res)=>{
  const id = req.params.id;
  await Listing.destroy({ where:{ id } });
  res.json({ ok:true });
});

// simple server info
app.get('/api/health',(req,res)=>res.json({ ok:true }));

const PORT = process.env.PORT || 4000;
sequelize.sync().then(()=>{
  // ensure uploads folder exists
  if(!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');
  app.listen(PORT, ()=> console.log('Server running on', PORT));
});
