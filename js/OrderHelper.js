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

function toggleProducts(toggle) {
	let products = document.getElementById('ProductItems').children;
	let i = 0;

	for (i; i < products.length; i++) {
		if (products[i].tagName !== 'LEGEND') {
			if (toggle.checked) {
				products[i].classList.add('hidden');
			} else {
				products[i].classList.remove('hidden');
			}
		}
	}
}

function init() {
	let toggleDisplayBtn = document.getElementById("toggleExtraFields");
	let customerDropdown = document.getElementById("Customer");
	let dueDate = document.getElementById('DateDue');
	let deliveryOffset = document.getElementById('deliveryOffset');
	let beginWorkOffset = document.getElementById('beginworkingoffset');
	let dueTime = document.getElementById('defaultduetime');

	if (toggleDisplayBtn !== null) {
		toggleDisplayBtn.addEventListener("click", toggleExtraFields);
	}

	document.getElementById('hide_products').onclick = e => toggleProducts(e.target)

	customerDropdown.addEventListener('change', e => {
		displayDeliveryOffsets(e.target.children[customerDropdown.selectedIndex]);
	});

	if (dueDate !== null) {
		[customerDropdown, dueDate, deliveryOffset, beginWorkOffset, dueTime].forEach(element => {
			element.addEventListener('change', function (e) {
				validateDueDate(dueDate, deliveryOffset.value, beginWorkOffset.value, dueTime.value);
			});
		});
	}
}

window.addEventListener("load", init());