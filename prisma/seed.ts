import { db } from '../src/db/connection'

async function seed() {
  await db.event.create({
    data: {
      id: '922a91de-93e1-40cb-8d6a-e69512ba2c06',
      title: "Unite Summit",
      slug: 'unite-summit',
      details: 'Um evento p/ devs apaixonados por código!',
      maximumAttendees: 120
    }
    
  })
}

seed().then(() => {
  console.log('🔥 Database seeded!')
  db.$disconnect()
})