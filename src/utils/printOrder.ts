import * as Print from 'expo-print';
import { Platform } from 'react-native';

import { SHOP } from '@/constants/shop';
import { getClient } from '@/data/clientsRepository';
import { getOrder, listOrderItems } from '@/data/serviceOrdersRepository';
import { getVehicle } from '@/data/vehiclesRepository';
import type { OrderStatus } from '@/domain/serviceOrder';

const STATUS_LABEL: Record<OrderStatus, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluída: 'Concluída',
  cancelada: 'Cancelada',
};

function esc(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function money(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function dateBR(iso: string | null): string {
  return iso ? iso.split('-').reverse().join('/') : '';
}

const CSS = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #111; margin: 0; }
  .row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .shop { font-size: 18px; font-weight: 700; }
  .small { font-size: 9px; }
  .right { text-align: right; }
  hr { border: 0; border-top: 1px solid #999; margin: 8px 0; }
  .title { font-size: 13px; font-weight: 700; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 16px; }
  .label { font-weight: 700; }
  h3 { font-size: 12px; margin: 10px 0 4px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; border-bottom: 1px solid #999; padding: 3px 4px; font-size: 10px; }
  td { padding: 3px 4px; border-bottom: 1px solid #ddd; }
  .num { text-align: right; white-space: nowrap; }
  .obs { white-space: pre-wrap; min-height: 70px; padding: 4px 0; }
  .totals { margin-left: auto; width: 220px; margin-top: 8px; }
  .totals div { display: flex; justify-content: space-between; padding: 1px 0; }
  .total { font-weight: 700; font-size: 13px; border-top: 1px solid #999; margin-top: 3px; padding-top: 3px; }
  .visto { margin-top: 28px; text-align: right; }
`;

function printHtmlOnWeb(html: string) {
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) {
    frame.remove();
    throw new Error('Não foi possível preparar a impressão.');
  }
  doc.open();
  doc.write(html);
  doc.close();
  // Espera o layout do iframe antes de abrir o diálogo (onde dá para "Salvar como PDF").
  setTimeout(() => {
    win.focus();
    win.print();
    setTimeout(() => frame.remove(), 1000);
  }, 250);
}

export async function printOrder(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  const [client, vehicle, items] = await Promise.all([
    getClient(order.cliente_id),
    getVehicle(order.veiculo_id),
    listOrderItems(orderId),
  ]);

  const number = order.id.slice(0, 8).toUpperCase();
  const hora = new Date(order.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td>${esc(item.servicos?.nome ?? 'Serviço removido')}${
            item.ajuste_motivo ? `<div class="small"><i>${esc(item.ajuste_motivo)}</i></div>` : ''
          }</td>
          <td class="num">${esc(item.quantidade)}</td>
          <td class="num">${money(item.preco_unit)}</td>
          <td class="num">${money(item.subtotal)}</td>
        </tr>`
    )
    .join('');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <title>OS ${esc(number)} - ${esc(client.nome)}</title>
  <style>${CSS}</style>
</head>
<body>
  <div class="row">
    <div>
      <div class="shop">${esc(SHOP.name)}</div>
      <div class="small">${esc(SHOP.address)}</div>
    </div>
    <div class="right">
      <div>${esc(SHOP.phone)}</div>
      <div>${esc(SHOP.cnpj)}</div>
    </div>
  </div>
  <hr>
  <div class="row">
    <div class="title">ORDEM DE SERVIÇO ${esc(number)}</div>
    <div class="right">Hora: ${esc(hora)} &nbsp; Data: ${esc(dateBR(order.data_entrada))}</div>
  </div>
  <hr>
  <div class="grid">
    <div><span class="label">Cliente:</span> ${esc(client.nome)}</div>
    <div><span class="label">Telefone:</span> ${esc(client.telefone)}</div>
    <div><span class="label">CPF/CNPJ:</span> ${esc(client.cpf)}</div>
    <div><span class="label">Email:</span> ${esc(client.email)}</div>
    <div style="grid-column: 1 / -1"><span class="label">Endereço:</span> ${esc(client.endereco)}</div>
  </div>
  <hr>
  <div class="grid">
    <div><span class="label">Placa:</span> ${esc(vehicle.placa)}</div>
    <div><span class="label">Marca:</span> ${esc(vehicle.marca)}</div>
    <div><span class="label">Modelo:</span> ${esc(vehicle.modelo)}</div>
    <div><span class="label">Cor:</span> ${esc(vehicle.cor)} &nbsp; <span class="label">Ano:</span> ${esc(vehicle.ano)}</div>
  </div>
  <hr>
  <h3>Serviços</h3>
  <table>
    <thead>
      <tr><th>Descrição</th><th class="num">Qtd</th><th class="num">Unitário (R$)</th><th class="num">Subtotal (R$)</th></tr>
    </thead>
    <tbody>${itemRows || '<tr><td colspan="4">Nenhum serviço adicionado.</td></tr>'}</tbody>
  </table>
  <h3>Observações</h3>
  <div class="obs">${esc(order.observacoes)}</div>
  <hr>
  <div class="row">
    <div>
      <div><span class="label">Situação:</span> ${esc(STATUS_LABEL[order.status])}</div>
      <div><span class="label">Entrada:</span> ${esc(dateBR(order.data_entrada))}</div>
      <div><span class="label">Saída:</span> ${esc(dateBR(order.data_saida))}</div>
    </div>
    <div class="totals">
      <div><span>VALOR SERVIÇOS:</span><span>${money(order.total)}</span></div>
      <div class="total"><span>VALOR TOTAL:</span><span>${money(order.total)}</span></div>
    </div>
  </div>
  <hr>
  <div class="small">ESTE DOCUMENTO NÃO VALE COMO RECIBO DE PAGAMENTO</div>
  <div class="visto">Visto ________________________________</div>
</body>
</html>`;

  if (Platform.OS === 'web') {
    printHtmlOnWeb(html);
  } else {
    await Print.printAsync({ html });
  }
}
