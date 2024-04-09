import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod"

import { z } from "zod";
import { db } from "../../db/connection";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeeBadge(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:ticketId/badge', {
      schema: {
        summary: 'Get an attendee badge',
        tags: ['attendees'],
        params: z.object({
          ticketId: z.string(),
        }),
        response: {
          200: z.object({
            badge: z.object({
              attendeeId: z.string().uuid(),
              name: z.string(),
              email: z.string().email(),
              eventTitle: z.string(),
              checkInURL: z.string().url(),
              ticketId: z.string(),
            })
          })
        }
      }
    }, async ({ params, url, protocol, hostname }, reply) => {
      const { ticketId } = params

      const attendee = await db.attendee.findUnique({
        where: {
          ticketId
        },
        select: {
          id: true,
          name: true,
          email: true,
          event: {
            select: {
              title: true,
            }
          },
          ticketId: true
        }
      })

      if (attendee === null) {
        throw new BadRequest('Attendee not found')
      }

      const baseURL = `${protocol}://${hostname}`

      console.log(baseURL)

      const checkInURL = new URL(`/attendees/${ticketId}/check-in`, baseURL)

      return reply.send({
        badge: {
          attendeeId: attendee.id,
          name: attendee.name,
          email: attendee.email,
          eventTitle: attendee.event.title,
          checkInURL: checkInURL.toString(),
          ticketId: attendee.ticketId,
        }
      })


    })
}