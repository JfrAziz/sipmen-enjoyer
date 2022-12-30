import yargs from 'yargs';
import * as dotenv from 'dotenv';
import * as sipmen from "./src/sipmen.js";


/**
 * Environment Variables
 */
dotenv.config();


/**
 * CLI config with yargs
 */
yargs(process.argv.slice(2))
  .scriptName('node index.js')
  .usage('$0 <cmd>')
  .command('distribusi', 'distribusi ke koseka', async () => {
    await sipmen.launch(async (browser) => { await sipmen.distribution(browser) })
  })
  .command('penerimaan', 'penerimaan dari koseka', async () => {
    await sipmen.launch(async (browser) => { await sipmen.penerimaan(browser) })
  })
  .help()
  .argv;