import React ,{useState,useEffect} from 'react'
import { IoIosArrowDropleft, IoIosArrowDropright} from "react-icons/io";
import axios from 'axios';


export default function Header({logout,open,setOpen,isOpen,token}) {
     console.log(isOpen,"opebn")

     const [balance,setbalance]=useState(false)

     const getActiveTrades=async()=>{
      
      try{
              axios.post('http://localhost:3003/api/v1/user',{
                token:token,
                },{
                headers: {
                    'Content-Type': 'application/json'
                  }
                })
            .then(response => {
                console.log('balance', response.data?.data?.data               );
              
                if(Number(response.data?.data?.data?.preferredFiatCurrency?.balance) <300){
                     setbalance("Low")
                }
            })
            .catch(error => {
                console.error('Error:', error);
                toast.error('Something went wrong!');
                toast.dismiss();
  
            });
  
          
         }catch(e){
        console.log(e)
       }

       
  }

  useEffect(()=>{
    token?.length >0&&getActiveTrades()
  },[token?.length])
 


  return (
    <div className='flex items-center w-full justify-between'>
           <div className='flex space-x-10'>
               <button className='border-yellow-500 px-4 py-1 border text-sm font-light' onClick={logout}>Log out</button>

               <h5 className='text-lg font-light space-x-4  '>
                    Balance is

                  <span className={balance==="Low"?"text-red-500":"text-green-500"}> {balance}</span>
               </h5>

           </div>
    

    </div>
  )
}
