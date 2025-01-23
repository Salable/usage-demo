import Salable from "@salable/node-sdk";
import {env} from "@/app/environment";

export const salable = new Salable(env.SALABLE_API_KEY, 'v2')