import { Hono } from "hono";
import { gateway } from "./gateway";

const index = new Hono();

index.route('/gateways', gateway)

export default index