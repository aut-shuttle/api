const jwt = require('jsonwebtoken')
const User = require('../models/').User
const Role = require('../models/').Role
const UserAccess = require('../models/').UserAccess
const ForgotPassword = require('../models/').ForgotPassword
const utils = require('../middleware/utils')
const emailer = require('../middleware/emailer')
const uuid = require('uuid')
const { addHours } = require('date-fns')
const { matchedData } = require('express-validator/filter')
const auth = require('../middleware/auth')
const HOURS_TO_BLOCK = 0.5
const LOGIN_ATTEMPTS = 5

/**
 * Generates a token
 * @param {Object} user - user object
 */
const generateToken = user => {
	// Gets expiration time
	const expiration =
		Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES

	// returns signed and encrypted token
	return auth.encrypt(
		jwt.sign(
			{
				data: {
					id: user
				},
				exp: expiration
			},
			process.env.JWT_SECRET
		)
	)
}

/**
 * Creates an object with user info
 * @param {Object} req - request object
 */
const setUserInfo = req => {
	let user = {
		id: req.id,
		first_name: req.first_name,
		last_name: req.last_name,
		email: req.email_address,
		verified: req.email_verified,
		role_id: req.role_id
	}
	// Adds verification for testing purposes
	if (process.env.NODE_ENV !== 'production') {
		user = {
			...user,
			verification: req.verification
		}
	}
	return user
}

/**
 * Saves a new user access and then returns token
 * @param {Object} req - request object
 * @param {Object} user - user object
 */
const saveUserAccessAndReturnToken = async (req, user) => {
	return new Promise((resolve, reject) => {
		UserAccess.create({
			email: user.email_address,
			ip: utils.getIP(req),
			browser: utils.getBrowserInfo(req),
			country: utils.getCountry(req)
		})
			.then(() => {
				const userInfo = setUserInfo(user)
				// Returns data with access token
				resolve({
					token: generateToken(user.id),
					user: userInfo
				})
			})
			.catch(err => {
				reject(utils.buildErrObject(422, err.message))
			})
		/* 
			.then(user =>
				user != null ?
				resolve(user) :
				utils.itemNotFound(null, user, reject, 'NOT_FOUND_OR_ALREADY_VERIFIED'))
			.catch(error => reject(utils.buildErrObject(422, error.message))) */
	})
}

/**
 * Blocks a user by setting blockExpires to the specified date based on constant HOURS_TO_BLOCK
 * @param {Object} user - user object
 */
const blockUser = async user => {
	return new Promise((resolve, reject) => {
		user.block_expires = addHours(new Date(), HOURS_TO_BLOCK)
		user
			.save()
			.then(resolve(utils.buildErrObject(409, 'BLOCKED_USER')))
			.catch(reject(utils.buildErrObject(422, err.message)))
	})
}

/**
 * Saves login attempts to dabatabse
 * @param {Object} user - user object
 */
const saveLoginAttemptsToDB = async user => {
	return new Promise((resolve, reject) => {
		user
			.save()
			.then(item =>
				item != null
					? resolve(true)
					: utils.itemNotFound(null, item, reject, 'NOT_FOUND')
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Checks that login attempts are greater than specified in constant and also that blockexpires is less than now
 * @param {Object} user - user object
 */
const blockIsExpired = user =>
	user.login_attempts > LOGIN_ATTEMPTS && user.block_expires <= new Date()

/**
 *
 * @param {Object} user - user object.
 */
const checkLoginAttemptsAndBlockExpires = async user => {
	return new Promise((resolve, reject) => {
		// Let user try to login again after blockexpires, resets user loginAttempts
		if (blockIsExpired(user)) {
			user.login_attempts = 0
			user
				.save()
				.then(item =>
					item != null
						? resolve(true)
						: utils.itemNotFound(null, item, reject, 'NOT_FOUND')
				)
				.catch(error => reject(utils.buildErrObject(422, error.message)))
		} else {
			// User is not blocked, check password (normal behaviour)
			resolve(true)
		}
	})
}

/**
 * Checks if blockExpires from user is greater than now
 * @param {Object} user - user object
 */
const userIsBlocked = async user => {
	return new Promise((resolve, reject) => {
		if (user.block_expires > new Date()) {
			reject(utils.buildErrObject(409, 'BLOCKED_USER'))
		}
		resolve(true)
	})
}

/**
 * Finds user by email
 * @param {string} email - user´s email
 */
const findUser = async email => {
	return new Promise((resolve, reject) => {
		User.scope('all')
			.findOne({
				where: {
					email_address: email
				}
			})
			.then(user =>
				user != null
					? resolve(user)
					: utils.itemNotFound(null, user, reject, 'USER_DOES_NOT_EXIST')
			)
			.catch(error => reject(error))
	})
}

/**
 * Finds user by ID
 * @param {string} id - user´s id
 */
const findUserById = async userId => {
	return new Promise((resolve, reject) => {
		User.findOne({
			where: {
				id: userId
			}
		})
			.then(user =>
				user != null
					? resolve(user)
					: utils.itemNotFound(null, user, reject, 'USER_DOES_NOT_EXIST')
			)
			.catch(error => reject(error))
	})
}

/**
 * Adds one attempt to loginAttempts, then compares loginAttempts with the constant LOGIN_ATTEMPTS, if is less returns wrong password, else returns blockUser function
 * @param {Object} user - user object
 */
const passwordsDoNotMatch = async user => {
	user.login_attempts += 1
	await saveLoginAttemptsToDB(user)
	return new Promise((resolve, reject) => {
		if (user.login_attempts <= LOGIN_ATTEMPTS) {
			resolve(utils.buildErrObject(409, 'WRONG_PASSWORD'))
		} else {
			resolve(blockUser(user))
		}
		reject(utils.buildErrObject(422, 'ERROR'))
	})
}

/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
const registerUser = async req => {
	return new Promise((resolve, reject) => {
		User.create({
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			date_of_birth: req.body.date_of_birth,
			gender: req.body.gender,
			role_id: req.body.role_id,
			email_address: req.body.email_address,
			password: req.body.password,
			balance: req.body.balance,
			university_id: req.body.university_id,
			id_expiry: req.body.id_expiry,
			verification: uuid.v4()
		})
			.then(user =>
				user != null
					? resolve(user)
					: utils.itemNotFound(null, user, reject, 'USER_DOES_NOT_EXIST')
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Builds the registration token
 * @param {Object} item - user object that contains created id
 * @param {Object} userInfo - user object
 */
const returnRegisterToken = (item, userInfo) => {
	if (process.env.NODE_ENV !== 'production') {
		userInfo.verification = item.verification
	}
	const data = {
		token: generateToken(item.id),
		user: userInfo
	}
	return data
}

/**
 * Checks if verification id exists for user
 * @param {string} id - verification id
 */
const verificationExists = async id => {
	console.log(id)
	return new Promise((resolve, reject) => {
		User.findOne({
			where: {
				verification: id,
				email_verified: 0 // TODO: Make Boolean
			}
		})
			.then(user =>
				user != null
					? resolve(user)
					: utils.itemNotFound(
							null,
							user,
							reject,
							'NOT_FOUND_OR_ALREADY_VERIFIED'
					  )
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Verifies an user
 * @param {Object} user - user object
 */
const verifyUser = async user => {
	return new Promise((resolve, reject) => {
		user.email_verified = 1
		user
			.save()
			.then(item =>
				item != null
					? resolve({
							email_address: item.email_address,
							email_verified: item.email_verified
					  })
					: utils.itemNotFound(
							null,
							item,
							reject,
							'NOT_FOUND_OR_ALREADY_VERIFIED'
					  )
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Marks a request to reset password as used
 * @param {Object} req - request object
 * @param {Object} forgot - forgot object
 */
const markResetPasswordAsUsed = async (req, forgot) => {
	return new Promise((resolve, reject) => {
		forgot.used = 1 // TODO: Change to Boolean
		forgot.ipChanged = utils.getIP(req)
		forgot.browserChanged = utils.getBrowserInfo(req)
		forgot.countryChanged = utils.getCountry(req)

		forgot
			.save()
			.then(item =>
				item != null
					? resolve(utils.buildSuccObject('PASSWORD_CHANGED'))
					: utils.itemNotFound(null, item, reject, 'NOT_FOUND')
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Updates a user password in database
 * @param {string} password - new password
 * @param {Object} user - user object
 */
const updatePassword = async (password, user) => {
	return new Promise((resolve, reject) => {
		user.password = password
		user
			.save()
			.then(user =>
				user != null
					? resolve(user)
					: utils.itemNotFound(null, user, reject, 'NOT_FOUND')
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Finds user by email to reset password
 * @param {string} email - user email
 */
const findUserToResetPassword = async email => {
	return new Promise((resolve, reject) => {
		User.findOne({
			where: {
				email_address: email
			}
		})
			.then(user =>
				user != null
					? resolve(user)
					: utils.itemNotFound(null, user, reject, 'NOT_FOUND')
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Checks if a forgot password verification exists
 * @param {string} id - verification id
 */
const findForgotPassword = async id => {
	return new Promise((resolve, reject) => {
		ForgotPassword.findOne({
			where: {
				verification: id,
				used: 0 // TODO: Make Boolean
			}
		})
			.then(forgot =>
				forgot != null
					? resolve(forgot)
					: utils.itemNotFound(
							null,
							forgot,
							reject,
							'NOT_FOUND_OR_ALREADY_USED'
					  )
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Creates a new password forgot
 * @param {Object} req - request object
 */
const saveForgotPassword = async req => {
	return new Promise((resolve, reject) => {
		ForgotPassword.create({
			email_address: req.body.email_address,
			verification: uuid.v4(),
			ipRequest: utils.getIP(req),
			browserRequest: utils.getBrowserInfo(req),
			countryRequest: utils.getCountry(req)
		})
			.then(item =>
				item != null
					? resolve(item)
					: utils.itemNotFound(null, item, reject, 'NOT_FOUND')
			)
			.catch(error => reject(utils.buildErrObject(422, error.message)))
	})
}

/**
 * Builds an object with created forgot password object, if env is development or testing exposes the verification
 * @param {Object} item - created forgot password object
 */
const forgotPasswordResponse = item => {
	let data = {
		msg: 'RESET_EMAIL_SENT',
		email: item.email_address
	}
	if (process.env.NODE_ENV !== 'production') {
		data = {
			...data,
			verification: item.verification
		}
	}
	return data
}

/**
 * Checks against user if has quested role
 * @param {Object} data - data object
 * @param {*} next - next callback
 */
const checkPermissions = async (data, next) => {
	return new Promise((resolve, reject) => {
		User.findOne({
			where: {
				id: data.id
			}
		})
			.then(result => {
				if (data.roles.indexOf(result.role.id) > -1) {
					return resolve(next())
				}
				return reject(utils.buildErrObject(401, 'UNAUTHORIZED'))
			})
			.catch(err => {
				utils.itemNotFound(err, null, reject, 'NOT_FOUND')
			})
	})
}

/**
 * Gets user id from token
 * @param {string} token - Encrypted and encoded token
 */
const getUserIdFromToken = async token => {
	return new Promise((resolve, reject) => {
		// Decrypts, verifies and decode token
		jwt.verify(auth.decrypt(token), process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				reject(utils.buildErrObject(409, 'BAD_TOKEN'))
			}
			resolve(decoded.data.id)
		})
	})
}

/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.login = async (req, res) => {
	try {
		const user = await findUser(req.body.email_address)
		await userIsBlocked(user)
		await checkLoginAttemptsAndBlockExpires(user)
		const isPasswordMatch = await auth.checkPassword(req.body.password, user)
		if (!isPasswordMatch) {
			utils.handleError(res, await passwordsDoNotMatch(user))
		} else {
			// all ok, register access and return token
			user.login_attempts = 0
			await saveLoginAttemptsToDB(user)
			res.status(200).json(await saveUserAccessAndReturnToken(req, user))
		}
	} catch (error) {
		utils.handleError(res, error)
	}
}

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.register = async (req, res) => {
	try {
		/* const item = await registerUser(req)
		const userInfo = setUserInfo(item)
		const response = returnRegisterToken(item, userInfo)
		//emailer.sendRegistrationEmailMessage(locale, item)
		res.status(201).json(response) */

		const doesEmailExists = await emailer.emailExists(req.body.email_address)
		if (!doesEmailExists) {
			const item = await registerUser(req)
			const userInfo = setUserInfo(item)
			const response = returnRegisterToken(item, userInfo)
			emailer.sendRegistrationEmailMessage(item)
			res.status(201).json(response)
		}
	} catch (error) {
		utils.handleError(res, error)
	}
}

/**
 * Verify function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.verify = async (req, res) => {
	try {
		const user = await verificationExists(req.body.id)
		res.status(200).json(await verifyUser(user))
	} catch (error) {
		utils.handleError(res, error)
	}
}

/**
 * Forgot password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.forgotPassword = async (req, res) => {
	try {
		const user = await findUser(req.body.email_address)
		const item = await saveForgotPassword(req)
		emailer.sendResetPasswordEmailMessage(item)
		res.status(200).json(forgotPasswordResponse(item))
	} catch (error) {
		utils.handleError(res, error)
	}
}

/**
 * Reset password function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.resetPassword = async (req, res) => {
	try {
		const forgotPassword = await findForgotPassword(req.body.id)
		const user = await findUserToResetPassword(forgotPassword.email)
		await updatePassword(req.body.password, user)
		const result = await markResetPasswordAsUsed(req, forgotPassword)
		res.status(200).json(result)
	} catch (error) {
		utils.handleError(res, error)
	}
}

/**
 * Refresh token function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getRefreshToken = async (req, res) => {
	try {
		const tokenEncrypted = req.headers.authorization
			.replace('Bearer ', '')
			.trim()
		let userId = await getUserIdFromToken(tokenEncrypted)
		userId = await utils.isIDGood(userId)
		const user = await findUserById(userId)
		const token = await saveUserAccessAndReturnToken(req, user)
		// Removes user info from response
		delete token.user
		res.status(200).json(token)
	} catch (error) {
		utils.handleError(res, error)
	}
}

/**
 * Roles authorization function called by route
 * @param {Array} roles - roles specified on the route
 */
exports.roleAuthorization = roles => async (req, res, next) => {
	try {
		const data = {
			id: req.user.id,
			roles
		}
		console.log(data)
		await checkPermissions(data, next)
	} catch (error) {
		utils.handleError(res, error)
	}
}
