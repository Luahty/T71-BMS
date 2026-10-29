/**
 * T71-BMS Google Apps Script Backend
 * Kết nối Google Sheets và phục vụ giao diện Web App cho xe máy điện Tailg T71 (96V 45Ah)
 */

const SHEET_NAME_TELEMETRY = 'Nhật ký Pin (Telemetry)';
const SHEET_NAME_EVENTS = 'Sự kiện & Thống kê';

/**
 * Phục vụ giao diện Web App HTML
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('T71-BMS | Hệ Thống Quản Lý Pin 96V Tailg T71')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Xử lý yêu cầu HTTP POST (nếu gọi từ Webhook ngoài)
 */
function doPost(e) {
  try {
    var rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = JSON.parse(rawData);
    var result = recordTelemetry(data);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Khởi tạo cấu trúc các Sheet với Header định dạng chuyên nghiệp
 */
function getOrCreateSheet(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#0f172a');
      headerRange.setFontColor('#38bdf8');
      headerRange.setFontWeight('bold');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Ghi bản ghi thống kê / telemetry từ Web App vào Google Sheets
 * @param {Object} payload Dữ liệu gửi từ ứng dụng Web
 */
function recordTelemetry(payload) {
  try {
    var headers = [
      'Thời gian',
      'Loại sự kiện',
      'Tổng Điện áp (V)',
      'Dòng điện (A)',
      'Công suất (W)',
      'SOC (%)',
      'Cell Cao nhất (V)',
      'Cell Thấp nhất (V)',
      'Delta V (mV)',
      'Nhiệt độ (°C)',
      'Số Pack nối tiếp',
      'Trạng thái Sạc / Xả / Balance',
      'Chi tiết điện áp từng Cell (V)'
    ];

    var sheet = getOrCreateSheet(SHEET_NAME_TELEMETRY, headers);

    var now = new Date();
    var timeStr = Utilities.formatDate(now, Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd HH:mm:ss');

    var eventType = payload.eventType || 'Định kỳ (Periodic)';
    var totalVoltage = payload.totalVoltage !== undefined ? Number(payload.totalVoltage).toFixed(2) : '';
    var current = payload.current !== undefined ? Number(payload.current).toFixed(2) : '';
    var power = payload.power !== undefined ? Number(payload.power).toFixed(1) : '';
    var soc = payload.soc !== undefined ? Number(payload.soc).toFixed(0) : '';
    var maxCell = payload.maxCell !== undefined ? Number(payload.maxCell).toFixed(3) : '';
    var minCell = payload.minCell !== undefined ? Number(payload.minCell).toFixed(3) : '';
    var deltaV = payload.deltaV !== undefined ? Number(payload.deltaV).toFixed(0) : '';
    var temp = payload.temperature !== undefined ? Number(payload.temperature).toFixed(1) : '';
    var packCount = payload.packCount || 1;
    var mosStatus = payload.mosStatus || 'N/A';
    var cellDetails = payload.cellDetails || (payload.cells ? payload.cells.join(', ') : '');

    var rowData = [
      timeStr,
      eventType,
      totalVoltage,
      current,
      power,
      soc,
      maxCell,
      minCell,
      deltaV,
      temp,
      packCount,
      mosStatus,
      cellDetails
    ];

    sheet.appendRow(rowData);

    // Nếu là sự kiện đặc biệt (sạc đầy, yếu pin, cảnh báo), lưu thêm vào Sheet Sự kiện
    if (eventType !== 'Định kỳ (Periodic)') {
      var eventHeaders = ['Thời gian', 'Sự kiện', 'Tổng Áp (V)', 'SOC (%)', 'Delta V (mV)', 'Ghi chú'];
      var eventSheet = getOrCreateSheet(SHEET_NAME_EVENTS, eventHeaders);
      eventSheet.appendRow([timeStr, eventType, totalVoltage, soc, deltaV, payload.note || '']);
    }

    return { status: 'success', timestamp: timeStr, row: sheet.getLastRow() };
  } catch (err) {
    return { status: 'error', message: err.toString() };
  }
}

/**
 * Đọc lại các bản ghi gần nhất để hiển thị biểu đồ lịch sử trên Web App
 * @param {number} limit Số dòng cần lấy
 */
function getRecentLogs(limit) {
  limit = limit || 50;
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME_TELEMETRY);
  if (!sheet) return [];

  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var startRow = Math.max(2, lastRow - limit + 1);
  var numRows = lastRow - startRow + 1;
  var range = sheet.getRange(startRow, 1, numRows, 10);
  var values = range.getValues();

  var logs = [];
  for (var i = values.length - 1; i >= 0; i--) {
    var row = values[i];
    logs.push({
      time: row[0],
      event: row[1],
      voltage: row[2],
      current: row[3],
      power: row[4],
      soc: row[5],
      maxCell: row[6],
      minCell: row[7],
      deltaV: row[8],
      temp: row[9]
    });
  }
  return logs;
}
