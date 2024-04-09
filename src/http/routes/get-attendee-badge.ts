import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod"

import { z } from "zod";
import { db } from "../../db/connection";
import { BadRequest } from "./_errors/bad-request";

export async function getAttendeeBadge(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/attendees/:attendeeId/badge', {
      schema: {
        summary: 'Get an attendee badge',
        tags: ['attendees'],
        params: z.object({
          ticketId: z.string(), //converter string em number
        }),
        response: {
          200: z.object({
            badge: z.object({
              name: z.string(),
              email: z.string().email(),
              eventTitle: z.string(),
              checkInURL: z.string().url(),
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
          name: true,
          email: true,
          event: {
            select: {
              title: true,
            }
          }
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
          name: attendee.name,
          email: attendee.email,
          eventTitle: attendee.event.title,
          checkInURL: checkInURL.toString()
        }
      })


    })
}