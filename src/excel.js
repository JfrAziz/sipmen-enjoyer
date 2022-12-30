import * as fs from 'fs';
import * as XLSX from 'xlsx';

/**
 * load 'fs' for readFile and writeFile support
 */
XLSX.set_fs(fs);

export default XLSX;