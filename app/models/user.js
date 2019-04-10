'use strict'
module.exports = (sequelize, DataTypes) => {
	var User = sequelize.define(
		'User',
		{
			id: {
				type: DataTypes.INTEGER(11),
				primaryKey: true
			},
			first_name: {
				type: DataTypes.STRING(100)
			},
			last_name: {
				type: DataTypes.STRING(100)
			},
			date_of_birth: {
				type: DataTypes.DATEONLY
			},
			gender: {
				type: DataTypes.ENUM('MALE', 'FEMALE', 'DIVERSE')
			},
			role_id: {
				type: DataTypes.INTEGER(11)
			},
			email_address: {
				type: DataTypes.STRING(255)
			},
			email_verified: {
				type: DataTypes.TINYINT(1),
				defaultValue: 0
			},
			password: {
				type: DataTypes.STRING(255),
				select: false
			},
			balance: {
				type: DataTypes.DECIMAL(5, 2)
			},
			points: {
				type: DataTypes.INTEGER(11),
				defaultValue: 0
			},
			university_id: {
				type: DataTypes.STRING(20)
			},
			id_expiry: {
				type: DataTypes.DATEONLY
			},
			university_id: {
				type: DataTypes.STRING
			},
			registration_at: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
			},
			enabled: {
				type: DataTypes.TINYINT(1),
				defaultValue: 1
			}
		},
		{
			timestamps: false,
			tableName: 'User',
			defaultScope: {
				attributes: { exclude: ['password'] }
			}
		}
	)
	return User
}
