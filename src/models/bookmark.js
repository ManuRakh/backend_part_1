'use strict';
module.exports = (sequelize, DataTypes) => {
  var bookMark = sequelize.define('bookmark', {
    guid: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    link: {
      type: DataTypes.STRING(256),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      unique: false,
        },
    favorites: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
  }, {
    timestamps: true
  });

  bookMark.associate = function() {
    // associations can be defined here
  };

  return bookMark;
};