import React, { useContext } from 'react'
import { getInitials } from '../../Utils/helper'
import { UserContext } from '../../Context/userContext';
import { useNavigate } from 'react-router-dom'; 

const Navbar = ({ user, active }) => {
  const navigate = useNavigate();
  const { clearUser } = useContext(UserContext);
  const handleClick = (element) => {
    navigate(element);
  }
  const handleLogout = () => {
    clearUser();
  };
  return (
    <div className='h-[80px] w-full flex-center'>
        <div className='w-[90%] h-full flex items-center justify-between'>
            <div className='text-2xl font-bold text-black cursor-pointer'><span className='text-[#730FFF]'>A</span>daptive <br /><span className='text-[#730FFF]'>L</span>earning</div>
            <ul className='flex items-center gap-8 text-lg font-semibold text-black'>
                <li className={active === 'dashboard' ? 'text-[#730FFF] cursor-pointer' : 'cursor-pointer'} onClick={() => handleClick('/dashboard')}>Dashboard</li>
                <li className={active === 'subject' ? 'text-[#730FFF] cursor-pointer' : 'cursor-pointer'} onClick={() => handleClick('/subject')}>Subject</li>
                <li className={active === 'subject' ? 'text-[#730FFF] cursor-pointer' : 'cursor-pointer'} onClick={() => handleClick('/quiz')}>Quiz</li>
                <li className={active === 'subject' ? 'text-[#730FFF] cursor-pointer' : 'cursor-pointer'} onClick={() => handleClick('/flipcards')}>Flipcards</li>
                <li className='text-red-500 cursor-pointer' onClick={handleLogout}>Logout</li>
                <li><div className='w-[40px] h-[40px] rounded-full border-2 border-[#730FFF] flex-center'>{getInitials(user.username)}</div></li>
            </ul>
        </div>
    </div>
  )
}

export default Navbar