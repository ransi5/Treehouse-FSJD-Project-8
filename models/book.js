'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Book.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a value for "Title"',
        },
      },
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please provide a value for "Author"',
        },
      },
    },
    genre: {
      type: DataTypes.STRING,
      validate: {
        isAlpha: {
          msg: 'only Alphabets allowed for "Genre"',
        },
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'only Integer allowed for "year"',
        },
        len: {
          args: [4, 4],
          msg:  '"year" must be 4 digits long',
        }
      },
    },
  }, {
    sequelize,
    modelName: 'Book',
  });
  return Book;
};
