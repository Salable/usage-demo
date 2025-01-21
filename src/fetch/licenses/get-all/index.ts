import {Result} from "@/app/actions/checkout-link";
import {salable} from "@/app/salable";
import {GetLicenseOptions, PaginatedLicenses} from "@salable/node-sdk/dist/src/types";

export async function getAllLicenses(params?: GetLicenseOptions): Promise<Result<PaginatedLicenses>> {
  try {
    const data = await salable.licenses.getAll(params)
    return {
      data, error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch licenses'
    }
  }
}