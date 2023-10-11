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

/**
 * Takes the machine config ID of the selected machine and retrieves all of its components from the database.
 * From the retrieved data, it prefills all component fields based on that data it received.
 * @param {Int} selection 
 */
function prefillMachineProducts(configDropdown, customerId, machineType) {
	fetch(`../ProductConfigs/request?config=${configDropdown.value}&type=${machineType}&customer=${customerId}`, {
		method: "GET"
	}).then(response => response.text()).then((responseData) => {
		if (responseData !== '{}') {
			let json;
			try {
				json = JSON.parse(responseData);
				removeErrorMessage(configDropdown);
			} catch {
				appendErrorMessage(configDropdown, 'Product configuration is malformed or unreadable.');
			}
			if (json !== null) {
				try {
					autoFillFields(json);
				} catch {
					appendErrorMessage(configDropdown, 'This configuration is malformed. Please check its product configuration - A required value may not be set.');
				}
			}
		} else if (configDropdown.value !== 'NULL') {
			appendErrorMessage(configDropdown, 'No product configurations have been defined for this machine config.');
		}
	});
}

/**
 * This function handles the prefilling of fields from a preset selected by the user.
 * @param {JSON} JSONObj - The JSON object that contains the data to be used to prefill the fields on the page.
 */
function autoFillFields(JSONObj) {
	let fieldset;
	// let addButton;
	let input;

	for (let [key, val] of Object.entries(JSONObj)) {
		if (key === 'ProductDefaultsJSON') {
			let products = JSON.parse(val)
			for (let [product, settings] of Object.entries(products)) {
				fieldset = document.getElementById(`Prod_${product}`);
				// addButton = document.getElementById(`Add_${product}`);
				if (fieldset !== null) {
					// if (!addButton.checked) {
					// 	toggleProduct(product);
					// }
					// addButton.checked = true;
					fillProductFields(product, settings);
				} else {
					console.warn('could not find fieldset:', `Prod_${product}`)
				}
			}
		} else {
			if ((input = document.getElementById(key)) !== null) {
				input.value = val;
				if (input.selectedIndex == -1) {
					appendErrorMessage(input, 'This field cannot be empty!', ALERT_ERROR);
				}
			}
		}
	}
}

/**
 * Takes the JSON of a particular component and sees if any fields for the
 * component exist on the page and prefills them.
 * @param {String} ProductId - The ID of the component to prefill fields for.
 * @param {Object} componentData The JSON data of the component. 
 */
function fillProductFields(productName, componentJSON) {
	let field;
	let i = 0;

	for (let [key, val] of Object.entries(componentJSON)) {
		if (val.constructor === Array) {
			field = document.getElementById(`multi-${productName}_${key}`);
			clearPillBox(document.getElementById(`pillbox-${productName}_${key}`));
		} else {
			field = document.getElementById(`${productName}_${key}`);
		}
		if (field !== null) {
			if (val.constructor === Array) {
				field = document.getElementById(`multi-${productName}_${key}`);
				for (i = 0; i < val.length; i++) {
					field.selectedIndex = val[i];
					addMultiForeignKeySelection(field);
				}
			} else {
				field.value = val;
			}
		} else {
			console.error('Failed to set value for field:', `${productName}_${key}`);
		}
	}
}

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
 */
function validateDueDate(dateField) {
	let deliveryDayOffset = dateField.getAttribute('data-DeliveryOffset');
	let beginWorkingOffset = dateField.getAttribute('data-BeginWorkingOffset');
	let defaultDueTime = dateField.getAttribute('data-DefaultDueTime');
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

function init() {
	let products = document.getElementById("ProductItems");
	let toggleDisplayBtn = document.getElementById("toggleExtraFields");
	let orderInitialiserForm = document.getElementById("OrderInitialiser");
	let machineTypeDropdown = document.getElementById("Machine");
	let configDropdown = document.getElementById("MachineConfig");
	let customerDropdown = document.getElementById("Customer");
	let dueDate = document.getElementById('DateDue');
	// let calculateButtons = document.getElementsByClassName("btn-calculate");
	let i = 0;

	if (machineTypeDropdown != null) {
		machineTypeDropdown.onchange = e => {
			if (machineTypeDropdown.value != null) {
				orderInitialiserForm.submit();
			}
		}
	}

	if (configDropdown !== null) {
		configDropdown.onchange = e => {
			prefillMachineProducts(e.target, customerDropdown.value, machineTypeDropdown.value);
		}
	}

	if (toggleDisplayBtn !== null) {
		toggleDisplayBtn.addEventListener("click", toggleExtraFields);
		toggleExtraFields();
	}

	if (products != null) {
		for (i; i < products.childElementCount; i++) {
			if (products.children[i].tagName === 'FIELDSET') {
				toggleProduct(products.children[i].id.replace('Prod_', ''));
			}
		}
	}

	if (dueDate !== null) {
		dueDate.addEventListener('change', function (e) {
			validateDueDate(this);
		});
	}

	// for (i; i < calculateButtons.length; i++) {
	// 	calculateButtons[i].addEventListener("click", function(e) {
	// 		let itemName = e.target.id.replace("Calculate-", '');
	// 		calculateProduct(document.getElementById("Item_" + itemName));
	// 	})
	// }

	// Add event listeners for the customer and machine type dropdowns to automatically submit the page when they are selected
	orderInitialiserForm.addEventListener("change", e => {
		orderInitialiserForm.submit();
	});
}

window.addEventListener("load", init());