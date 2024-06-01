import React from 'react'
import "./modal.css"
export default function Modal({children ,cname,trigger,onClose}) {
  //uq0ZUSGKzh959dZ1w6OvwaQlG4wa9jW6 secret

 // QI5icb1fWrh5QlbjyMkfcWPlVXiEhRpr key
  return (

    <div>
          { trigger?
            <div className="overlay-style">
                <div className={`modal-upload ${cname}`}>
                   {children}
                </div> 
                
            </div>
         : <div></div>
            
            }

    </div>
  )
}