import { useState,useEffect,useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Header from './components/header'
import Modal from './components/modal'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast';
import { ClipLoader } from 'react-spinners'
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore"
import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword ,signOut} from "firebase/auth";
import { doc,getDoc,setDoc,updateDoc,deleteDoc,collection,addDoc,query,onSnapshot,where,orderBy }  from "firebase/firestore";
import {  onAuthStateChanged } from "firebase/auth";
import { AiOutlineDelete } from "react-icons/ai";

const firebaseConfig = {
  apiKey: "AIzaSyCIFa1gbo2BWLuHAo3Oozozyt5jK_UShVY",
  authDomain: "devspage-a55cf.firebaseapp.com",
  projectId: "devspage-a55cf",
  storageBucket: "devspage-a55cf.appspot.com",
  messagingSenderId: "91329266555",
  appId: "1:91329266555:web:72941933425ad1b71ef3de",
  measurementId: "G-C2NVHD34Y1"
};


   const app = initializeApp(firebaseConfig);
   const auth =getAuth(app)
   const db=getFirestore()
const baseUrl="https://noones-be-1.onrender.com"
function App() {
    const accessToken = localStorage.getItem("token");
  const users=[
      {
        email:"sarsay123@gmail.com",
        password:"sarsay123"

      },
      {
        email:"barth@gmail.com",
        password:"sarsay123"

      },
      {
        email:"sarsay10@gmail.com",
        password:"sarsay123"

      }
  ]

  const [trigger, setTrigger] = useState("not_triggered")
  const [loading, setloading] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [user,setUser]=useState({id:""})
  const [open,setOpen]=useState(false)
  const [token,setToken]=useState("")
  const [trades,setTrades]=useState([])
  const [trade,setTrade]=useState("")

  const [cred,setCreds]=useState({})

  const userNoone = localStorage.getItem("noone");
     useEffect( ()=>{ 
        if(JSON.parse(userNoone)?.id?.length >0){
          const unsub = onSnapshot(doc(db,"users",JSON.parse(userNoone)?.id), (doc) => {
            
            setUser({...doc.data(),id:doc?.id})
            if(doc?.id?.length !=undefined){
             
               getAccessToken()
               setTrigger("triggered")
            }else{
               localStorage.clear();
                setTrigger("not_triggered")
                toast.error("You are not signed up",{duration:3000})
            }

          });

        
          }else{
            const userLogged = localStorage.getItem("noone");
            setUser(JSON.parse(userLogged ))
          }

    },[userNoone])

   console.log(user,"user>>>>>>>>>.")

  const [loggedIn,setLogin]=useState(false)

     
           


      var isOpen=true

  useEffect(()=>{
    console.log("Run again")
     const getActiveTrades=async()=>{
          try{
                  axios.post(`${baseUrl}/api/v1/get-trades`,{token:token},{
                    headers: {
                        'Content-Type': 'application/json'
                      }
                    })
                .then(response => {
                    console.log('Trades:', response.data?.data?.filter(offer=>offer?.offer_type==="sell"));
                    setTrades(response.data?.data)
                    setTrade(response.data?.data[0])
                  
                })
                .catch(error => {
                    console.error('Error:',error, error?.response?.status);
                    if(error?.response?.status==401){
                      getAccessToken()
                      
                    }else{

                    }
                });
    
              
             }catch(e){
               console.log(e,"eee")
           }
     }

     token?.length >0&&getActiveTrades()
     if(token?.length >0){
          const interval = setInterval( getActiveTrades, 60000); // 60000 ms = 1 minute

         // Clean up the interval on component unmount
          return () => clearInterval(interval);
     }


  },[token?.length])


   const getAccessToken=async()=>{

         toast.loading('Waiting for Access Token');
       try{
            
              axios.get(`${baseUrl}/api/v1/get-token`,{
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                  }
                })
            .then(response => {
                console.log('Access Token:', response.data?.data?.access_token);
                setToken(response.data?.data?.access_token)
                setTrigger("triggered")
            
                toast.dismiss();
            })
            .catch(error => {
                console.error('Error:', error);
                
                toast.error('Try again,something went wrong!');
                // setTrigger(false)
                toast.dismiss();
            });
            toast.dismiss();
     
        }catch(e){
           console.log(e)
           toast.dismiss();
        }

        
   }


    const login=async()=>{
            toast.loading('Logging in');
        try{
          const response = await signInWithEmailAndPassword(auth,cred?.email,cred?.password)
          console.log(response,"resss")
          const ref =doc(db,"users",response?.user?.uid)
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
                   getAccessToken()
                   toast.dismiss();
                   localStorage.clear();
                   localStorage.setItem('noone',JSON.stringify(docSnap.data()));
                    

              } else {
                setTrigger("not_triggered")
                throw new Error("You are not signed up")
                  console.log("No such document!");
                  
              }
          

           }catch(e){
              toast.dismiss();
              console.log(e)
              toast.error(e?.message,{duration:3000});
              setTrigger(false)
          }
       

    }

    const signup=async()=>{
        try{
          toast.loading('Loading');
          const credential = await createUserWithEmailAndPassword(auth,cred?.email,cred?.password)
          const user=credential.user
          const ref =doc(db,"users",user?.uid)
          await setDoc(ref,{id:user?.uid,role:"user",email:cred?.email})
          const docSnap = await getDoc(ref);
          if (docSnap.exists()) {
                localStorage.clear();
                localStorage.setItem('noone',JSON.stringify(docSnap.data()));
                 getAccessToken()
              }else{

          }
          toast.dismiss();

        }catch(e){
          console.log(e)
          toast.dismiss();
      }
      
    }

    const logout=async()=>{
      setTrigger("triggered")
      toast.loading('Loging out');
      
       try{
          const response=await signOut(auth)

          toast.dismiss();
          localStorage.clear();
          window.location.reload();
     
       }catch(e){
           console.log(e)

       }
       
    }

    console.log(trigger,"trigger")
  
  return (
       <div className='w-full flex'>
             <Toaster />

      
       <div className={trades?.length !=0?'w-full h-full flex justify-center py-4 bg-slate-100 h-full':"w-full h-screen flex justify-center py-4 bg-slate-100 "}>
              <div className='w-full px-10'>
                    <Header 
                    logout={logout}
                    open={open}
                    setOpen={setOpen}
                    isOpen={isOpen}
                    token={token}
                    />



                <div className='flex w-full py-10 space-x-10'>
                       <div className='w-3/5'>
                           <div className='w-full  py-2 rounded-lg px-8'>
                               <h5 >Active Trades({trades?.length})</h5>
                            </div>


                            <div className='py-4 flex flex-col space-y-10'>
                              <Trades 
                                 trades={trades}
                                 setTrade={setTrade}
                                 trade={trade}
                              />
                              {user?.role !="user"&&
                              <Users />
                           }

                            </div>

                       </div>

                       <div className='w-2/5  flex flex-col space-y-4'>
                           {trades?.length !=0&&
                                  <Details
                                  trade={trade}
                                  token={token}
                                  
                                />

                           }
                          {trades?.length !=0&&
                            <Chat 
                             trade={trade}
                             token={token}
                              
                            />
                          }
                        
                      </div>

                </div>

              </div>



       </div>
          <Modal trigger={trigger=="triggered"?false:true}  cname="w-1/5 py-2  bg-white  px-4 rounded-lg ">
                  
                        <div className=' space-y-8 w-full flex flex-col items-center py-8 '>
                                 <h5 className='font-semibold'>Dashboard</h5>

                              <div className='flex flex-col space-y-4 w-full px-4'>
                                    <input 
                                      placeholder='Email'
                                      className='rounded-lg border w-full py-2 text-sm px-2'
                                      onChange={(e)=>setCreds({...cred,email:e.target.value})}
                                    />
                                    <input 
                                      placeholder='Password'
                                      className='rounded-lg border w-full py-2 text-sm px-2'
                                      type={"password"}
                                      onChange={(e)=>setCreds({...cred,password:e.target.value})}
                                    />

                              </div>
                             
                                          
                               
                              {!loggedIn?     
                                 <button className='bg-yellow-400 text-sm py-2 px-10 rounded-sm'   onClick={login}>
                                        Login
                                  </button>
                                  :
                                  <button className='bg-yellow-400 text-sm py-2 px-10 rounded-sm'   onClick={signup}>
                                      Sign up
                                  </button>
                               }
                                           

                                 


                              

                              <div className='flex justify-center'>
                                {!loggedIn?
                                    <h5 className='text-sm font-semibold hover:text-yellow-500' onClick={()=>setLogin(true)}>Sign up</h5>
                                    :
                                    <h5 className='text-sm font-semibold hover:text-yellow-500' onClick={()=>setLogin(false)}>Login</h5>
                                }
                                  
                                  
                              </div>
    
        
                          </div>
               
          </Modal>





      

       </div>
  )
}

export default App



const Trades=({trades,setTrade,trade})=>{
  return(
    <div>
        <table class="table-auto w-full border-separate-4 border-spacing-2">
                <thead className='py-2 bg-yellow-100'>
                <tr >
                      {
                        ["Amount",
                          "Partner",
                        "Trade",
                        "Method",
                        "Started",
                        "Status",
                        ""
                      

                        ].map((text)=>{
                            return(
                            <th className='py-3 text-sm text-slate-800 text-center'>{text}</th>
                        )
                        })
                    }
                         </tr>
                    
                </thead>

                <tbody className='w-full '>
                    
                    {trades?.map((trading,index)=>{
                         
                          return(
                          
                              <Row 
                                 trading={trading}
                                 setTrade={setTrade}
                                 trade={trade}
                              />
                              

                          )
                      })

                    }
                 


                </tbody>

 </table>

    </div>
  )
}





const Row=({trading,setTrade,trade})=>{

    return(
      <tr className={trading?.trade_hash==trade?.trade_hash?'border-b py-3 bg-green-100':'border-b py-3 hover:bg-green-100'} onClick={()=>setTrade(trading)}>
           <td className='text-sm font-light text-slate-500 py-6'>
               <div className='flex space-x-1'>
                  
                         <h5>{trading?.fiat_currency_code}</h5>
                         <h5>{trading?.fiat_amount_requested}</h5>
                       

                    

               </div>
           </td>

           <td className='text-sm font-light text-slate-500 text-center py-6'>{trading?.responder_username}</td>

           <td className='text-sm font-light text-slate-500 text-center py-6'>{trading?.offer_type}</td>
           <td className='text-sm font-light text-slate-500 text-center py-6'>{trading?.payment_method_name}</td>
           <td className='text-sm font-light text-slate-500 text-center py-6'>{trading?.started_at}</td>
           <td className='text-sm font-light text-slate-500 text-center py-6'>{trading?.trade_status}</td>

       </tr>

    )
}








const Chat=({trade,token})=>{
   const [msgs,setMsg]=useState([])
   const [text,setText]=useState("")
   const chatRef= useRef(null);
   const [loader,setLoader]=useState(false)

   const getActiveTrades=async()=>{
    toast.loading('Fetching....');
    try{
            axios.post(`${baseUrl}/api/v1/get-chat`,{
              token:token,
              hash:trade?.trade_hash,
              },{
              headers: {
                  'Content-Type': 'application/json'
                }
              })
          .then(response => {
              console.log('message:', response.data?.data);
              setMsg(response.data?.data)
              toast.dismiss();
            
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
    console.log("Run again")
    

     token?.length >0&&getActiveTrades()
     if(token?.length >0){
      const interval = setInterval( getActiveTrades, 60000); // 60000 ms = 1 minute

      // Clean up the interval on component unmount
      return () => clearInterval(interval);
     }

  },[trade?.trade_hash])


  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  },[msgs])


  const sendMsg=async()=>{
    setLoader(true)
        try{
          axios.post(`${baseUrl}/api/v1/send-chat`,{
            token:token,
            hash:trade?.trade_hash,
            msg:text
            },{
            headers: {
                'Content-Type': 'application/json'
              }
            })
            .then(response => {
              setText("")
                console.log('Trades:', response.data?.data?.status);
                response.data?.data?.status==="success"&&getActiveTrades()
               
              
            })
            .catch(error => {
                console.error('Error:', error);
            });
            

        }catch(e){
          console.log(e)
        }
        setLoader(false)
  }

  return(
   <div className='w-full  py-6 rounded-lg  relative bg-white' style={{height:"80vh"}}>
            <div className='flex items-center justify-between  bg-white px-6'>
                   <div className='flex items-center space-x-3'>
                         <h5 className='text-green-500 font-semibold text-sm'>{trade?.responder_username}</h5>
                         <img
                           src={trade?.responder_avatar_url}
                            className="h-6 rounded-full  w-6"
                          />

                   </div>
                   <h5 className='text-xs font-light text-slate-700'>Last seen:{trade?.responder_last_seen}</h5>

            </div>


            <div className='flex px-6 flex-col space-y-4 py-6 h-4/5 py-6 overflow-y-scroll ' ref={chatRef}>
                       {msgs?.map((msg)=>{
                         return(
                           <div className='pb-4'>
                              {msg?.author==null?
                                <div className='bg-green-100 py-2 px-2 rounded-lg'>
                                    {msg?.text?.bank_account != undefined?
                                        <div>
                                            {/* {msg?.text?.bank_account?.holder_name} */}
                                        </div>
                                        :
                                        <div className=''>
                                          <p className='text-xs font-semibold'>{msg?.text}</p>

                                        </div>
                                    }

                                </div>
                                :
                                <>
                                {msg?.type == "trade_attach_uploaded"?
                                  <div className={msg?.author==trade?.owner_username? 'flex w-full justify-end':"flex w-full justify-start"}>
                                
                                      <img
                                        src={msg?.text?.files[0]?.full_url}
                                       />
                                   </div>
                                   :
                                   <div className={msg?.author==trade?.owner_username? 'flex w-full justify-end':"flex w-full justify-start"}>
                                   <div className={msg?.author==trade?.owner_username?'bg-slate-400 py-2 px-4 rounded-lg ':'bg-green-400 py-2 px-4 rounded-lg '}>
                                         <p className='text-xs'>
                                           {msg?.text}
                                        </p>
                                  </div>
                            </div>

                                }
                                
                                
                                </>
                           
                               }
                           </div>
                         )
                       })

                       }


            </div>


            <div className='bg-white border-t bottom-0 absolute h-20  w-full  py-2 '>
                   <div className='bg-white h-full w-full flex items-center space-x-4 px-4' >
                            <textarea
                                 className='border border-green-300 px-4 py-2 w-full h-12 rounded-lg outline-none text-xs'
                                 onChange={(e)=>setText(e.target.value)}
                            />
                            {loader?
                                <ClipLoader color='green' size={10}/>
                                :
                              <button className=' font-semibold bg-yellow-400 py-2 rounded-lg text-xs  px-4' onClick={sendMsg}>Send</button>

                                  
                              


                            }
               
 
                   </div>

            </div>

      </div>
  )
   
}





const Details=({trade,token})=>{

  const [details,setDetails]=useState()
      
  const release=async()=>{
    toast.loading('Loading');
    if(trade?.trade_status != "Paid"){
      toast.dismiss();
      toast.error('Trade is not marked as paid');

      return

    }

    // if(trade?.trade_status == "Paid"){
    //  alert("Confirm ")

    //   return

    // }
    alert("Confirm this ")

    try{
      axios.post(`${baseUrl}/api/v1/release`,{
        token:token,
        hash:trade?.trade_hash,

        },{
        headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => {
            
            console.log('Trades:', response.data?.data?.status);
            // response.data?.data?.status==="success"&&getActiveTrades()        
            toast.dismiss();
            toast.success('Crypto has been released!');
          
        })
        .catch(error => {
            console.error('Error:', error);
            toast.dismiss();
        });

    }catch(e){
      console.log(e)
    }
}






   return(
      <div className='bg-white h-56 rounded-lg '>
            <div className='py-4 border-b '>
               <h5 className='px-4 text-sm font-semibold'>You are selling {trade?.fiat_amount_requested} {trade?.fiat_currency_code} using {trade?.payment_method_name}</h5>

            </div>

            <div className='py-4 px-4 space-y-4'>
                 <h5 className={trade?.trade_status !="Active funded"? 'text-sm font-semibold text-green-500':'text-sm font-semibold text-red-500'}>{trade?.trade_status !="Active funded"? "Buyer has marked has paid" : "Do not release" }</h5>
                 <button className='bg-yellow-300 py-2 px-4 text-sm rounded-lg' onClick={release}>Release</button>

            </div>

      </div>
   )
}




const Users=()=>{
  const [users,setUsers]=useState([])



  useEffect(()=>{
  
      const q = query(collection(db, "users"),where('role','==','user'));
          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const products = []
            querySnapshot.forEach((doc) => {
              products.push({ ...doc.data(), id: doc.id })
  
            });
  
      
             setUsers(products)
      });
  
  },[])
    return(
      <div className='space-y-5'>
                <h5 className='px-8 ' >Active users({users?.length})</h5>

                <div>
        <table class="table-auto w-full border-separate-4 border-spacing-2">
                <thead className='py-2 bg-yellow-100'>
                <tr >
                      {
                        ["ID",
                          "Email",
                        ""
                      

                        ].map((text)=>{
                            return(
                            <th className='py-3 text-sm text-slate-800 text-center'>{text}</th>
                        )
                        })
                    }
                         </tr>
                    
                </thead>

                <tbody className='w-full '>
                    
                    {users?.map((user,index)=>{
                         
                          return(
                          
                              <UserRow
                                 user={user}
                              
                              />
                              

                          )
                      })

                    }
                 


                </tbody>

        </table>

            </div>

      </div>
    )
}












const UserRow=({user})=>{
  const deleteUser=async()=>{
    toast.loading("Deleting user")
    try{

      await deleteDoc(doc(db,"users",user?.id));
    
      const userauth = auth.currentUser;
    
     await deleteUser(userauth)
     toast.dismiss()
        
    }catch(e){
      toast.dismiss()
        console.log(e)
    }
  
}

    return(
      <tr className={'border-b py-3 bg-green-100'} >
        
           <td className='text-sm font-light text-slate-500 text-center py-6'>{user?.id}</td>

           <td className='text-sm font-light text-slate-500 text-center py-6'>{user?.email}</td>
           <td className='text-sm font-light text-slate-500 text-center py-6' onClick={()=>deleteUser()}>
              <AiOutlineDelete className='text-xl text-red-500'/>
           </td>
        
       </tr>

    )
}
