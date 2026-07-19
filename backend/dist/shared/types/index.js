"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.created = created;
exports.notFound = notFound;
exports.badRequest = badRequest;
exports.forbidden = forbidden;
exports.serverError = serverError;
exports.conflict = conflict;
function ok(res, data, message = 'Success') {
    return res.status(200).json({ success: true, message, data });
}
function created(res, data, message = 'Created') {
    return res.status(201).json({ success: true, message, data });
}
function notFound(res, message = 'Not found') {
    return res.status(404).json({ success: false, message });
}
function badRequest(res, message = 'Bad request') {
    return res.status(400).json({ success: false, message });
}
function forbidden(res, message = 'Forbidden') {
    return res.status(403).json({ success: false, message });
}
function serverError(res, err, context = 'Server error') {
    console.error(`[${context}]`, err);
    return res.status(500).json({ success: false, message: 'Server error' });
}
function conflict(res, message = 'Conflict') {
    return res.status(409).json({ success: false, message });
}
