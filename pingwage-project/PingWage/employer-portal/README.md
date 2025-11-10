# PingWage Employer Portal

A simple web portal for employers to manage their company information and employees.

## Features

- View company information and ID
- Add employees by phone number
- View all linked employees
- Remove employees from company

## How to Access

Once the backend server is running, access the portal at:

```
http://localhost:3000/employer-portal
```

Or on your network:
```
http://10.30.0.117:3000/employer-portal
```

## How to Use

### 1. Login
- Use your employer email and password
- These are the credentials you created when registering as an employer

### 2. View Company Information
- Your company name will be displayed
- **Company ID** is shown - share this with employees so they can link to your company

### 3. Add Employees

To add an employee:
1. Enter their **phone number** (including country code, e.g., +41791234567)
2. Optionally enter their name
3. Click "Add Employee"

**Important:** The employee must have already signed up in the mobile app before you can add them.

### 4. View Employees
- All employees linked to your company are listed
- Shows their name, phone number, and status (Linked/Pending)

## API Endpoints Used

The portal uses these backend endpoints:

- `POST /api/v1/auth/login` - Login with email/password
- `GET /api/v1/employers/me` - Get employer profile
- `GET /api/v1/employers/employees` - Get all employees
- `POST /api/v1/employers/employees` - Add new employee by phone
- `DELETE /api/v1/employers/employees/:id` - Remove employee

## Testing

To test the employer portal:

1. **Start the backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Open the portal:**
   Navigate to `http://localhost:3000/employer-portal` in your browser

3. **Login with employer credentials:**
   - If you don't have an employer account, create one using the auth endpoints
   - Email: your-employer-email@company.com
   - Password: your-password

4. **Add employees:**
   - Use phone numbers of users who have already signed up in the mobile app
   - Example: +41791234567

## Troubleshooting

### "No user found with phone number"
- The employee needs to sign up in the mobile app first
- Make sure you're using the correct phone number format (with country code)

### "Login failed"
- Check that your email and password are correct
- Make sure the backend server is running
- Check the browser console for error messages

### Can't access the portal
- Make sure the backend server is running on port 3000
- Check that the employer-portal files are in the correct location
- Try accessing via `http://localhost:3000/employer-portal` or `http://127.0.0.1:3000/employer-portal`

## Security Notes

- Passwords are hashed and stored securely
- JWT tokens are used for authentication
- Tokens are stored in browser localStorage
- All API requests require authentication

## Future Enhancements

Potential features to add:
- Employee search and filtering
- Bulk employee import (CSV)
- Employee details editing
- Payroll management
- Earnings reports
- Company settings management
