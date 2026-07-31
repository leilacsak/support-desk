import { AppError } from "../errors/AppError.js";
import * as ticketRepository from "../repositories/ticketRepository.js";

export async function listTickets(userId) {
  return ticketRepository.findAllVisible(userId);
}

export async function countTickets() {
  return ticketRepository.countAll();
}

export async function countOpenTickets(userId) {
  return ticketRepository.countByStatusVisibleTo("open", userId);
}

export async function getTicketById(id, userId) {
  const ticket = await ticketRepository.findByIdVisibleTo(id, userId);

  if (!ticket) {
    throw AppError.notFound(`Ticket ${id} not found`);
  }

  return ticket;
}
