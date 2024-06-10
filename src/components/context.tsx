import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import useSWR, { SWRResponse } from "swr";

// Create a context
type LicenseCheckFunction = (granteeIds: string[]) => SWRResponse<LicenseCheckResponse> | null
type LicenseCheckResponse = {
  capabilities: string[],
  publicHash: string,
  signature: string,
  capsHashed: string,
  capabilitiesEndDates: Record<string, string>
}


const SalableContext = createContext({
  getAllLicenses: null,
  getLicensesCount: null,
  getSubscription: null,
  checkLicense: null,
} as {
  getAllLicenses: SWRResponse<GetAllLicensesResponse> | null,
  getLicensesCount: SWRResponse<GetLicensesCountResponse> | null
  getSubscription: SWRResponse<any> | null
  checkLicense: LicenseCheckFunction | null
});

// Create a provider component
const SalableProvider = ({ children }: {children: ReactNode}) => {
  const getAllLicenses = useSWR<GetAllLicensesResponse>('/api/licenses')
  const getLicensesCount = useSWR<GetLicensesCountResponse>('/api/licenses/count')
  const getSubscription = useSWR<any>('/api/subscriptions')
  const checkLicense = (granteeIds: string[]) => {
    return useSWR<LicenseCheckResponse>(`/api/licenses/check?granteeIds=[${granteeIds.join(',')}]`)
  }

  const values = {
    getAllLicenses,
    getLicensesCount,
    getSubscription,
    checkLicense
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