/**
 * BRUTUS SYSTEM - UTILS / FORMATTERS
 * Funções de formatação de datas, moedas e horários.
 */

/**
 * Formata data preservando o dia correto (evita o bug de fuso horário/UTC que volta 1 dia).
 * Funciona para 'YYYY-MM-DD' e ISO strings 'YYYY-MM-DDTHH:mm:ss.sssZ'.
 * @param {string|Date} dataInput
 * @returns {string} 'DD/MM/AAAA' ou '-' se inválida.
 */
export function formatarDataSemFuso(dataInput) {
  if (!dataInput) return "-";
  
  if (dataInput instanceof Date) {
    const dia = String(dataInput.getDate()).padStart(2, "0");
    const mes = String(dataInput.getMonth() + 1).padStart(2, "0");
    const ano = dataInput.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  const str = String(dataInput).trim();
  const dataApenas = str.split("T")[0];
  const partes = dataApenas.split("-");

  if (partes.length === 3 && partes[0].length === 4) {
    const [ano, mes, dia] = partes;
    return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${ano}`;
  }

  return str;
}

/**
 * Retorna string 'YYYY-MM-DD' para ser aceita por inputs do tipo `date` sem sofrer fuso horário.
 * @param {string|Date} dataInput
 * @returns {string}
 */
export function dataParaInputDate(dataInput) {
  if (!dataInput) return "";
  if (dataInput instanceof Date) {
    const dia = String(dataInput.getDate()).padStart(2, "0");
    const mes = String(dataInput.getMonth() + 1).padStart(2, "0");
    const ano = dataInput.getFullYear();
    return `${ano}-${mes}-${dia}`;
  }
  return String(dataInput).split("T")[0];
}

/**
 * Formata hora no padrão HH:mm
 * @param {string} horaStr
 * @returns {string}
 */
export function formatarHora(horaStr = "") {
  if (!horaStr) return "";
  const clean = String(horaStr).replace(/\D/g, "").slice(0, 4);
  if (clean.length <= 2) return clean;
  const hh = Math.min(23, parseInt(clean.slice(0, 2), 10));
  const mm = Math.min(59, parseInt(clean.slice(2, 4), 10));
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Converte valor numérico para exibição em Real Brasileiro (R$ 0,00).
 * @param {number|string} valor
 * @returns {string}
 */
export function formatarMoedaExibicao(valor) {
  const num = Number(valor) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Converte string formatada monetária de volta para número float pronto para a API.
 * Exemplo: 'R$ 1.250,50' ou '1250,50' => 1250.5
 * @param {string|number} valor
 * @returns {number}
 */
export function moedaParaNumero(valor) {
  if (typeof valor === "number") return valor;
  if (!valor) return 0;
  const limpo = String(valor)
    .replace(/[^\d,-]/g, "")
    .replace(",", ".");
  return parseFloat(limpo) || 0;
}
