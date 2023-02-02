import yargs from 'yargs';
import * as dotenv from 'dotenv';
import * as sipmen from "./src/sipmen.js";


/**
 * Environment Variables
 */
dotenv.config();

/**
 * Custom function to Array Protoptype 
 */
Object.defineProperty(Array.prototype, 'chunk', {
  value: function (chunkSize) {
    var that = this;
    return Array(Math.ceil(that.length / chunkSize)).fill().map(function (_, i) {
      return that.slice(i * chunkSize, i * chunkSize + chunkSize);
    });
  }
});

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
  .command('penerimaan-desa', 'penerimaan dari koseka input per desa', async () => {
    await sipmen.launch(async (browser) => { await sipmen.penerimaanPerDesa(browser) })
  })
  .command('batching', 'batching data', async () => {
    await sipmen.launch(async (browser) => { await sipmen.batching(browser) })
  })
  .help()
  .argv;