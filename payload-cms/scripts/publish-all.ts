import type { Payload } from "payload";

export default async function publishAll(payload: Payload) {
  const collections = ["classes", "lessons"];

  for (const slug of collections) {
    let page = 1;
    const limit = 100;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const res = await payload.find({
        collection: slug,
        limit,
        page,
        depth: 0,
        draft: true,
      });

      if (!res.docs.length) break;

      for (const doc of res.docs) {
        if ((doc as any)._status === "published") continue;
        await payload.update({
          collection: slug,
          id: (doc as any).id,
          data: { _status: "published" },
        });
        payload.logger.info(`Published ${slug} -> ${(doc as any).id}`);
      }

      if (page * limit >= res.totalDocs) break;
      page += 1;
    }
  }

  payload.logger.info("Done publishing classes and lessons.");
}
