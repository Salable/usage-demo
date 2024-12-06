import {env} from "@/app/environment";
import {salableApiBaseUrl, salableProductUuid} from "@/app/constants";
import {LicenseCheckResponse} from "@/components/forms/string-generator-form";
import {Result} from "@/app/actions/checkout-link";
import {getErrorMessage} from "@/app/actions/get-error-message";

export async function licenseCheck(granteeId: string): Promise<Result<LicenseCheckResponse | null>> {
  try {
    const res = await fetch(`${salableApiBaseUrl}/licenses/check?granteeIds=${granteeId}&productUuid=${salableProductUuid}`, {
      headers: { 'x-api-key': env.SALABLE_API_KEY, version: 'v2' },
      cache: "no-store"
    })
    if (res.ok) {
      if (res.headers.get('content-type') === 'text/plain') {
        return {
          data: null,
          error: null
        }
      }
      const data = await res.json() as LicenseCheckResponse
      return {
        data,
        error: null
      }
    }
    const error = await getErrorMessage(res)
    console.log(error)
    return {
      data: null,
      error: 'Failed to fetch license check'
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Unknown error'
    }
  }
}