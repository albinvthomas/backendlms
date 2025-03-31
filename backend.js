// Full LMS Project Code

// === Backend (Node.js + Express) ===
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')('your-stripe-secret-key');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('your-mongodb-connection-string', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

const CourseSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    isFree: Boolean
});
const Course = mongoose.model('Course', CourseSchema);

const EnrollmentSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    courseId: mongoose.Schema.Types.ObjectId
});
const Enrollment = mongoose.model('Enrollment', EnrollmentSchema);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password'
    }
});

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    res.json({ message: 'User registered successfully!' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });
    res.json({ token, userId: user._id });
});

app.post('/enroll', async (req, res) => {
    const { userId, courseId, email } = req.body;
    const newEnrollment = new Enrollment({ userId, courseId });
    await newEnrollment.save();

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Course Enrollment Confirmation',
        text: 'You have successfully enrolled in the course!'
    };
    transporter.sendMail(mailOptions);

    res.json({ message: 'Enrolled successfully!' });
});

app.get('/my-courses/:userId', async (req, res) => {
    const { userId } = req.params;
    const enrollments = await Enrollment.find({ userId }).populate('courseId');
    res.json(enrollments.map(e => e.courseId));
});

app.listen(5000, () => console.log('Server running on port 5000'));

