'use server'
import {revalidatePath} from "next/cache";
import {getOneSubscription} from "@/fetch/subscriptions";
import {salable} from "@/app/salable";
import {redirect} from "next/navigation";

export const cancelSubscription = async (subscriptionUuid: string) => {
  try {
    await salable.subscriptions.cancel(subscriptionUuid, {when: 'now'})
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const subscription = await getOneSubscription(subscriptionUuid)
          if (subscription.data?.status === 'CANCELED') {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to cancel subscription'
    }
  }
  revalidatePath(`/dashboard/subscriptions/${subscriptionUuid}`)
  redirect(`/dashboard/subscriptions/${subscriptionUuid}`)
}