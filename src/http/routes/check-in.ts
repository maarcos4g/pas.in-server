import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod"

import { z } from "zod";
import { db } from "../../db/connection";
import { BadRequest } from "./_errors/bad-request";

export async function checkIn(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:attendeeId/check-in', {
      schema: {
        summary: 'Check-in an attendee',
        tags: ['check-ins'],
        params: z.object({
          attendeeId: z.string().uuid()
        }),
        response: {
          201: z.null()
        }
      }
    }, async ({ params }, reply) => {
      const { attendeeId } = params

      const attendeeCheckIn = await db.checkIn.findUnique({
        where: {
          attendeeId,
        }
      })

      if (attendeeCheckIn !== null) {
        throw new BadRequest('Attendee already checked in.')
      }

      await db.checkIn.create({
        data: {
          attendeeId,
        }
      })

      return reply.status(201).send()

    })
}