function hoyLima() {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Lima'
  });
}
function ahoraLima() {
  return new Date().toLocaleString('sv-SE', {
    timeZone: 'America/Lima'
  });
}
function restarDias(fechaISO, dias) {
  const d = new Date(`${fechaISO}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}
module.exports = { hoyLima, ahoraLima, restarDias };
