import { logs, SeverityNumber } from '@opentelemetry/api-logs';
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { NavigationInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation';
import { NavigationTimingInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/navigation-timing';
import { WebVitalsInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/web-vitals';
import { ErrorsInstrumentation } from '@opentelemetry/browser-instrumentation/experimental/errors';
import pkg from '../../package.json';

const { version } = pkg;

function getSessionId() {
  var id = sessionStorage.getItem('otel_session_id');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('otel_session_id', id);
  }
  return id;
}

function isProduction() {
  return (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  );
}

function getPageType() {
  var path = window.location.pathname || '';
  var trimmed = path.replace(/\/+$/, '');
  var last = trimmed.split('/').filter(Boolean).pop() || '';
  var name = last.replace(/\.html$/, '');
  if (!name || name === 'index') {
    return 'home';
  }
  return name;
}

function init() {
  var prod = isProduction();

  var resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'conversion-guide',
    [ATTR_SERVICE_VERSION]: version,
  });

  var logExporter = prod
    ? new OTLPLogExporter({ url: '/v1/logs' })
    : new ConsoleLogRecordExporter();

  var processor = prod
    ? new BatchLogRecordProcessor(logExporter)
    : new SimpleLogRecordProcessor(logExporter);

  var loggerProvider = new LoggerProvider({
    resource,
    processors: [processor],
  });

  logs.setGlobalLoggerProvider(loggerProvider);

  registerInstrumentations({
    instrumentations: [
      new NavigationInstrumentation(),
      new NavigationTimingInstrumentation(),
      new WebVitalsInstrumentation(),
      new ErrorsInstrumentation(),
    ],
  });

  var sessionId = getSessionId();
  var isNewSession = !sessionStorage.getItem('otel_session_started');
  var startTime = Date.now();

  var commonAttributes = {
    'user_agent': navigator.userAgent,
    'screen_resolution': screen.width + 'x' + screen.height,
    'referrer': document.referrer || '',
    'session.id': sessionId,
  };

  if (isNewSession) {
    sessionStorage.setItem('otel_session_started', '1');
    logEvent('session_start', {
      timestamp: new Date().toISOString(),
      ...commonAttributes,
    });
  }

  logEvent('page_view', {
    url: window.location.href,
    page_type: getPageType(),
    ...commonAttributes,
  });

  // Session heartbeat every 60s
  setInterval(function () {
    if (!document.hidden) {
      logEvent('session_heartbeat', {
        'duration_seconds': String(Math.round((Date.now() - startTime) / 1000)),
        ...commonAttributes,
      });
    }
  }, 60000);
}

function logEvent(eventName, attributes) {
  try {
    var logger = logs.getLogger('analytics');
    logger.emit({
      body: eventName,
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      attributes: { 'event.name': eventName, ...attributes },
    });
  } catch (e) {
    if (!isProduction()) {
      console.debug('[otel-analytics] logEvent failed', e);
    }
  }
}

function trackEvent(eventName, attributes) {
  var sessionId = getSessionId();
  logEvent(eventName, {
    'session.id': sessionId,
    'user_agent': navigator.userAgent,
    'screen_resolution': screen.width + 'x' + screen.height,
    'referrer': document.referrer || '',
    ...attributes,
  });
}

// Auto-init on load
init();

// Expose global API for use in page-setup.js
window.otelAnalytics = {
  logEvent: logEvent,
  trackEvent: trackEvent,
};
