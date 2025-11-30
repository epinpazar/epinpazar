
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const sequelize = new Sequelize({ dialect:'sqlite', storage: path.join(__dirname,'data.sqlite'), logging:false });

const User = sequelize.define('User', {
  email: { type: DataTypes.STRING, allowNull:false, unique:true },
  password: { type: DataTypes.STRING, allowNull:false },
  name: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue:'user' }
});

const Listing = sequelize.define('Listing', {
  title: { type: DataTypes.STRING, allowNull:false },
  description: { type: DataTypes.TEXT },
  category: { type: DataTypes.STRING, defaultValue:'general' },
  price: { type: DataTypes.FLOAT, defaultValue:0 },
  type: { type: DataTypes.STRING, defaultValue:'manual' },
  imageUrl: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue:'pending' }
});

User.hasMany(Listing, { foreignKey:'userId' });
Listing.belongsTo(User, { as:'owner', foreignKey:'userId' });

module.exports = { sequelize, User, Listing };
