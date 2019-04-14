'use strict'
module.exports = (sequelize, DataTypes) => {
	var Payments = sequelize.define(
		'Payments',
		{
			user_id: {
				type: DataTypes.INTEGER(11)
			},
			payment_id: {
				type: DataTypes.STRING(100)
			},
			transaction_hash: {
				type: DataTypes.STRING(100)
			},
			amount: {
				type: DataTypes.DECIMAL(5, 2)
			},
			timestamp: {
				type: DataTypes.DATE,
				defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
			}
		},
		{
			timestamps: false,
			tableName: 'Transaction',
			defaultScope: {
				attributes: { exclude: ['payment_id'] }
			}
		}
	)
	return Payments
}
