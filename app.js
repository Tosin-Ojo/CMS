const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const hbs = require('express-handlebars')
const { mongoDbUrl, PORT, globalVariables } = require('./config/config')
const flash = require('connect-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const { selectOption } = require('./config/customFunctions')
const fileUpload = require('express-fileupload')
const passport = require('passport')


const app = express()


// Configure Mongoose to Connect to MongoDB
mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(response => {
    console.log('MongoDB connected Successfully.')
}).catch(err => {
    console.log('Database connection failed.')
})

// Setup View Engine to Use Handlebars
app.engine('handlebars', hbs({ defaultLayout: 'default', helpers: {select: selectOption} }))
app.set('view engine', 'handlebars')


// Configuration
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))


// Flash and Session
app.use(session({
    secret: 'anysecret',
    saveUninitialized: true,
    resave: true
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use(globalVariables)

// File Upload Middleware
app.use(fileUpload())

// Method Override Middleware
app.use(methodOverride('newMethod'))

// Routes
const defaultRoutes = require('./routes/defaultRoutes')
const adminRoutes = require('./routes/adminRoutes')

app.use('/', defaultRoutes)
app.use('/admin', adminRoutes)



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})