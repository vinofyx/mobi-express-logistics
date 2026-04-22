import { loginStart, loginSuccess, loginFailure, logout, refreshTokenSuccess, setRegistered } from '../slices/authSlice';
import { authAPI } from '../../api/auth.api';

// Login thunk
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await authAPI.login(credentials);
    dispatch(loginSuccess(response.data));
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message 
      || err.message 
      || 'Login failed. Please try again.';
    dispatch(loginFailure(errorMessage));
    throw err;
  }
};

// Register thunk
export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(loginStart());
    const response = await authAPI.register(userData);
    console.log('Registration successful:', response.data);
    // Set registered flag to trigger redirect
    dispatch(setRegistered(true));
    return response.data;
  } catch (err) {
    const errorMessage = err.response?.data?.message 
      || err.message 
      || 'Registration failed. Please try again.';
    dispatch(loginFailure(errorMessage));
    throw err;
  }
};

// Logout thunk
export const logoutUser = () => async (dispatch) => {
  try {
    await authAPI.logout();
    dispatch(logout());
  } catch (err) {
    // Even if logout API fails, clear local state
    dispatch(logout());
  }
};

// Refresh token thunk
export const refreshUserToken = () => async (dispatch) => {
  try {
    const response = await authAPI.refreshToken();
    dispatch(refreshTokenSuccess({ token: response.data.accessToken }));
    return response.data;
  } catch (err) {
    // If refresh fails, logout user
    dispatch(logout());
    throw err;
  }
};
