
import http from 'http';

const email = `test_instructor_${Date.now()}@example.com`;
console.log(`Attempting to register: ${email}`);

const data = JSON.stringify({
    name: 'Test Instructor',
    email: email,
    password: 'password123',
    role: 'INSTRUCTOR',
    expertise: 'Data Science',
    experience: '10',
    linkedin: 'https://linkedin.com/in/test',
    bio: 'A test bio'
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);

    let body = '';
    res.on('data', (chunk) => {
        body += chunk;
    });

    res.on('end', () => {
        console.log('Response:', body);
        if (res.statusCode === 201) {
            console.log('SUCCESS: Instructor registered.');
        } else {
            console.log('FAILED: Registration failed.');
        }
    });
});

req.on('error', (error) => {
    console.error('ERROR:', error);
});

req.write(data);
req.end();
