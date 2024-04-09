import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod"

import { customAlphabet, nanoid } from 'nanoid'

import z from "zod";
import { db } from "../../db/connection";
import { BadRequest } from "./_errors/bad-request";

export async function registerForEvent(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/events/:eventId/attendees', {
      schema: {
        summary: 'Register an attendees',
        tags: ['attendees'],
        body: z.object({
          name: z.string().min(4),
          email: z.string().email()
        }),
        params: z.object({
          eventId: z.string().uuid()
        }),
        response: {
          201: z.object({
            ticketId: z.string()
          })
        }
      }
    }, async ({ body, params }, reply) => {
      const { eventId } = params
      const { name, email } = body

      const attendeeFromEmail = await db.attendee.findUnique({
        where: {
          eventId_email: {
            email,
            eventId
          }
        }
      })

      if (attendeeFromEmail !== null) {
        throw new BadRequest('This e-mail is already registered for this event.')
      }

      const [event, amountOfAttendeesForEvent] = await Promise.all([
        db.event.findUnique({
          where: {
            id: eventId
          }
        }),

        db.attendee.count({
          where: {
            eventId,
          }
        })
      ])

      if (event?.maximumAttendees && amountOfAttendeesForEvent >= event.maximumAttendees) {
        throw new BadRequest('The maximum number of attendees for this event has been reached.')
      }

      const nanoId = customAlphabet('1234567890abcdef', 10)
      const ticketId = nanoId(6).toUpperCase()

      const attendee = await db.attendee.create({
        data: {
          name,
          email,
          eventId,
          ticketId
        }
      })

      return reply.status(201).send({ ticketId: attendee.ticketId })
    })
}