import axios from "axios";



const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Set the AUTH token for any request
axiosInstance.interceptors.request.use(function (config) {
  // Do something before request is sent
  let localStorageData = localStorage.getItem('persist:shop/user')
  if (localStorageData && typeof localStorageData === 'string') {
    localStorageData = JSON.parse(localStorageData)
    const accessToken = JSON.parse(localStorageData.token)
    config.headers['Authorization'] = `Bearer ${accessToken}`;
    return config;
  } else
    return config;
}, function (error) {
  // Do something with request error
  return Promise.reject(error);
});


export default axiosInstance;
