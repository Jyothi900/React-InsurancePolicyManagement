import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { tokenstore } from "../auth/tokenstore";
import { getToken } from "../api/auth.api";
import {Container,Box,Paper,TextField,IconButton, InputAdornment,Button} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useDispatch } from "react-redux";
import {login} from "../slices/authslice";
import type { UserRole } from "../types/Common";



function Login(){
  const [email,setEmail]=useState("");
  const [password,setPwd]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const nav=useNavigate();
  const dispatch = useDispatch();
  
  const onSubmit=async(e:FormEvent)=>{
    e.preventDefault();
    try {
      const response = await getToken({email,password});
      console.log("Login successful");
      
      const {token,role} = response;
      tokenstore.set(token);
      tokenstore.setRole(role?.toString() ?? null);
      
      dispatch(login({id: response.id || '', email, role: role?.toString() ?? ''}))

      console.log("Authentication completed");

      if(role === 2) nav("/dashboard"); // 2 = Admin
      else nav("/dashboard");
    } catch (error) {
      console.error('Login failed');
    }
  }
  return(
    <Box display="flex" flexDirection="column" gap={2}>
      <TextField label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)}  fullWidth margin="normal"></TextField>
      <TextField label="Password" type={showPassword ?'text':'password'} value={password} onChange={(e)=>setPwd(e.target.value)} fullWidth margin="dense" 
        InputProps={{
          endAdornment:(
            <InputAdornment position="end">
              <IconButton onClick={()=>setShowPassword(!showPassword)}>
                {showPassword?<VisibilityOff/>:<Visibility/>}
              </IconButton>
            </InputAdornment>
          )
        }}
        ></TextField>
        <Box display="flex" justifyContent="center" mt={2}>
          <Button variant="contained" color="primary" size="large"  onClick={onSubmit}>Login</Button>
        </Box>
     
    </Box>
  )
  
}
export default function LoginPage(){
  return (
    <Container maxWidth="sm">
      <Box display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper elevation={1} sx={{padding: 10, width: '100%'}}>
           <Login></Login>
        </Paper>
        
      </Box>
    </Container>
  )
}
