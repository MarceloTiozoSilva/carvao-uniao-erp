import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable: any;
    autoTable: any;
  }
}

interface CashFlowItem {
  date: string;
  description: string;
  type: "entrada" | "saida";
  amount: number;
  balance: number;
}

interface ExpenseByCategory {
  name: string;
  value: number;
}

export async function generateCashFlowPDF(
  cashFlow: CashFlowItem[],
  totalSales: number,
  totalExpenses: number,
  balance: number,
  period: string
): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.text("Carvão União", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(14);
  doc.text("Relatório de Fluxo de Caixa", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`Período: ${period}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Resumo
  doc.setFontSize(12);
  doc.text("Resumo Financeiro", 20, yPosition);
  yPosition += 8;

  const summaryData = [
    ["Total de Vendas", `R$ ${totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
    ["Total de Despesas", `R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
    ["Saldo", `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Descrição", "Valor"]],
    body: summaryData,
    margin: { left: 20, right: 20 },
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Fluxo de Caixa Detalhado
  doc.setFontSize(12);
  doc.text("Fluxo de Caixa Detalhado", 20, yPosition);
  yPosition += 8;

  const flowData = cashFlow.map((item) => [
    item.date,
    item.description,
    item.type === "entrada" ? "Entrada" : "Saída",
    `R$ ${Math.abs(item.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    `R$ ${item.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Data", "Descrição", "Tipo", "Valor", "Saldo"]],
    body: flowData,
    margin: { left: 20, right: 20 },
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    columnStyles: {
      2: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}

export async function generateDREPDF(
  totalSales: number,
  totalExpenses: number,
  balance: number,
  expensesByCategory: ExpenseByCategory[],
  period: string
): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.text("Carvão União", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 10;

  doc.setFontSize(14);
  doc.text("Demonstrativo de Resultados (DRE)", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 8;

  doc.setFontSize(10);
  doc.text(`Período: ${period}`, pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // DRE
  doc.setFontSize(12);
  doc.text("Demonstrativo de Resultados", 20, yPosition);
  yPosition += 8;

  const dreData = [
    ["Receita Bruta (Vendas)", `R$ ${totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
    ["", ""],
    ["Despesas Operacionais", ""],
    ...expensesByCategory.map((cat) => [
      `  ${cat.name}`,
      `R$ ${cat.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    ]),
    ["Total de Despesas", `R$ ${totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
    ["", ""],
    ["Resultado Líquido", `R$ ${balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [["Descrição", "Valor"]],
    body: dreData,
    margin: { left: 20, right: 20 },
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
  });

  // Rodapé
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }

  return Buffer.from(doc.output("arraybuffer"));
}
