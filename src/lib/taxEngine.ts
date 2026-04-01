// Tax calculation engine — EXACT replica of simulador_tributario_2026_7.html
// DO NOT MODIFY ANY FORMULA OR CONSTANT

export const UVT = 52374;
export const SMLV = 1750905;
export const TOPE_RE25 = 790 * UVT;
export const TOPE_ALIV = 1340 * UVT;
export const TOPE_PAC = 3800 * UVT;
export const TOPE_VOL_MAX = TOPE_ALIV - TOPE_RE25;
export const TOPE_VIV_MES = 100 * UVT;
export const TOPE_SAL_MES = 16 * UVT;
export const TOPE_DEP_MES = 32 * UVT;
export const TOPE_DEP_2277 = 72 * UVT;
export const TOPE_COMP = 240 * UVT;
export const TOPE_COT = 25 * SMLV;
export const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
export const MESES_L = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export function calcFSP(b: number): number {
  const s = b / SMLV;
  if (s < 4) return 0;
  if (s < 7) return b * 0.010;
  if (s < 10) return b * 0.012;
  if (s < 15) return b * 0.014;
  if (s < 18) return b * 0.016;
  if (s < 19) return b * 0.018;
  return b * 0.020;
}

export function cesEx(prom: number, val: number): number {
  const u = prom / UVT;
  if (u <= 350) return val;
  if (u <= 410) return val * 0.90;
  if (u <= 470) return val * 0.80;
  if (u <= 530) return val * 0.60;
  if (u <= 590) return val * 0.40;
  if (u <= 650) return val * 0.20;
  return 0;
}

export function impAnual(uvt: number): number {
  if (uvt <= 0) return 0;
  if (uvt <= 1090) return 0;
  if (uvt <= 1700) return (uvt * 0.19 - 207.1) * UVT;
  if (uvt <= 4100) return (uvt * 0.28 - 360.1) * UVT;
  if (uvt <= 8670) return (uvt * 0.33 - 565.1) * UVT;
  if (uvt <= 18970) return (uvt * 0.35 - 738.5) * UVT;
  if (uvt <= 31000) return (uvt * 0.37 - 1117.9) * UVT;
  return (uvt * 0.39 - 2737.9) * UVT;
}

export function reteP1(uvt: number): number {
  if (uvt <= 0) return 0;
  if (uvt <= 95) return 0;
  if (uvt <= 150) return (uvt * 0.19 - 18.05) * UVT;
  if (uvt <= 360) return (uvt * 0.28 - 31.55) * UVT;
  if (uvt <= 640) return (uvt * 0.33 - 49.55) * UVT;
  if (uvt <= 945) return (uvt * 0.35 - 62.35) * UVT;
  if (uvt <= 2300) return (uvt * 0.37 - 81.27) * UVT;
  return (uvt * 0.39 - 127.27) * UVT;
}

export function fmtN(v: number): string {
  const n = Math.round(v);
  const abs = Math.abs(n);
  return (n < 0 ? '-$' : '$') + abs.toLocaleString('es-CO');
}

export function fmtUVT(v: number): string {
  return (v / UVT).toFixed(1) + ' UVT';
}

export interface SimulatorInputs {
  salario: number;
  tipoSal: 'ordinario' | 'integral';
  indep: number;
  bonoOn: boolean;
  bono: number;
  mesBono: number;
  bonoSal: boolean;
  auxOn: boolean;
  auxTipo: 'fijo' | 'variable';
  auxFijo: number;
  auxMeses: number[];
  comOn: boolean;
  comTipo: 'fijo' | 'variable';
  comFijo: number;
  comMeses: number[];
  proc: 1 | 2;
  pctProc2: number;
  dep: number;
  intViv: number;
  salud: number;
  volFPV: number;
  volObl: number;
  facturas: number;
}

export interface MonthData {
  m: number;
  esBono: boolean;
  auxM: number;
  comM: number;
  ingM: number;
  incrgoM: number;
  re25M: number;
  otrasM: number;
  alivM: number;
  baseM: number;
  reteM: number;
}

export interface SimulatorResults {
  ingAnual: number;
  incrgoTotAnual: number;
  aliviosDentro: number;
  dedComp: number;
  dep2277: number;
  impActual: number;
  reteTot: number;
  impCargo: number;
  cesantias: number;
  cesExenta: number;
  xOptAdicional: number;
  xOpt: number;
  ahorroOpt: number;
  roi: number;
  impOpt2: number;
  baseActual: number;
  baseOpt2: number;
  re25Actual: number;
  re25Opt2: number;
  volTop: number;
  otrasF_dentro: number;
  dataMes: MonthData[];
  integralInvalido: boolean;
  subMsg: string;
}

export function calculate(inputs: SimulatorInputs): SimulatorResults {
  const {
    salario, tipoSal, indep, bonoOn, bono, mesBono, bonoSal,
    auxOn, auxTipo, auxFijo, auxMeses: auxMesesInput,
    comOn, comTipo, comFijo, comMeses: comMesesInput,
    proc, pctProc2, dep: numDep, intViv, salud: saldePag,
    volFPV, volObl: volOblMes, facturas
  } = inputs;

  const cesantias = tipoSal === 'ordinario' ? salario : 0;
  const min13 = 13 * SMLV;
  const integralInvalido = tipoSal === 'integral' && salario > 0 && salario < min13;

  if (integralInvalido) {
    return {
      ingAnual: 0, incrgoTotAnual: 0, aliviosDentro: 0, dedComp: 0, dep2277: 0,
      impActual: 0, reteTot: 0, impCargo: 0, cesantias: 0, cesExenta: 0,
      xOptAdicional: 0, xOpt: 0, ahorroOpt: 0, roi: 0, impOpt2: 0,
      baseActual: 0, baseOpt2: 0, re25Actual: 0, re25Opt2: 0, volTop: 0,
      otrasF_dentro: 0, dataMes: [], integralInvalido: true,
      subMsg: 'Salario integral inválido'
    };
  }

  const bonoVal = bonoOn ? bono : 0;
  const volOblAnual = volOblMes * 12;

  const auxMeses = Array.from({ length: 12 }, (_, i) =>
    auxOn ? (auxTipo === 'fijo' ? auxFijo : auxMesesInput[i] || 0) : 0
  );
  const auxAnual = auxMeses.reduce((s, v) => s + v, 0);

  const comMeses = Array.from({ length: 12 }, (_, i) =>
    comOn ? (comTipo === 'fijo' ? comFijo : comMesesInput[i] || 0) : 0
  );
  const comAnual = comMeses.reduce((s, v) => s + v, 0);

  const baseSSmensual = tipoSal === 'integral'
    ? salario * 0.70
    : Math.min(salario, TOPE_COT);

  const eps0 = baseSSmensual * 0.04;
  const pen0 = baseSSmensual * 0.04;
  const fsp0 = calcFSP(baseSSmensual);
  const incrgoSalMes = eps0 + pen0 + fsp0;

  const ibcInd = Math.min(indep * 0.40, TOPE_COT);
  const incrgoIndMes = (ibcInd * 0.125) + (ibcInd * 0.160);

  const TOPE_VOL_OBL = 2500 * UVT;
  const volOblTopado = Math.min(volOblAnual, (salario + indep + comAnual / 12) * 12 * 0.25, TOPE_VOL_OBL);

  const volFPVAnual = volFPV * 12;
  const volTop = Math.min(volFPVAnual, (salario + indep) * 12 * 0.30, TOPE_PAC);

  const intVivMesTopado = Math.min(intViv, TOPE_VIV_MES);
  const saldePagMesTopado = Math.min(saldePag, TOPE_SAL_MES);
  const dedViv = intVivMesTopado * 12;
  const dedSal = saldePagMesTopado * 12;

  const dedComp = Math.min(facturas * 0.01, TOPE_COMP);

  const dep1Dentro = numDep >= 1 ? 1 : 0;
  const dedDepMes = dep1Dentro * Math.min(salario * 0.10, TOPE_DEP_MES);
  const dedDep = dedDepMes * 12;

  const dep2277 = numDep > 0 ? numDep * TOPE_DEP_2277 : 0;

  const otrasF_dentro = dedDep + dedViv + dedSal;

  const cesExenta_val = cesEx(salario, cesantias);
  const cesGravable = cesantias - cesExenta_val;

  const ingAnual = salario * 12 + bonoVal + indep * 12 + auxAnual + comAnual + cesantias;
  const incrgoTotAnual = (incrgoSalMes + incrgoIndMes) * 12 + volOblTopado;
  const ingresosNetos = ingAnual - incrgoTotAnual;

  const ingSinCes = salario * 12 + bonoVal + indep * 12 + auxAnual + comAnual;
  const rentaLiqLaboral = Math.max(0, ingSinCes - incrgoTotAnual - otrasF_dentro);

  const topeAliv40 = ingresosNetos * 0.40;
  const topeReal = Math.min(TOPE_ALIV, topeAliv40);

  let xOpt: number;
  if (rentaLiqLaboral * 0.25 >= TOPE_RE25) {
    xOpt = Math.max(0, topeReal - otrasF_dentro - cesExenta_val - TOPE_RE25);
  } else {
    const num = topeReal - rentaLiqLaboral * 0.25 - otrasF_dentro - cesExenta_val;
    xOpt = Math.max(0, num / 0.75);
  }
  const maxPAC = Math.min((salario + indep) * 12 * 0.30, TOPE_PAC);
  const rentaLiq = Math.max(0, rentaLiqLaboral + cesGravable);
  xOpt = Math.min(xOpt, maxPAC, rentaLiq, TOPE_VOL_MAX);

  function calcImp(xVol: number) {
    const rlLaboral = Math.max(0, rentaLiqLaboral - xVol);
    const re25 = Math.min(rlLaboral * 0.25, TOPE_RE25);
    const totalAl = xVol + re25 + otrasF_dentro + cesExenta_val;
    const maxAl = Math.min(TOPE_ALIV, ingresosNetos * 0.40);
    let re25f = re25;
    let cesExf = cesExenta_val;
    if (totalAl > maxAl) {
      const exceso = totalAl - maxAl;
      re25f = Math.max(0, re25 - exceso);
      if (re25f === 0) cesExf = Math.max(0, cesExenta_val - (exceso - re25));
    }
    const baseTras40 = Math.max(0, rlLaboral - re25f + cesGravable + (cesExenta_val - cesExf));
    const base = Math.max(0, baseTras40 - dedComp - dep2277);
    return { base, imp: Math.max(0, impAnual(base / UVT)), re25: re25f, cesExf };
  }

  const { base: baseActual, imp: impActualVal, re25: re25Actual } = calcImp(volTop);
  const { imp: impSinVol } = calcImp(0);
  if (impSinVol === 0) xOpt = 0;
  const xOptAdicional = Math.max(0, xOpt - volTop);
  const { base: baseOpt2, imp: impOpt2, re25: re25Opt2 } = calcImp(xOpt);
  const ahorroOpt = Math.max(0, impActualVal - impOpt2);

  // Monthly calculation
  const dataMes: MonthData[] = [];
  let re25Acum = 0;
  for (let m = 0; m < 12; m++) {
    const esBono = (m + 1 === mesBono && mesBono > 0);
    const auxM = auxMeses[m];
    const comM = comMeses[m];
    const bonoM = esBono ? bonoVal : 0;

    const ingM = salario + (bonoSal && esBono ? bonoM : 0) + (!bonoSal && esBono ? bonoM : 0) + indep + auxM + comM;

    let baseCotM: number;
    if (tipoSal === 'integral') {
      baseCotM = salario * 0.70;
    } else {
      baseCotM = Math.min(salario + comM, TOPE_COT);
    }
    const incrgoM = baseCotM * 0.04 + baseCotM * 0.04 + calcFSP(baseCotM) + incrgoIndMes;

    const dedFijasM = otrasF_dentro / 12 + volTop / 12;
    const rlM = Math.max(0, ingM - incrgoM - dedFijasM);
    const re25Disp = Math.max(0, TOPE_RE25 - re25Acum);
    const re25M = Math.min(rlM * 0.25, re25Disp);
    re25Acum += re25M;

    const totAlM = dedFijasM + re25M;
    const maxAlM = Math.min(TOPE_ALIV / 12, (ingM - incrgoM) * 0.40);
    const alivM = Math.min(totAlM, maxAlM);

    const baseM = Math.max(0, ingM - incrgoM - alivM);
    const pctP2Val = pctProc2 / 100;
    const reteM = proc === 1 ? Math.max(0, reteP1(baseM / UVT)) : ingM * pctP2Val;

    dataMes.push({ m, esBono, auxM, comM, ingM, incrgoM, re25M, otrasM: dedFijasM, alivM, baseM, reteM });
  }

  const reteTot = dataMes.reduce((s, d) => s + d.reteM, 0);
  const impCargo = impActualVal - reteTot;

  const aliviosDentro = otrasF_dentro + volTop + re25Actual + cesExenta_val;

  const subMsg = impSinVol === 0
    ? 'Tu impuesto ya es $0, no hay beneficio adicional'
    : xOptAdicional === 0
    ? 'Ya estás en el tope óptimo ✓'
    : 'Anual: ' + fmtN(xOptAdicional) + ' · ' + fmtUVT(xOptAdicional) + ' de 1.340 UVT';

  return {
    ingAnual, incrgoTotAnual, aliviosDentro, dedComp, dep2277,
    impActual: impActualVal, reteTot, impCargo, cesantias, cesExenta: cesExenta_val,
    xOptAdicional, xOpt, ahorroOpt,
    roi: xOpt > 0 ? ahorroOpt / xOpt * 100 : 0,
    impOpt2, baseActual, baseOpt2, re25Actual, re25Opt2, volTop,
    otrasF_dentro, dataMes, integralInvalido: false, subMsg
  };
}
