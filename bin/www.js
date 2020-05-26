#!/usr/bin/env node

const debug = require("debug")("adobe-io-playground:server");
const fs = require("fs");
const http = require("http");
const httpProxy = require("http-proxy");

const app = require("../app");

/**
 * Certificate files
 */

const certPrivateKeyFile = "localhost.key";
const certificateFile = "localhost.crt";

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT);
const portProxy = normalizePort(process.env.PORT_HTTPS_PROXY);
const host = process.env.APP_HOST;

/**
 * Create HTTPs server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 * Create the HTTPS proxy server in front of a HTTP server
 */
if (portProxy) {
  server.listen(portProxy);
  httpProxy
    .createServer({
      target: {
        host: "localhost",
        port: portProxy,
      },
      ssl: {
        key: fs.readFileSync(certPrivateKeyFile, "utf8"),
        cert: fs.readFileSync(certificateFile, "utf8"),
      },
    })
    .listen(port);
} else {
  server.listen(port);
}

server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 *
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 * @param error {Object} error.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}

const url = new URL(host);
url.port = port;
console.log(`Open ${url.href}`);
