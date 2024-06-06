import React, {createContext, ReactNode, useContext, useState} from 'react';
import useSWR, { SWRResponse } from "swr";

// Create a context
const SalableContext = createContext({
  getAllLicenses: null,
  getLicensesCount: null,
  getSubscription: null
} as {
  getAllLicenses: SWRResponse<GetAllLicensesResponse> | null,
  getLicensesCount: SWRResponse<GetLicensesCountResponse> | null
  getSubscription: SWRResponse<any> | null
});

// Create a provider component
const SalableProvider = ({ children }: {children: ReactNode}) => {
  const getAllLicenses = useSWR<GetAllLicensesResponse>('/api/licenses')
  const getLicensesCount = useSWR<GetLicensesCountResponse>('/api/licenses/count')
  const getSubscription = useSWR<GetLicensesCountResponse>('/api/subscriptions')

  const values = {
    getAllLicenses,
    getLicensesCount,
    getSubscription
  }

  return (
    <SalableContext.Provider value={values}>
      {children}
    </SalableContext.Provider>
  );
};


const useSalableContext = () => {
  return useContext(SalableContext);
};
export { SalableContext, SalableProvider, useSalableContext };

type GetLicensesCountResponse = {
  assigned: number;
  unassigned: number;
  count: number;
}

type GetAllLicensesResponse = {
  first: string;
  last: string;
  data: License[]
}

type License = {
  uuid: string;
  startTime: string;
  granteeId: string;
}