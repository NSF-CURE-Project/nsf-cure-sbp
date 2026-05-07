import { getPayload } from "payload";
import configPromise from "@payload-config";
import seedStaticsFundamentalsExample from "../src/seed/staticsFundamentalsExample";

async function run() {
  const payload = await getPayload({ config: configPromise });
  await seedStaticsFundamentalsExample(payload);
  console.log("seed complete");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
