import axios from 'axios'

import ENVIRONMENT from "./ENVIRONMENT";

export default axios.create({
  baseURL: ENVIRONMENT.backendURL+"/",
  responseType: "json",
  withCredentials: "true", 
  credentials: "include",
  cacheControl: "no-store",
});