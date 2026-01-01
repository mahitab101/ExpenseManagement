import { createContext } from "react";



type AuthContextType = {
    accessToken : string | null;
    setAccessToken : (token:string)=> void
    user :{} 
}
const AuthContext = createContext(undefined);