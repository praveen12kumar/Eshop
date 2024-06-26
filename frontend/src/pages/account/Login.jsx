import React,{useEffect, useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../features/user/userSlice';
import toast from 'react-hot-toast';
import { clearUserError, clearUserSuccess } from '../../features/user/userSlice';
import Loader from '../../components/Loader/Loader';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {isAuthenticated,isLoadingUser, userError, userSuccess} = useSelector(state=> state.user);
    const [user, setUser] = useState({
        email:"",
        password:"",
    })

    const [buttonDisabled, setButtonDisabled] = useState(false)
    const [pass, setPass] = useState(false)
    
    const handleSubmit = (e)=>{
        e.preventDefault();
        const formData = new FormData();
        formData.append("email",user.email);
        formData.append("password",user.password);
        dispatch(loginUser(formData))

        setUser(
            {
                email:"",
                password:"",
            }
        );
    }

    const showPassword = ()=>{
        setPass(!pass)
    }

    useEffect(()=>{
        if(user.email.length > 0 && user.password.length > 0 ){
            setButtonDisabled(false)
        }
        else{
            setButtonDisabled(true)
        }
    },[user])

    useEffect(()=>{
        if(userError){
            toast.error(userError);
            dispatch(clearUserError());
        }
        if(isAuthenticated){
            navigate("/account");
            return;
        }
        if(userSuccess && !isAuthenticated){
            toast.success(userSuccess)
            dispatch(clearUserSuccess())
        }
    },[userError, userSuccess, isAuthenticated, navigate, dispatch])


  return (
    isLoadingUser ? <div className="w-screen h-screen"><Loader/></div>:
    <>
        <div className='max-w-xs md:max-w-sm  mx-auto mt-24 h-auto shadow-lg bg-slate-100 border border-slate-500 p-10 rounded-lg'>
        <h1 className='text-center text-3xl font-roboto font-medium'>Login</h1>
        <form className='flex flex-col mt-8' >

        <div className="flex items-center border-2 border-slate-400 px-2 p-1 rounded-lg mb-6">
            <MdEmail/>
            <input className='w-full font-poppins outline-none px-2 py-1 bg-inherit' placeholder='Email' required type="text" value={user.email} onChange={(e)=> setUser({...user, email:e.target.value})} />
        </div>
  
        <div className="flex items-center border-2 border-slate-400 px-2 p-1 rounded-lg mb-6">
            <RiLockPasswordFill/>
            <input className='w-full outline-none font-poppins px-2 py-1 bg-inherit'placeholder='Password' required type={pass ? "text" : "password"} value={user.password} onChange={(e)=> setUser({...user, password:e.target.value})} />
            <span className='cursor-pointer' onClick={showPassword}>{user.password && !pass ? <FaEye/> : <FaEyeSlash/>}</span>
        </div>
        <div className='text-right cursor-pointer' onClick={()=>navigate("/password/forgot")}>
            <p className='text-xs font-poppins text-slate-500'>Forgot Password</p>
        </div>
        </form>
        <div className="flex items-center justify-center mt-5">
        <button onClick={handleSubmit} className='bg-slate-500 px-8 py-1 text-white rounded-2xl p-medium-18 font-poppins tracking-wider uppercase hover:bg-inherit hover:text-slate-700 hover:border border-slate-700 transition-all ease-in duration-300 hover:scale-105'>
            {buttonDisabled ? "Fill Details": "Login"}
        </button>
        </div>
        <div className="flex justify-center mt-4">
          <p>Didn't have Account <span onClick={()=>navigate("/register")} className='text-cyan-600'>Create Account</span></p>
        </div>
    </div>
    </>
  )
}

export default Login