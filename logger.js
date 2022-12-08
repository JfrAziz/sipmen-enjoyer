import * as pino from "pino"

// logger
const logger = pino.pino({
  transport: {
    targets: [
      { target: 'pino-pretty', options: { colorize: true } },
      { target: "pino/file", options: { destination: './output.log' } }
    ]
  }
});

export default logger;