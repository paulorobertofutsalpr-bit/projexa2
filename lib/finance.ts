export function computeDisplayStatus(status: string, vencimento: string) {
  if (status === "Pago") return "Pago";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(vencimento + "T00:00:00");
  if (dueDate.getTime() < today.getTime()) return "Atrasado";
  return "Pendente";
}
