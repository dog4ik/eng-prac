"use client";
import React, { createContext, ReactNode, useContext, useState } from "react";
import refreshToken from "../lib/actions/refreshToken";

type AuthContextType = {
  refreshToken: () => Promise<void>;
};

export const AuthCtx = createContext({} as AuthContextType);

const AuthCtxProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthCtx.Provider value={{ refreshToken }}>{children}</AuthCtx.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthCtx);
};
export default AuthCtxProvider;
