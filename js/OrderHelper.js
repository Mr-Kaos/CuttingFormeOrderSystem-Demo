/**
 * OrderQuoteHelper.js
 * Author: Kristian Oqueli Ambrose
 * Created: 09/03/2023
 * Modified: 13/10/2023
 * 
 * Description:
 * This script aids in the creation of a new order or Quote in the War room system.
 * This is an altered version of the original script used to demonstrate metamorphic testing with the validateDueDate function.
 */

"use strict";

function toggleExtraFields() {
	const toggleId = "data-ToggleDisplay";
	let toggleable = document.querySelectorAll(`[${toggleId}="true"]`);
	let parentDiv;

	for (let i = 0; i < toggleable.length; i++) {
		parentDiv = toggleable[i].parentElement;
		if (parentDiv.classList.contains("hidden")) {
			parentDiv.classList.remove("hidden");
		} else {
			parentDiv.classList.add("hidden");
		}
	}
}

/**
 * Toggles the specified product as "added" to the order/quote by enabling or disabling its inputs.
 * Also adds a highlighted effect to it to indicate it as added to the order/quote.
 * @param {String} productName The name of the product to be toggled as part of the order.
 */
function toggleProduct(productName) {
	let button = document.getElementById(`Add_${productName}`);
	let fieldset = document.getElementById(`Prod_${productName}`);
	let inputs = fieldset.querySelectorAll("input,select,textarea");
	const PREFIX_BTN_ADD = "Add_";

	if (button.checked) {
		fieldset.classList.add('highlight')
	} else {
		fieldset.classList.remove('highlight')
	}

	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].id !== (PREFIX_BTN_ADD + productName)) {
			if (!(inputs[i].childElementCount == 1 && inputs[i].childNodes[0].innerHTML == "No options available")) {
				if (inputs[i].attributes.dropdown != undefined) {
					if (inputs[i].parentElement.parentElement.parentElement.childNodes[1].getAttribute("disabled") != null) {
						inputs[i].disabled = true;
					} else {
						inputs[i].disabled = false;
					}
				} else {
					inputs[i].disabled = !inputs[i].disabled;
				}
			}
		}
	}
}

/**
 * Checks if the date entered is valid against the customer's delivery day offset and working day offsets
 * If it is not, a warning message is displayed.
 * @param {Element} dateField The due date input element
 * @param {Number} deliveryDayOffset The number of days in advance to deliver the order
 * @param {Number} beginWorkingOffset The number of days the order is expected to take to complete
 * @param {String} defaultDueTime The default time of day in which order is due/needs to be dispatched
 */
function validateDueDate(dateField, deliveryDayOffset, beginWorkingOffset, defaultDueTime) {
	let dueDate = new Date(dateField.value);

	// Determine what the deadline of the job would be based on the delivery offset
	let deadline = new Date(dateField.value);
	deadline.setDate(dueDate.getDate());
	deadline.setHours(defaultDueTime.split(':')[0], defaultDueTime.split(':')[1]);

	while (deliveryDayOffset > 0) {
		deadline.setDate(deadline.getDate() - 1);
		if (!(deadline.getDay() === 0 || deadline.getDay() === 6)) {
			deliveryDayOffset -= 1;
		}
	}

	let difference = (deadline - Date.now()) / (1000 * 60 * 60 * 24);

	console.log(difference, beginWorkingOffset);
	// Check if the deadline can be met by the begin working day offset. If the difference is less than beginWorkingOffset, warn the user.
	if (difference < beginWorkingOffset) {
		appendErrorMessage(dateField, `The due date falls short of this customer's minimum required working days. You may have less time to complete this job than normal.\nRequired Despatch date: ${deadline.toLocaleString()}`, ALERT_WARN);
	} else {
		removeErrorMessage(dateField);
		appendErrorMessage(dateField, `Required Despatch date:\n ${deadline.toLocaleString()}\n`, ALERT_NONE);
	}
}

/**
 * Displays the delivery offset values for the selected customer.
 * Used for demonstration purposes.
 * @param {*} element 
 */
function displayDeliveryOffsets(element) {
	let deliveryOffset = document.getElementById('deliveryOffset');
	deliveryOffset.value = element.getAttribute('data-deliveryoffset');
	let beginWorkOffset = document.getElementById('beginworkingoffset');
	beginWorkOffset.value = element.getAttribute('data-beginworkingoffset');
	let dueTime = document.getElementById('defaultduetime');
	dueTime.value = element.getAttribute('data-defaultduetime');
}

function init() {
	let toggleDisplayBtn = document.getElementById("toggleExtraFields");
	let customerDropdown = document.getElementById("Customer");
	let dueDate = document.getElementById('DateDue');
	let deliveryOffset = document.getElementById('deliveryOffset');
	let beginWorkOffset = document.getElementById('beginworkingoffset');
	let dueTime = document.getElementById('defaultduetime');
	let i = 0;

	if (toggleDisplayBtn !== null) {
		toggleDisplayBtn.addEventListener("click", toggleExtraFields);
	}

	customerDropdown.addEventListener('change', e => {
		displayDeliveryOffsets(e.target.children[customerDropdown.selectedIndex]);
	});

	if (dueDate !== null) {
		[dueDate, deliveryOffset, beginWorkOffset, dueTime].forEach(element => {
			element.addEventListener('change', function (e) {
				validateDueDate(dueDate, deliveryOffset.value, beginWorkOffset.value, dueTime.value);
			});
		});
	}
}

window.addEventListener("load", init());