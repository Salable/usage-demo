import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import useSWR, { SWRResponse } from "swr";
import {useRouter} from "next/navigation";

type LicenseCheckFunction = (granteeIds: string[]) => SWRResponse<LicenseCheckResponse> | null
type GetUserFunction = (id: string) => SWRResponse<User> | null
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
  // getUser: null,
  user: null,
  setUser: null
} as {
  getAllLicenses: SWRResponse<GetAllLicensesResponse> | null,
  getLicensesCount: SWRResponse<GetLicensesCountResponse> | null
  getSubscription: SWRResponse<any> | null
  checkLicense: LicenseCheckFunction | null,
  // getUser: GetUserFunction | null,
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>> | null
});

export type User = {
  id: string;
  firstName: string;
  lastName: string;
}

const SalableProvider = ({ children }: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
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
    checkLicense,
    user,
    setUser
  }


  useEffect(() => {
    const storedUser = window.localStorage.getItem('salable_user_id')
    if (storedUser && user) {
      window.localStorage.setItem('salable_user_id', user.id)
    }
    if (storedUser && !user) {
      const getUserFetch = async () => {
        const userRes = await fetch(`/api/users/${storedUser}`)
        const user = await userRes.json()
        setUser(user)
      }
      getUserFetch()
    }
    if (!storedUser && !user) {
      router.push('/sign-in')
    }
  }, [user]);

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