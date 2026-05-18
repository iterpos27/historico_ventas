import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import XLSX from 'xlsx';
import { pool } from '../db/pool.js';
import { periodToDateRange } from '../utils/period.js';

const ORANGE_RGB = 'F79646';

const normalizeText = (value) => String(value ?? '').trim();
const normalizeKey = (value) => normalizeText(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase();

const normalizeBranchName = (value) => normalizeText(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\b0+(\d+)\b/g, '$1')
  .replace(/\s+/g, ' ')
  .trim()
  .toUpperCase();

const toNumber = (value) => Number(String(value ?? 0).replace(',', '.'));
const monthMap = {
  ENERO: '01',
  FEBRERO: '02',
  MARZO: '03',
  ABRIL: '04',
  MAYO: '05',
  JUNIO: '06',
  JULIO: '07',
  AGOSTO: '08',
  SEPTIEMBRE: '09',
  OCTUBRE: '10',
  NOVIEMBRE: '11',
  DICIEMBRE: '12'
};

const toDateString = (value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = normalizeText(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  return text;
};

const hashRecord = (record) => crypto
  .createHash('sha256')
  .update(JSON.stringify(record))
  .digest('hex');

const getValue = (row, ...keys) => {
  const wanted = keys.map(normalizeKey);
  const entry = Object.entries(row).find(([key]) => wanted.includes(normalizeKey(key)));
  return entry?.[1];
};

export const inspectExcelWorkbook = (filePath) => {
  const workbook = XLSX.readFile(filePath, { cellStyles: true, cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const orangeHeaders = [];
  let headerRow = null;

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    const labels = [];
    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      const cell = sheet[cellAddress];
      if (!cell?.v) continue;

      const value = normalizeText(cell.v);
      labels.push(value);
      if (cell.s?.fgColor?.rgb === ORANGE_RGB) {
        orangeHeaders.push({ column: cellAddress.replace(/\d+$/, ''), title: value });
      }
    }

    const normalized = labels.map(normalizeKey);
    if (normalized.includes('SUBTOTAL NETO') && normalized.includes('ESTABLECIMIENTO')) {
      headerRow = rowIndex;
      break;
    }
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    range: headerRow ?? 0,
    defval: null,
    raw: false
  });

  return { workbook, sheetName, headerRow, orangeHeaders, rows };
};

const readWorkbookRows = (filePath) => {
  const candidateFolder = filePath.replace(/\.[^.]+$/, '_archivos');
  const htmlSheetPath = path.join(candidateFolder, 'sheet001.htm');
  const readablePath = fs.existsSync(htmlSheetPath) ? htmlSheetPath : filePath;
  const workbook = XLSX.readFile(readablePath, { cellStyles: true, cellDates: true, raw: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return {
    sheetName,
    rows: XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false })
  };
};

const readWorkbookRowsFromBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellStyles: true, cellDates: true, raw: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return {
    sheetName,
    rows: XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false })
  };
};

const getPeriodFromMatrixRows = (rows) => {
  const monthRow = rows.find((row) => normalizeKey(row?.[0]) === 'MES');
  const yearRow = rows.find((row) => normalizeKey(row?.[0]) === 'ANO');
  const month = monthMap[normalizeKey(monthRow?.[1])] || String(monthRow?.[1] || '').padStart(2, '0');
  const year = normalizeText(yearRow?.[1]);

  if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) return null;
  return `${year}-${month}`;
};

export const matrixRowsToSalesRecords = (rows) => {
  const headerIndex = rows.findIndex((row) => {
    const keys = row.map(normalizeKey);
    return keys.includes('ESTABLECIMIENTO') && keys.includes('TOTAL');
  });

  if (headerIndex === -1) return null;

  const headers = rows[headerIndex].map(normalizeKey);
  const branchIndex = headers.indexOf('ESTABLECIMIENTO');
  const totalIndex = headers.lastIndexOf('TOTAL');
  const period = getPeriodFromMatrixRows(rows);
  const fecha = period ? `${period}-01` : null;
  const records = [];
  let finalTotal = null;

  for (let index = headerIndex + 1; index < rows.length; index += 1) {
    const row = rows[index];
    const establecimiento = normalizeText(row[branchIndex]).replace(/\s+/g, ' ');
    const establecimientoKey = normalizeKey(establecimiento);
    const total = toNumber(row[totalIndex]);

    if (
      (!establecimiento || ['TOTAL', 'TOTAL GENERAL', 'SUMA', 'SUMA TOTAL'].includes(establecimientoKey))
      && !Number.isNaN(total)
    ) {
      finalTotal = total;
      continue;
    }

    if (!establecimiento || Number.isNaN(total)) continue;

    records.push({
      line: index + 1,
      fecha,
      establecimiento,
      nomenclatura: '',
      producto: `Matriz de ventas ${period || ''}`.trim(),
      cantidad: 1,
      precio_unitario: total,
      total,
      documento: `MATRIZ-${period || 'SIN-PERIODO'}`,
      factura: establecimiento,
      autorizacion: ''
    });
  }

  return {
    headerRow: headerIndex + 1,
    period,
    finalTotal,
    records
  };
};

const parseMatrixSalesWorkbook = (filePath) => {
  const { sheetName, rows } = readWorkbookRows(filePath);
  const matrix = matrixRowsToSalesRecords(rows);
  return matrix ? { ...matrix, sheetName } : null;
};

const parseMatrixSalesBuffer = (buffer) => {
  const { sheetName, rows } = readWorkbookRowsFromBuffer(buffer);
  const matrix = matrixRowsToSalesRecords(rows);
  return matrix ? { ...matrix, sheetName } : null;
};

export const rowsToSalesRecords = (rows, startLine = 1) => rows
  .map((row, index) => {
    const fecha = toDateString(getValue(row, 'FECHA EMISION', 'FECHA'));
    const establecimiento = normalizeText(getValue(row, 'ESTABLECIMIENTO', 'ALMACEN'));
    const nomenclatura = normalizeText(getValue(row, 'NOMENCLATURA'));
    const subtotalNeto = toNumber(getValue(row, 'SUBTOTAL NETO', 'TOTAL'));
    const concepto = normalizeText(getValue(row, 'CONCEPTO', 'PRODUCTO')) || 'Venta';
    const documento = normalizeText(getValue(row, 'DOCUMENTO'));
    const factura = normalizeText(getValue(row, 'FACTURA'));
    const autorizacion = normalizeText(getValue(row, 'AUTORIZACION'));

    return {
      line: startLine + index,
      fecha,
      establecimiento,
      nomenclatura,
      producto: concepto,
      cantidad: 1,
      precio_unitario: subtotalNeto,
      total: subtotalNeto,
      documento,
      factura,
      autorizacion
    };
  })
  .filter((record) => record.fecha || record.establecimiento || record.total);

export const summarizeByBranchName = (records) => records.reduce((acc, record) => {
  if (!record.establecimiento) return acc;
  acc[record.establecimiento] = (acc[record.establecimiento] || 0) + record.total;
  return acc;
}, {});

const backupAndDeleteSalesForPeriod = async (client, period, source) => {
  const { start, end } = periodToDateRange(period);
  const params = [start, end];
  let sourceFilter = '';

  if (source) {
    params.push(source);
    sourceFilter = ` AND fuente = $${params.length}`;
  }

  const existing = await client.query(
    `SELECT id, fecha, almacen_id, producto, cantidad, precio_unitario, total, fuente, external_hash, created_at, updated_at
     FROM ventas
     WHERE fecha >= $1 AND fecha < $2 ${sourceFilter}
     ORDER BY fecha, almacen_id`,
    params
  );

  if (!existing.rowCount) return 0;

  await client.query(
    `INSERT INTO ventas_respaldo (periodo, fuente, registros, total_registros)
     VALUES ($1, $2, $3::jsonb, $4)`,
    [period, source || null, JSON.stringify(existing.rows), existing.rowCount]
  );

  await client.query(
    `DELETE FROM ventas
     WHERE fecha >= $1 AND fecha < $2 ${sourceFilter}`,
    params
  );

  return existing.rowCount;
};

export const importSalesRecords = async (records, source, options = {}) => {
  const client = await pool.connect();
  const result = {
    inserted: 0,
    skipped: 0,
    replaced: 0,
    errors: [],
    summary: summarizeByBranchName(records)
  };

  try {
    await client.query('BEGIN');

    if (options.replacePeriod && options.period) {
      result.replaced = await backupAndDeleteSalesForPeriod(client, options.period, source);
    }

    for (const record of records) {
      if (!record.fecha || !record.establecimiento || Number.isNaN(record.total)) {
        result.errors.push({ line: record.line, message: 'Fecha, establecimiento o total inválido' });
        continue;
      }

      const branch = await client.query(
        `SELECT id FROM almacenes
         WHERE estado = true
           AND (
             LOWER(nombre) = LOWER($1)
             OR LOWER($1) LIKE LOWER(nombre) || ' %'
             OR UPPER(nomenclatura) = UPPER($2)
             OR UPPER(
               regexp_replace(
                 translate(nombre, 'ÁÉÍÓÚáéíóú', 'AEIOUaeiou'),
                 '\\m0+([0-9]+)\\M',
                 '\\1',
                 'g'
               )
             ) = $3
           )
         ORDER BY LENGTH(nombre) DESC
         LIMIT 1`,
        [
          record.establecimiento,
          record.nomenclatura || record.establecimiento,
          normalizeBranchName(record.establecimiento)
        ]
      );

      if (!branch.rows[0]) {
        result.errors.push({ line: record.line, message: `Almacén no existe: ${record.establecimiento}` });
        continue;
      }

      const externalHash = hashRecord({
        source,
        fecha: record.fecha,
        establecimiento: record.establecimiento,
        documento: record.documento,
        factura: record.factura,
        autorizacion: record.autorizacion,
        total: record.total
      });

      const insert = await client.query(
        `INSERT INTO ventas (fecha, almacen_id, producto, cantidad, precio_unitario, total, fuente, external_hash)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (external_hash) DO NOTHING
         RETURNING id`,
        [
          record.fecha,
          branch.rows[0].id,
          record.producto,
          record.cantidad,
          record.precio_unitario,
          record.total,
          source,
          externalHash
        ]
      );

      if (insert.rowCount) result.inserted += 1;
      else result.skipped += 1;
    }

    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const importExcelSales = async (filePath, options = {}) => {
  const matrix = parseMatrixSalesWorkbook(filePath);
  if (matrix?.records?.length) {
    const result = await importSalesRecords(matrix.records, 'excel_matrix', {
      replacePeriod: options.replacePeriod,
      period: matrix.period
    });
    return {
      ...result,
      sheetName: matrix.sheetName,
      headerRow: matrix.headerRow,
      period: matrix.period,
      finalTotal: matrix.finalTotal,
      calculatedTotal: Number(Object.values(result.summary).reduce((sum, value) => sum + value, 0).toFixed(2)),
      orangeHeaders: [
        { column: 'A', title: 'ESTABLECIMIENTO' },
        { column: 'TOTAL', title: 'TOTAL' }
      ]
    };
  }

  const inspection = inspectExcelWorkbook(filePath);
  const records = rowsToSalesRecords(inspection.rows, (inspection.headerRow ?? 0) + 2);
  const result = await importSalesRecords(records, 'excel');
  return {
    ...result,
    sheetName: inspection.sheetName,
    headerRow: inspection.headerRow === null ? null : inspection.headerRow + 1,
    orangeHeaders: inspection.orangeHeaders
  };
};

export const importExcelSalesBuffer = async (buffer, source = 'google_drive_matrix', options = {}) => {
  const textStart = buffer.subarray(0, 2000).toString('utf8');
  if (textStart.includes('<frameset') && textStart.includes('sheet001.htm')) {
    throw new Error('El archivo es un Excel HTML con hojas auxiliares y solo se subió el contenedor .xls. Exporta o guarda el reporte como Excel completo .xlsx/.xls real, o sube también la carpeta _archivos no soportada por Drive.');
  }

  const matrix = parseMatrixSalesBuffer(buffer);
  if (!matrix?.records?.length) {
    throw new Error('No se encontró una matriz de ventas válida en el archivo. Debe contener Mes, Año, Establecimiento y Total.');
  }

  const result = await importSalesRecords(matrix.records, source, {
    replacePeriod: options.replacePeriod,
    period: matrix.period
  });
  return {
    ...result,
    sheetName: matrix.sheetName,
    headerRow: matrix.headerRow,
    period: matrix.period,
    finalTotal: matrix.finalTotal,
    calculatedTotal: Number(Object.values(result.summary).reduce((sum, value) => sum + value, 0).toFixed(2)),
    orangeHeaders: [
      { column: 'A', title: 'ESTABLECIMIENTO' },
      { column: 'TOTAL', title: 'TOTAL' }
    ]
  };
};
