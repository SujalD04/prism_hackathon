// server/models/Report.js
const { v4: uuidv4 } = require('uuid');

/**
 * Simple in-memory store for reports
 * Keyed by reportId
 */
const reportsStore = {};

/**
 * Create a new report
 * @param {string} sessionId - Unique session identifier
 * @param {string} device - Device type (smartphone, smartwatch, etc.)
 * @returns {object} report object
 */
function createReport(sessionId, device) {
  const reportId = `${device}-${Date.now()}-${uuidv4()}`;
  const report = {
    _id: reportId,
    sessionId,
    device,
    predictive: null,
    vision: null,
    audio: null,
    createdAt: new Date(),
  };
  reportsStore[reportId] = report;
  return report;
}

/**
 * Get report by reportId
 * @param {string} reportId
 * @returns {object|null} report
 */
function getReport(reportId) {
  return reportsStore[reportId] || null;
}

/**
 * Find report by sessionId & device
 * @param {string} sessionId
 * @param {string} device
 * @returns {object|null} report
 */
function findReport(sessionId, device) {
  return Object.values(reportsStore).find(
    (r) => r.sessionId === sessionId && r.device === device
  ) || null;
}

/**
 * Add or update a section (predictive, vision, audio)
 * @param {string} sessionId
 * @param {string} device
 * @param {string} section - 'predictive' | 'vision' | 'audio'
 * @param {any} data
 * @returns {object} updated report
 */
function addSectionData(sessionId, device, section, data) {
  let report = findReport(sessionId, device);
  if (!report) {
    report = createReport(sessionId, device);
  }
  report[section] = data;
  return report;
}

/**
 * Get all reports
 */
function getAllReports() {
  return Object.values(reportsStore);
}

module.exports = {
  reportsStore,
  createReport,
  getReport,
  findReport,
  addSectionData,
  getAllReports,
};
