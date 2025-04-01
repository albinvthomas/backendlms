// === Frontend (React) ===
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LMS = () => {
    const [courses, setCourses] = useState([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/courses')
            .then(res => setCourses(res.data))
            .catch(err => console.log(err));
    }, []);

    const handleRegister = async () => {
        await axios.post('http://localhost:5000/register', { email, password });
        alert('Registered successfully!');
    };

    const handleLogin = async () => {
        const res = await axios.post('http://localhost:5000/login', { email, password });
        setUserId(res.data.userId);
        alert('Login successful!');
    };

    const handleEnroll = async (courseId) => {
        await axios.post('http://localhost:5000/enroll', { userId, courseId, email });
        alert('Enrolled successfully!');
    };

    const fetchEnrolledCourses = async () => {
        if (!userId) return;
        const res = await axios.get(`http://localhost:5000/my-courses/${userId}`);
        setEnrolledCourses(res.data);
    };

    return (
        <div>
            <h1>Available Courses</h1>
            {courses.map(course => (
                <div key={course._id}>
                    <h2>{course.title}</h2>
                    <p>{course.description}</p>
                    <p>{course.isFree ? 'Free' : `$${course.price}`}</p>
                    <button onClick={() => handleEnroll(course._id)}>Enroll</button>
                </div>
            ))}
            
            <h2>User Authentication</h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleRegister}>Register</button>
            <button onClick={handleLogin}>Login</button>

            <h2>My Courses</h2>
            <button onClick={fetchEnrolledCourses}>Load Enrolled Courses</button>
            {enrolledCourses.map(course => (
                <div key={course._id}>
                    <h2>{course.title}</h2>
                </div>
            ))}
        </div>
    );
};

export default LMS;
