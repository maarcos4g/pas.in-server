import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod"

import { z } from "zod";
import { db } from "../../db/connection";

export async function getEventAttendees(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/events/:eventId/attendees', {
      schema: {
        summary: 'Get event attendees',
        tags: ['events'],
        params: z.object({
          eventId: z.string().uuid()
        }),
        querystring: z.object({
          query: z.string().nullish(),
          pageIndex: z.string().nullish().default('0').transform(Number),
        }),
        response: {
          200: z.object({
            attendees: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                email: z.string().email(),
                createdAt: z.date(),
                checkedInAt: z.date().nullable(),
                ticketId: z.string().uuid()
              })
            ),
            total: z.number()
          })
        }
      }
    }, async ({ params, query }, reply) => {
      const { eventId } = params
      const { pageIndex, query: searchQuery } = query

      const [attendees, total] = await Promise.all([
        db.attendee.findMany({
          where: searchQuery ? {
            eventId,
            name: {
              contains: searchQuery
            }
          } : {
            eventId,
          },
          take: 10,
          skip: pageIndex * 10,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            ticketId: true,
            checkIn: {
              select: {
                createdAt: true
              }
            }
          }
        }),

        db.attendee.count({
          where: searchQuery ? {
            eventId,
            name: {
              contains: searchQuery,
            }
          } : {
            eventId,
          },
        })
      ])

      return reply.send({
        attendees: attendees.map(attendee => {
          return {
            id: attendee.id,
            name: attendee.name,
            email: attendee.email,
            createdAt: attendee.createdAt,
            checkedInAt: attendee.checkIn?.createdAt ?? null,
            ticketId: attendee.ticketId,
          }
        }),
        total
      })
    })
}