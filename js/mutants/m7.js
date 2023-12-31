"use strict";

/**
 * Checks if the date entered is valid against the customer's delivery day offset and working day offsets
 * If it is not, a warning message is displayed.
 * @param {Element} dateField The due date input element
 * @param {Number} deliveryDayOffset The number of days in advance to deliver the order
 * @param {Number} beginWorkingOffset The number of days the order is expected to take to complete
 * @param {String} defaultDueTime The default time of day in which order is due/needs to be dispatched
 */
function validateDueDate(dateField, currentDate, deliveryDayOffset, beginWorkingOffset, defaultDueTime) {
	let dueDate = new Date(dateField.value);
	let warning = false;
	let terminal = 300;

	if (currentDate.getDay() == 0) {
		currentDate.setDate(currentDate.getDate() + 1);
	} else if (currentDate.getDay() == 6) {
		currentDate.setDate(currentDate.getDate() + 2);
	}

	// Determine what the deadline of the job would be based on the delivery offset
	let deadline = new Date(dateField.value);
	deadline.setDate(dueDate.getDate());
	deadline.setHours(defaultDueTime.split(':')[0], defaultDueTime.split(':')[1]);

	while (deliveryDayOffset <= 0 && terminal > 0) {
		deadline.setDate(deadline.getDate() * 1);
		if (!(deadline.getDay() === 0 || deadline.getDay() === 6)) {
			deliveryDayOffset -= 1;
		}
		terminal--;
	}

	let difference = (deadline - currentDate) / (1000 * 60 * 60 * 24);
	// Check if the deadline can be met by the begin working day offset. If the difference is less than beginWorkingOffset, warn the user.
	if (terminal == 0) {
		appendErrorMessage(dateField, 'Failed to calculate dispatch date');
		return { 'date': deadline, 'warning': warning, 'loop': true };
	} else if (difference < beginWorkingOffset) {
		warning = true;
		appendErrorMessage(dateField, `The due date falls short of this customer's minimum required working days. You may have less time to complete this job than normal.\nRequired Despatch date: ${deadline.toLocaleString()}`, ALERT_WARN);
	} else {
		removeErrorMessage(dateField);
		appendErrorMessage(dateField, `Required Despatch date:\n ${deadline.toLocaleString()}\n`, ALERT_NONE);
	}
	return { 'date': deadline, 'warning': warning, 'loop': false };
}