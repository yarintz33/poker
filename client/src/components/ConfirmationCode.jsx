// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import '../css/ConfirmationCode.css';

// function ConfirmationCode() {
//   const [code, setCode] = useState('');
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await fetch('http://localhost:5000/api/1/registeration/confirmation', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ code }),
//       });

//       if (response.ok) {
//         // Redirect to login page after successful verification
//         navigate('/');
//       } else {
//         alert('Invalid verification code');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Something went wrong');
//     }
//   };

//   return (
//     <div className="confirmation-container">
//       <div className="confirmation-box">
//         <h2>Email Verification</h2>
//         <p>Please enter the verification code sent to your email</p>
        
//         <form onSubmit={handleSubmit}>
//           <div className="code-input">
//             <input
//               type="text"
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//               placeholder="Enter verification code"
//               maxLength="6"
//             />
//           </div>
//           <button type="submit">Verify</button>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ConfirmationCode; 