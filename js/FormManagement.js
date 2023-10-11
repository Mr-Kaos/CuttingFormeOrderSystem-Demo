/**
 * FormManagement.js
 * 
 * This file contains a few function to help the management of tables.
 * 
 * Author: Kristian Oqueli Ambrose
 * Created: 05/12/2022
 * Last Modified: 02/10/2023
 * 
 */
"use strict"

/**
 * Gets the form element that is the parent of the given element.
 * If no form element is found, null is returned.
 * @param {DOM Element} element The element that is a child of the form element.
 */
function getForm(element) {
	let form = element.parentElement;

	if (form.tagName != 'FORM') {
		form = element.parentElement.parentElement;
	}

	if (form.tagName != 'FORM') {
		form = null;
	}

	return form;
}

/**
 * Moves a pill from its current pillbox to the pillbox passed in
 * @param {DOM Element} element the pill that has been clicked on
 * @param {DOM Element} pillboxOne the first pillbox it toggles between
 * @param {DOM Element} pillboxTwo the second pillbox it toggles between
 * @param {DOM Element} buttonOne the text to display on the button when in pillboxOne
 * @param {DOM Element} buttonTwo the text to display on the button when in pillboxTwo
 */
function PillBoxToggle(element, pillboxOne, pillboxTwo, buttonOne = "🢃", buttonTwo = "🢁") {
	let newPill = null;
	if (element.parentElement == pillboxOne) {
		newPill = movePillBetweenBoxes(element, pillboxTwo);
		newPill.getElementsByClassName("pill-btn-toggle")[0].innerHTML = buttonTwo;
	} else {
		newPill = movePillBetweenBoxes(element, pillboxOne);
		newPill.getElementsByClassName("pill-btn-toggle")[0].innerHTML = buttonOne;
	}
	return newPill;
}

/**
 * Moves a pill from its current pillbox to the pillbox passed in
 * @param {DOM Element} pill the pill to move
 * @param {DOM Element} toBox the pillbox to move the pill to
 */
function movePillBetweenBoxes(pill, toBox) {
	let newPill = pill.cloneNode(true);
	toBox.append(newPill);
	pill.remove();
	return newPill;
}

/**
 * Generates the Deleting X for pillboxes.
 * 
 * @return {Element} Returns the X element for pills.
 */
function pillClose() {
	let pillClose = document.createElement('span');
	pillClose.className = 'pill-btn-del';
	pillClose.innerHTML = '&times;';
	pillClose.addEventListener('click', removePill);
	return pillClose;
}

/**
 * Adds the selected option in a multi-foreign-key dropdown to its associated input field in a form.
 * 
 * @param {Element} dropdown The drop-down element that is associated with a multi-foreign key field.
 */
function addMultiForeignKeySelection(dropdown) {
	let selectedValue = dropdown.options[dropdown.selectedIndex];
	let pillBox = document.getElementById('pillbox-' + dropdown.id.replace('multi-', ''));

	if (selectedValue.value !== "modal_new" && selectedValue.value !== 'NULL') {
		let newPill = document.createElement('div');
		newPill.className = 'pill';
		newPill.setAttribute('dropdown', dropdown.id);
		newPill.innerHTML = dropdown.options[dropdown.selectedIndex].innerHTML;
		let pillValue = document.createElement('input');
		pillValue.name = `${dropdown.id}_${selectedValue.value}`;
		pillValue.type = 'hidden';
		pillValue.setAttribute('dropdown', dropdown.id);
		pillValue.value = selectedValue.value;
		let pillClose = document.createElement('span');
		pillClose.className = 'pill-btn-del';
		pillClose.innerHTML = '&times;';
		pillClose.onclick = e => removePill(newPill);

		newPill.prepend(pillValue);

		let pillAppendBack = document.getElementById(dropdown.id.replace('multi-', '') + "-pill-html-append-back");
		let pillAppendFront = document.getElementById(dropdown.id.replace('multi-', '') + "-pill-html-append-front");

		// PLEASE CHANGE THIS. Page-specific code should not be in a reusable piece of code!
		//I am aware this is janky, currently is best option.
		if (dropdown.id == "multi-assigned-addresses") {
			//Should Probably use create Elements for this. Will do so at some point.
			pillAppendFront = "<input type='radio' name='PrimaryAddress' onChange='changePrimaryAddress(this)' id='primaryToggle" + selectedValue.value + "' value='" + selectedValue.value + "'>";
		}

		if (pillAppendBack != null) {
			newPill.innerHTML += pillAppendBack.innerHTML;
		}
		if (pillAppendFront != null) {
			newPill.innerHTML = pillAppendFront + newPill.innerHTML;
		} else {
			newPill.innerHTML = newPill.innerHTML;
		}

		newPill.append(pillClose);
		pillBox.prepend(newPill);

		dropdown.options[dropdown.selectedIndex].classList.add('hidden');
	}

	dropdown.selectedIndex = 0;
}

/**
 * Removes all pills from the specified dropdown's pillbox.
 * @param {Element} pillbox
 */
function clearPillBox(pillbox) {
	let i = 0;
	let pillCount = pillbox.childElementCount;

	if (pillCount > 0) {
		for (i = 0; i < pillCount; i++) {
			removePill(pillbox.children[0]);
		}
	}
}

/** Removes the selected pill from its container and un-hides its respective dropdown item back to the list.
 * @param {Element} pill The pill element to remove.
*/
function removePill(pill) {
	// pill = (pill.target.parentElement);
	let pillValue = pill.children[0].value;
	let dropdown = document.getElementById(pill.getAttribute('dropdown'));
	if (!dropdown.disabled) {
		let i = 0;
		for (i; i < dropdown.options.length; i++) {
			if (dropdown.options[i].value == pillValue) {
				dropdown.options[i].className = '';
				pill.remove();
				break;
			}
		}
	}

}

/**
 * Resets all inputs for non-standard inputs such as pillboxes.
 * @param {Element} form The form to reset
 */
function clearForm(form) {
	let pillboxes = form.querySelectorAll('.pill-box');
	let i = 0;

	for (i; i < pillboxes.length; i++) {
		clearPillBox(pillboxes[i]);
	}
}

/**
 * Initialises all necessary components for this script to function.
 */
function init() {
	let btnReset = document.querySelector('button[type=reset]');

	window.onchange = e => {
		if (e.target.id.substring(0, 6) == 'multi-') {
			addMultiForeignKeySelection(e.target);
		}
	}
	let pillBoxes = document.querySelectorAll('select[id^=multi-]');
	for (let i = 0; i < pillBoxes.length; i++) {
		let prefill = document.getElementById(pillBoxes[i].id.replace('multi-', 'prefill_'));

		if (prefill != null) {
			let ii = 0;
			for (ii; ii < prefill.childElementCount; ii++) {
				pillBoxes[i].value = prefill.children[ii].innerHTML;
				addMultiForeignKeySelection(pillBoxes[i]);
			}
		}
	}
	if (btnReset !== null) {
		btnReset.onclick = e => clearForm(btnReset.parentElement);
	}
}
window.addEventListener("load", init());