const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');

// GET /api/calendar/events - Obtener eventos de calendario
router.get('/events', calendarController.getCalendarEvents);

module.exports = router;