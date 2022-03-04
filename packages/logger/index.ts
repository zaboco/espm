import chalk from 'chalk';
import { performance } from 'node:perf_hooks';
// @ts-expect-error
import Spinnies from 'spinnies';

export interface Logger {
  spinner(message: string): {
    succeed: () => void;
    fail: () => void;
  };
  log(message: string, options?: LogOptions): void;
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;

  setLevel(newLevel: LogLevel): void;
}

interface LogOptions {
  level?: LogLevel;
}

type Color = 'white' | 'blue' | 'yellow' | 'red' | 'black';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export const logger = initLogger();

const DEFAULT_LEVEL = 'INFO';
const SPINNER_LEVEL = 'DEBUG';

function isLevelAboveThreshold(level: LogLevel, thresholdLevel: LogLevel) {
  const levelScores: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
  };

  return levelScores[level] >= levelScores[thresholdLevel];
}

export function initLogger(
  initialThresholdLevel: LogLevel = DEFAULT_LEVEL,
): Logger {
  const spinnies = new Spinnies();
  let thresholdLevel = initialThresholdLevel;

  return {
    spinner(message) {
      if (!isLevelAboveThreshold(SPINNER_LEVEL, thresholdLevel)) {
        return {
          succeed() {},
          fail() {},
        };
      }
      const spinnerId = uuid(`spinner-${message}`);
      spinnies.add(spinnerId, {
        text: formatMessage(message, SPINNER_LEVEL),
        color: getTextColor(SPINNER_LEVEL),
      });

      return {
        succeed() {
          spinnies.succeed(spinnerId);
        },
        fail() {
          spinnies.fail(spinnerId);
        },
      };
    },
    log,
    debug(message) {
      return log(message, { level: 'DEBUG' });
    },
    info(message) {
      return log(message, { level: 'INFO' });
    },
    warn(message) {
      return log(message, { level: 'WARN' });
    },
    error(message) {
      return log(message, { level: 'ERROR' });
    },
    setLevel(newLevel) {
      thresholdLevel = newLevel;
    },
  };

  function log(message: string, options: LogOptions = {}) {
    const level = options.level ?? DEFAULT_LEVEL;
    if (!isLevelAboveThreshold(level, thresholdLevel)) {
      return;
    }
    const pseudoSpinnerId = uuid(`log-${message}`);
    spinnies.add(pseudoSpinnerId, {
      text: formatMessage(message, level),
      status: 'stopped',
      color: getTextColor(level),
      indent: 2,
    });
  }
}

function getTextColor(level: LogLevel): Color {
  const colors: Record<LogLevel, Color> = {
    DEBUG: 'black',
    INFO: 'blue',
    WARN: 'yellow',
    ERROR: 'red',
  };
  return colors[level];
}

function formatMessage(message: string, level: LogLevel): string {
  const bgColor = level === 'DEBUG' ? 'white' : getTextColor(level);
  return chalk.black[bgColor].inverse(` ${level.padStart(5)} `) + ' ' + message;
}

function uuid(base: string) {
  return `${base}-${performance.now()}`;
}
