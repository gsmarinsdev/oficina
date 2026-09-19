import { Linking, Platform } from 'react-native';

import { SHOP } from '@/constants/shop';
import { getClient } from '@/data/clientsRepository';
import { getOrder, listOrderItems } from '@/data/serviceOrdersRepository';
import { getVehicle } from '@/data/vehiclesRepository';

const DEFAULT_TIME = '08:00';
const DURATION_MINUTES = 60;

export function maskTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

// 'HH:mm' válido ou null.
export function parseTime(text: string): string | null {
  const match = /^(\d{2}):(\d{2})$/.exec(text);
  if (!match) return null;
  const [hour, minute] = [Number(match[1]), Number(match[2])];
  return hour < 24 && minute < 60 ? text : null;
}

// Data e hora são digitadas no fuso local; o banco guarda timestamptz (UTC).
export function joinAgendamento(dateIso: string, time: string = DEFAULT_TIME): string {
  return new Date(`${dateIso}T${time}:00`).toISOString();
}

export function splitAgendamento(iso: string | null): { date: string | null; time: string } {
  if (!iso) return { date: null, time: '' };
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function formatAgendamento(iso: string | null): string | null {
  if (!iso) return null;
  const { date, time } = splitAgendamento(iso);
  return `${date!.split('-').reverse().join('/')} às ${time}`;
}

function toGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export async function openOrderInGoogleCalendar(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  if (!order.agendamento) {
    throw new Error('Defina a data e a hora do agendamento na edição da OS e salve antes.');
  }

  const [client, vehicle, items] = await Promise.all([
    getClient(order.cliente_id),
    getVehicle(order.veiculo_id),
    listOrderItems(orderId),
  ]);

  const start = new Date(order.agendamento);
  const end = new Date(start.getTime() + DURATION_MINUTES * 60_000);
  const number = order.id.slice(0, 8).toUpperCase();

  const details = [
    `Cliente: ${client.nome}${client.telefone ? ` - ${client.telefone}` : ''}`,
    `Veículo: ${vehicle.placa} - ${vehicle.marca} ${vehicle.modelo}`,
    items.length ? `Serviços:\n${items.map((i) => `- ${i.servicos?.nome ?? 'Serviço removido'}`).join('\n')}` : '',
    order.observacoes ? `Observações: ${order.observacoes}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `OS ${number} - ${vehicle.marca} ${vehicle.modelo} (${vehicle.placa}) - ${client.nome}`,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    details,
    location: SHOP.address,
  });
  const url = `https://calendar.google.com/calendar/render?${params.toString()}`;

  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener');
  } else {
    await Linking.openURL(url);
  }
}
