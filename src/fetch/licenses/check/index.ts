import {salableProductUuid} from "@/app/constants";
import {Result} from "@/app/actions/checkout-link";
import {salable} from "@/app/salable";
import {CheckLicensesCapabilitiesResponse} from "@salable/node-sdk/dist/src/types";

export async function licenseCheck(granteeId: string): Promise<Result<CheckLicensesCapabilitiesResponse>> {
  try {
    const check = await salable.licenses.check({
      productUuid: salableProductUuid,
      granteeIds: [granteeId],
    })
    return {
      data: check,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to check license'
    }
  }
}