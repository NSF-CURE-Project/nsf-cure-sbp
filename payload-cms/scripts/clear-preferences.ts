import type { Payload } from "payload";

export default async function clearPreferences(payload: Payload) {
  let page = 1;
  const limit = 100;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await payload.find({
      collection: "payload-preferences",
      limit,
      page,
      depth: 0,
    });

    if (!res.docs.length) break;

    for (const doc of res.docs) {
      await payload.delete({
        collection: "payload-preferences",
        id: (doc as any).id,
      });
    }

    if (page * limit >= res.totalDocs) break;
    page += 1;
  }

  payload.logger.info("Cleared all Payload admin preferences.");
}
