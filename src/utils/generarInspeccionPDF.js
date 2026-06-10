import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export async function generarInspeccionPDF(inspeccion) {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text("Informe de Inspección", 14, 20)

  autoTable(doc, {
    startY: 30,
    head: [["Campo", "Valor"]],
    body: Object.entries(inspeccion.datos || {}).map(([k, v]) => [k, String(v)])
  })

  const pdfBlob = doc.output("blob")
  return pdfBlob
}
