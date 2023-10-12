/**
 * OrderQuoteHelper.js
 * Author: Kristian Oqueli Ambrose
 * Created: 09/03/2023
 * Modified: 21/09/2023
 * 
 * Description:
 * This script aids in the creation of a new order or Quote in the War room system.
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
 * @param {Element} customer The selected customer dropdown option
 */
function validateDueDate(dateField, customer) {
	console.log(customer);
	let deliveryDayOffset = customer.getAttribute('data-DeliveryOffset');
	let beginWorkingOffset = customer.getAttribute('data-BeginWorkingOffset');
	let defaultDueTime = customer.getAttribute('data-DefaultDueTime');
	let dueDate = new Date(dateField.value);

	// Determine what the deadline of the job would be based on the delivery offset
	let deadline = new Date(dateField.value);
	deadline.setDate(dueDate.getDate() - deliveryDayOffset);
	deadline.setHours(defaultDueTime.split(':')[0], defaultDueTime.split(':')[1]);

	let difference = (deadline - Date.now()) / (1000 * 60 * 60 * 24);
	let weeks = (difference / 7) + (new Date(Date.now()).getDay() / 7);
	difference -= Math.floor(weeks) * 2;

	// Ensure the calculated deadline is on a business day. I.e. if the deadline falls on a weekend, set it to the friday beforehand
	if (deadline.getDay() === 0) {
		deadline.setDate(deadline.getDate() - 2);
	} else if (deadline.getDay() === 6) {
		deadline.setDate(deadline.getDate() - 1);
	}

	// Check if the deadline can be met by the begin working day offset. If the difference is less than beginWorkingOffset, warn the user.
	if (difference < beginWorkingOffset) {
		appendErrorMessage(dateField, "The due date falls short of this customer's minimum required working days. You may have less time to complete this job than normal.\nRequired Despatch date:" + deadline.toDateString(), ALERT_WARN);
	} else {
		removeErrorMessage(dateField);
		appendErrorMessage(dateField, "Required Despatch date:\n" + deadline.toDateString(), ALERT_NONE);
	}
}

/**
 * 
 * @param {*} element 
 */
function displayDeliveryOffsets(element) {

}

function init() {
	let toggleDisplayBtn = document.getElementById("toggleExtraFields");
	let orderInitialiserForm = document.getElementById("OrderInitialiser");
	let customerDropdown = document.getElementById("Customer");
	let dueDate = document.getElementById('DateDue');
	// let calculateButtons = document.getElementsByClassName("btn-calculate");
	let i = 0;

	if (toggleDisplayBtn !== null) {
		toggleDisplayBtn.addEventListener("click", toggleExtraFields);
	}

	if (dueDate !== null) {
		dueDate.addEventListener('change', function (e) {
			validateDueDate(this, customerDropdown.children[customerDropdown.selectedIndex]);
		});
	}

	// Add event listeners for the customer and machine type dropdowns to automatically submit the page when they are selected
	orderInitialiserForm.addEventListener("change", e => {
		orderInitialiserForm.submit();
	});
}

window.addEventListener("load", init());