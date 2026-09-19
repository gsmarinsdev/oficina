// O banco (Postgres `date`) guarda no formato ISO (aaaa-mm-dd), mas o
// usuário brasileiro digita/lê no formato dd/mm/aaaa. Essas funções
// convertem nos dois sentidos e aplicam a máscara enquanto digita.

export function isoToDisplay(iso: string | null): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

// Reformata o texto digitado, inserindo as barras nas posições certas
// (só dígitos importam — funciona mesmo colando "15102026" ou apagando).
export function maskDateInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  let out = day;
  if (month) out += `/${month}`;
  if (year) out += `/${year}`;
  return out;
}

// Só retorna uma data quando os 8 dígitos (dd/mm/aaaa) estão completos e
// formam uma data plausível — senão `null` (ainda incompleta ou inválida).
export function displayToIso(display: string): string | null {
  const digits = display.replace(/\D/g, '');
  if (digits.length !== 8) return null;
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}
