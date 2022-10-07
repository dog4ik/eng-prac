import axios, { Axios, AxiosError } from "axios";
const getAccess_token = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  } else return null;
};
const getRefresh_token = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  } else return null;
};
async function refreshToken() {
  return await authApi
    .post("/users/refresh", {
      refresh_token: getRefresh_token(),
    })
    .then(async (res) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", res.data.access_token);
      }
    });
}
const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_LINK,
  headers: {
    Authorization: "Bearer " + getAccess_token(),
  },
});

authApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response.status == 401 && error.response.data == "jwt expired") {
      return await refreshToken().then(() => {
        error.config.headers = { Authorization: "Bearer " + getAccess_token() };
        return axios.request(error.config);
      });
    }
    return Promise.reject(error);
  }
);
authApi.interceptors.request.use(function (config) {
  config.headers! = {
    Authorization: "Bearer " + getAccess_token(),
  };
  return config;
});
export default authApi;
