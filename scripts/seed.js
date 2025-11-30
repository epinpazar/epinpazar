
const { sequelize, User, Listing } = require('../models');
const bcrypt = require('bcrypt');
async function seed(){
  await sequelize.sync({ force:true });
  const pass = await bcrypt.hash('admin123',10);
  const admin = await User.create({ email:'admin@epin.test', password:pass, name:'Admin', role:'admin' });
  const u = await User.create({ email:'user@epin.test', password:await bcrypt.hash('user123',10), name:'Test User' });
  await Listing.bulkCreate([
    { title:'Valorant 1250 VP', description:'Valorant VP', category:'game', price:129.9, type:'manual', imageUrl:'', status:'approved', userId:u.id },
    { title:'Steam Cüzdan 50₺', description:'Steam code', category:'epin', price:54.9, type:'code', imageUrl:'', status:'approved', userId:u.id }
  ]);
  console.log('Seed done');
  process.exit(0);
}
seed();
