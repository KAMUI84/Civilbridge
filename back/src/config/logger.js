/**
 * Structured JSON logger — compatible with log aggregators (Datadog, Loki, CloudWatch).
 * In development, output is pretty-printed. In production, pure JSON.
 */
import { createLogger, format, transports } from "winston";
import { v4 as uuidv4 } from "uuid";

const { combine, timestamp, errors, json, colorize, printf } = format;

const isDev = process.env.NODE_ENV !== "production";

const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, requestId, ...meta }) => {
    const rid = requestId ? ` [${requestId}]` : "";
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    return `${ts}${rid} ${level}: ${message}${extra}`;
  })
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

const logger = createLogger({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  format: isDev ? devFormat : prodFormat,
  defaultMeta: {
    service: "civilbridge-api",
    env: process.env.NODE_ENV ?? "development",
  },
  transports: [
    new transports.Console(),
    // In production, also write to files (picked up by log shipper)
    ...(!isDev
      ? [
          new transports.File({ filename: "logs/error.log",   level: "error" }),
          new transports.File({ filename: "logs/combined.log"              }),
        ]
      : []),
  ],
  exitOnError: false,
});

export default logger;
