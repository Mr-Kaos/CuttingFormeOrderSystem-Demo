/**
 * liveFieldValidator.js
 * 
 * Author: Kristian Oqueli Ambrose
 * Created: 18/11/2022
 * 
 * Description:
 * Performs live data validation on all fields on the active webpage.
 * 
 * Modified:
 * 20/04/2023 - Kristian Oqueli Ambrose
 * 	- Updated numeric field validation to remove entered alpha characters from the input without resetting the whole input.
 * 	- Added String size validation to ensure the data size of the string entered does not exceed what the server can handle.
 */

"use strict";

const ALERT_OK = '-ok';
const ALERT_WARN = '-warn';
const ALERT_ERROR = '-invalid';
const ALERT_NONE = '-none';

/**
 * Checks the passed number input element's value to make sure it does not exceed the minimum and maximum values.
 * @param {Element} element The DOM Input element to be checked live. Must be of type "number"
 * @param {Number} prevInput The previous value of the field before an invalid character (NaN) is entered.
 */
function validateNumericInput(element, prevInput) {
	let valid = false;
	let val = parseFloat(element.value);
	let min = parseInt(element.getAttribute("min"));
	let max = parseInt(element.getAttribute("max"));

	if (isNaN(val) && prevInput != '') {
		element.value = prevInput;
		appendErrorMessage(element, "Only numerical values are allowed here.");
	} else {
		valid = true;
		// If the step is less than 1 remove prepending 0s if they exist.
		if (element.step == 1) {
			element.value = val;
		}
		if (val > max)
			element.value = max;
		else if (val < min)
			element.value = min;
		removeErrorMessage(element);
	}

	return valid;
}

/**
 * Checks the given element's value to ensure it's byte size does not exceed the length attribute of the input field.
 * @param {Element} element The DOM input element to be checked live. Must be of type "text" or "textarea".
 */
function validateStringInput(element, newChar) {
	let valid = false;
	let value = element.value;
	let dataSize = new Blob([value]).size;
	let maxDataSize = element.maxLength;

	if (dataSize > maxDataSize) {
		element.value = value.substring(0, value.length - newChar.length);
		appendErrorMessage(element, "The input has been truncated as it exceeded the maximum data size allowed.", ALERT_WARN);
	} else if (element.required && value == '') {
		appendErrorMessage(element, "A value must be provided.");
	} else {
		removeErrorMessage(element);
		valid = true;
	}

	return valid;
}

/**
 * Validates the given input to check if it's a valid email.
 * @param {Element} element The DOM input element to be checked live. Must be of type "text" or "textarea".
 * @returns {Boolean}
 */
function validateEmailInput(element) {
	let valid = false;
	var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]$/;

	if (!emailPattern.test(element.value)) {
		appendErrorMessage(element, "Invalid email format.", ALERT_ERROR);
	} else {
		removeErrorMessage(element);
		valid = true;
	}

	return valid;
}

/**
 * Validates a password input based on standard password complexity requirements.
 * Passwords are validated to ensure they are at least 8 characters long and contain alphanumeric characters.
 * Author: Precious Akande
 * @param {Element} element 
 * @returns {Boolean} True if valid, else false.
 */
function validatePasswordInput(element) {
	let valid = false;

	var pwdupperreg = /[A-Z]/;
	var pwdlowerreg = /[a-z]/;
	var pwdnumberreg = /[0-9]/;

	if (!pwdupperreg.test(element.value) || !pwdlowerreg.test(element.value) || !pwdnumberreg.test(element.value) || element.value.length < 8) {
		appendErrorMessage(element, "Password is not strong enough");
	} else {
		removeErrorMessage(element);
		valid = true;
	}

	return valid;
}

/**
 * Validates a telephone input
 * Author: Precious Akande
 * @param {Element} element 
 * @returns {Boolean} True if valid, else false.
 */
function validateTelephoneInput(element) {
	let valid = false;
	var phonePattern = /^\+(?:\d{1,3})?(\d{3,})$/;

	if (!phonePattern.test(element.value)) {
		appendErrorMessage(element, "Invalid Phone number format.");
	} else {
		removeErrorMessage(element);
		valid = true;
	}

	return valid;
}

/**
 * Removes any messages on the dropdown input if it's value is not null.
 * @param {Element} element The dropdown to be validated
 */
function validateDropdown(element) {

	if (element.required && (element.value != null || element.value != 'NULL')) {
		removeErrorMessage(element);
	}
}

/**
 * Appends a span element after the specified element with the specified message.
 * Used to alert the user of invalid inputs if one is made.
 * Also adds a red outline to the associated fieldset where the error occurs.
 * 
 * @param {Element} element The element to append the message beside. Should be an input element.
 * @param {String} message The message to be appended next to the element.
 * @param {String} alertType Optional. The type of alert to present to the user. Alerts can be ALERT_OK, ALERT_WARN or ALERT_ERROR
 */
function appendErrorMessage(element, message, alertType = ALERT_ERROR) {
	if (element !== null) {
		let associatedFieldset;
		let msgElement = document.getElementById(element.id + "_MSG");
		element.classList.add(`input${alertType}`);

		// Make sure the element being appended does not already exist
		if (msgElement === null) {
			msgElement = document.createElement("span");
			msgElement.id = element.id + "_MSG";
			msgElement.innerText = message;
			element.insertAdjacentElement('afterend', msgElement);
		} else {
			msgElement.innerText = message;
		}
		msgElement.className = `input-text${alertType}`;

		// Find the associated fieldset of the input and style it accordingly.
		if ((associatedFieldset = getInputFieldset(element)) !== undefined) {
			associatedFieldset.classList.add(`input${alertType}`);
		}
	} else {
		console.warn('Could not append error message to element as it is null.');
	}
}

/**
 * Removes an error message from an input element if one exists.
 * @param {Element} element 
 * @returns {Boolean} True if an error message exists and is removed. Else returns false.
 */
function removeErrorMessage(element) {
	let removed = false;
	if (element !== null) {
		let msgElement = document.getElementById(element.id + "_MSG");
		let associatedFieldset;
		if (msgElement !== null) {
			msgElement.remove();
			removed = true;
		}
		element.classList.remove("input" + ALERT_ERROR);
		element.classList.remove("input" + ALERT_WARN);
		element.classList.remove("input" + ALERT_OK);

		// Find the associated fieldset of the input and style it accordingly.
		if ((associatedFieldset = getInputFieldset(element)) !== undefined) {
			associatedFieldset.classList.remove("input" + ALERT_ERROR);
			associatedFieldset.classList.remove("input" + ALERT_WARN);
			associatedFieldset.classList.remove("input" + ALERT_OK);
		}
	}
	return removed;
}

/**
 * Finds the fieldset that is the parent of the given input element and returns it.
 * @param {Element} input The input element to find its fieldset for.
 * @returns {Element|null} The fieldset if found. Else null.
 */
function getInputFieldset(input) {
	let fieldset;
	const MAX_ITERATIONS = 5;
	let i = 0;

	if (input !== null) {
		while (i < MAX_ITERATIONS && fieldset == null) {
			if (input.parentElement.tagName == 'FIELDSET') {
				fieldset = input.parentElement;
			} else {
				input = input.parentElement;
			}
			i++;
		}
	}
	return fieldset;
}

/**
 * Adds a listener to the specified input if it is required.
 * @param {Element} input 
 */
function addRequiredInputListener(input) {
	if (input.required) {
		input.addEventListener("invalid", function (e) {
			if (window.getComputedStyle(input).height === 'auto') {
				console.warn("The input", input.name, "is required and has not been filled in but is hidden!");
				appendErrorMessage(input, 'This field is required.');
			}
		});
	}
}

/**
 * Adds an event listener to the input element based on its type.
 * @param {Element} input The input element
 */
function addValidationListener(input) {
	if (input !== undefined) {
		switch (input.type) {
			case "number":
				let prevInput = null;
				if (prevInput === null) {
					prevInput = input.value;
				}
				input.addEventListener("keyup", function (e) {
					if (!isNaN(parseInt(e.key)) || e.key === '.') {
						prevInput = input.value;
					}
					validateNumericInput(input, prevInput)
				}, false);
				input.addEventListener("change", function () {
					prevInput = input.value;
					validateNumericInput(input, prevInput)
				});
				break;
			case "email":
				input.addEventListener("input", function () {
					validateEmailInput(input);
				});
				break;
			case "tel":
				input.addEventListener("input", function () {
					validateTelephoneInput(input);
				});
				break;
			case "text":
			case "textarea":
				input.addEventListener("input", function (e) {
					validateStringInput(input, e.data);
				});
				break;
			default:
				if (input.tagName === 'SELECT') {
					input.addEventListener("change", function () {
						validateDropdown(input);
					});
				}
		}
	} else {
		console.warn('Cannot add validation to an undefined input.')
	}
}

function init() {
	let inputs = Array.from(document.getElementsByTagName("INPUT"));
	inputs = inputs.concat(Array.from(document.getElementsByTagName("TEXTAREA")));
	inputs = inputs.concat(Array.from(document.getElementsByTagName("SELECT")));

	inputs.forEach(input => {
		addValidationListener(input);
		addRequiredInputListener(input);
	});
}

window.addEventListener("load", init());