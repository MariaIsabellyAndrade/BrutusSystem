/**
 * BRUTUS SYSTEM - UTILS / MASKS
 * Máscaras reutilizáveis para todos os campos do sistema.
 */

/**
 * Formata CPF: 000.000.000-00
 * @param {string} val
 * @returns {string}
 */
export function formatarCPF(val = "") {
  if (typeof val !== "string" && typeof val !== "number") return "";
  let digits = String(val).replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}

/**
 * Formata CNPJ: 00.000.000/0000-00
 * @param {string} val
 * @returns {string}
 */
export function formatarCNPJ(val = "") {
  if (typeof val !== "string" && typeof val !== "number") return "";
  let digits = String(val).replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/**
 * Formata Telefone: (11) 99999-9999 ou (11) 9999-9999
 * @param {string} val
 * @returns {string}
 */
export function formatarTelefone(val = "") {
  if (typeof val !== "string" && typeof val !== "number") return "";
  let tel = String(val).replace(/\D/g, "").slice(0, 11);
  if (tel.length <= 2) return tel;
  if (tel.length <= 6) {
    return tel.replace(/^(\d{2})(\d+)/, "($1) $2");
  }
  if (tel.length <= 10) {
    return tel.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  }
  return tel.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

/**
 * Formata CEP: 00000-000
 * @param {string} val
 * @returns {string}
 */
export function formatarCEP(val = "") {
  if (typeof val !== "string" && typeof val !== "number") return "";
  let digits = String(val).replace(/\D/g, "").slice(0, 8);
  return digits.replace(/^(\d{5})(\d{1,3})$/, "$1-$2");
}

/**
 * Formata RG: 00.000.000-0 ou 00.000.000-X
 * @param {string} val
 * @returns {string}
 */
export function formatarRG(val = "") {
  if (typeof val !== "string" && typeof val !== "number") return "";
  let clean = String(val).replace(/[^\dXx]/g, "").slice(0, 9);
  if (clean.length <= 2) return clean;
  if (clean.length <= 5) return clean.replace(/^(\d{2})(\d+)/, "$1.$2");
  if (clean.length <= 8) return clean.replace(/^(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
  return clean.replace(/^(\d{2})(\d{3})(\d{3})([\dXx]+)/, "$1.$2.$3-$4");
}

/**
 * Formata valor monetário visualmente durante a digitação ou exibição.
 * Retorna string "R$ 1.250,50"
 * @param {number|string} val
 * @returns {string}
 */
export function formatarMoeda(val) {
  if (val === null || val === undefined || val === "") return "";
  let num = typeof val === "number" ? val : parseFloat(String(val).replace(",", "."));
  if (isNaN(num)) return "";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Higieniza campo deixando apenas números.
 * Useful for stripping masks before sending to API (e.g. CPF, CNPJ, Telefone, CEP).
 * @param {string} val
 * @returns {string}
 */
export function somenteNumeros(val = "") {
  if (typeof val !== "string" && typeof val !== "number") return "";
  return String(val).replace(/\D/g, "");
}
