
import  api  from "@/service/axios";
import type { RegisterFormInputs, ApiResponse, UserData, LoginFormInputs } from "@/Types";
//Request failed with status code 400
export const registerApi = async (
  formData: RegisterFormInputs
): Promise<ApiResponse<UserData>> => {
  const res = await api.post("/Accounts/register", {
    ...formData
  });

  return res.data;
};

export const loginApi = async (
  formData: LoginFormInputs
): Promise<ApiResponse<UserData>> => {
  const res = await api.post("/Accounts/login", {
    ...formData
  });

  return res.data;
};
export const logoutApi = async () => {
  const res = await api.post("/Accounts/logout");

  return res.data;
};

export const refreshTokenApi = async () => {
  const res = await api.post("/Accounts/refreshToken");

  return res.data;
}


export const sendConfirmationEmailApi = async (email: string) => {
  const res = await api.post("/Accounts/send-confirmation-email", { email });
  return res.data as ApiResponse<null>;
};

export const getUserSessionsApi = async () => {
  const res = await api.get("/Accounts/sessions");
  return res.data;
};

export const analyzeExpensesApi = async (expenses:any) => {
  const res = await api.post("/Insights/analyze", expenses);
  return res.data;
};