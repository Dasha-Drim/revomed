import axios from 'axios'
export default axios.create({
  //baseURL: "https://api.revomed.ru",
  baseURL: "https://dev.amont.studio:9001",
  responseType: "json",
  withCredentials: "true", 
  credentials: "include",
  cacheControl: "no-store"
});