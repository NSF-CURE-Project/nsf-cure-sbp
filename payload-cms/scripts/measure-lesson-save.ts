import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

const now = () => Date.now()

const t0 = now()
const payload = await getPayload({ config: configPromise })
const tInit = now() - t0

const tFind0 = now()
const lessons = await payload.find({ collection: 'lessons', limit: 1, depth: 0, draft: true })
const tFind = now() - tFind0

const first = lessons.docs[0] as any
if (!first?.id) {
  console.log(`MEASURE no lessons init=${tInit}ms find=${tFind}ms`)
  process.exit(0)
}

const tUpdate0 = now()
await payload.update({
  collection: 'lessons',
  id: first.id,
  data: { order: typeof first.order === 'number' ? first.order : 1 },
  depth: 0,
  draft: true,
})
const tUpdate = now() - tUpdate0
console.log(`MEASURE lesson=${first.id} init=${tInit}ms find=${tFind}ms update=${tUpdate}ms`)
