import React, { useState, useContext } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LoginImage from '../assets/Login/login_Image.jpg'
import { API_PATH } from '../Utils/api_path';
import axiosInstance from '../Utils/axiosInstance';
import { validEmail } from '../Utils/helper';
import { UserContext } from '../Context/userContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    if (!email || !password) {
      setError('Please Fill in all Fields');
     
      setTimeout(() => {
        setError('');
      }, 3000); 
      
      return;
    }
    
    if(!validEmail(email)) {
      setError('Please Enter a valid email address');
      setTimeout(() => {
        setError('');
      }, 3000);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.LOGIN, {
        email,
        password
      });

      const { token, ...userData } = response.data;
      
      // Update user context with the complete user data including token
      updateUser({
        ...userData,
        token: token
      });
      
      // Navigate to dashboard or home page after successful login
      navigate('/dashboard'); // Change this to your desired route after login
      
    } catch (error) {
      console.error('Login Error:', error);
      let errorMessage = 'An Error occurred while Logging in. Please Try Again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid email or password.';
      }
      
      setError(errorMessage);
      setTimeout(() => {
        setError('');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  }
  
  return (
    <div className='w-full h-screen flex items-center justify-center'>

      <div className='w-[60%] h-full flex items-center justify-center'>
        <div className='w-[90%] h-[90%] rounded-[14px] border border-black overflow-hidden'>
          <img src={LoginImage} alt="Login Image" className='w-full h-full object-fill' />
        </div>
      </div>


      <div className='w-[40%] h-full flex items-center justify-center'>

        {error && (<div className='absolute top-5 right-5 text-red-500 bg-red-100 border border-red-400 rounded-[8px] py-4 px-6'>{error}</div>)}

        <form className='w-[90%] h-[90%] flex flex-col justify-center items-start gap-10' onSubmit={handleSubmit}>

          <div>
            <h1 className='font-semibold text-6xl'>Login You're Account</h1>
            <p className='font-medium'>If you don't have an account? <span className='text-[#730FFF] underline underline-offset-2'>Contact Admin</span></p>
          </div>

          <div className='w-[90%] flex flex-col gap-8'>

            <div className='flex flex-col gap-4'>
              <label htmlFor="email" className='font-semibold'>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                className='w-full h-[50px] border border-black rounded-[8px] px-4 mt-2'
                placeholder='Eg. john@gmail.com'
                disabled={isSubmitting} />
            </div>

            <div className='flex flex-col gap-4'>
              <label htmlFor="password" className='font-semibold'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className='w-full h-[50px] border border-black rounded-[8px] px-4 mt-2'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Min 6 Characters'
                  disabled={isSubmitting} />
                {showPassword ? (
                  <span onClick={() => setShowPassword(false)} className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer'><EyeOff /></span>
                ) : (
                  <span onClick={() => setShowPassword(true)} className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer'><Eye /></span>
                )}
              </div>
            </div>

            <button 
              type='submit' 
              disabled={isSubmitting}
              className={`${isSubmitting ? 'bg-gray-400' : 'bg-[#730FFF] hover:bg-[#5a00c7]'} text-white font-semibold text-lg h-[50px] mt-8 rounded-[8px] transition-all duration-300`}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default Login