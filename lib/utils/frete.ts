export function prazoTexto(serviceName: string, deliveryTime: number): string {
  const nome = serviceName.toUpperCase();
  if (nome.includes('SEDEX')) return '2-5 dias úteis';
  if (nome.includes('PAC')) return '7-14 dias úteis';
  return `${deliveryTime} dias úteis`;
}
