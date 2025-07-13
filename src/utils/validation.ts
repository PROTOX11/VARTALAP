import * as yup from 'yup';

export const loginSchema = yup.object({
  emailOrPhone: yup
    .string()
    .required('Email or phone number is required')
    .test('email-or-phone', 'Please enter a valid email or phone number', function(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
      return emailRegex.test(value) || phoneRegex.test(value);
    }),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});