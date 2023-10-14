/**
 * Aids in the process of swapping out the "correct" program with the incorrect programs to perform mutation tests.
 */

"use strict";

// Global variable to indicate if tests are being run. Used to prevent test runs from running simultaneously.
let running = false;

function loadScript(url) {
	let head = document.head;
	let script = document.createElement('script');
	// let script = document.getElementById('function');
	script.type = 'text/javascript';
	script.src = url;
	head.appendChild(script);
}

function getScriptURL(name) {
	let script = 'validateDueDate';
	if (name != 'original') {
		script = `mutants/${name}`;
	}

	return `js/${script}.js`;
}

/**
 * Evaluates wether the two outputs from a test killed the mutant or not.
 * @param {Object} sourceTest 
 * @param {Object} followUpTest 
 */
function compareTests(sourceTest, followUpTest, expected, MR, mutant) {
	let killed = false;
	if (followUpTest.date.toLocaleString() !== expected.toLocaleString()) {
		killed = true;
	}
	outputResult(MR, mutant, killed);
}

function runTest() {
	let customerDropdown = document.getElementById("Customer");
	let mutationSelect = document.getElementById('mutationSelect');
	let dueDateValue = new Date();
	let MR = 0;
	let SO;
	let FO;
	let expected;

	// make sure a customer is selected to prefill the values
	if (customerDropdown.getAttribute('data-deliveryoffset') == null) {
		customerDropdown.selectedIndex = 3;
		displayDeliveryOffsets(customerDropdown.children[customerDropdown.selectedIndex]);
	}

	let currentDate = new Date(Date.now());
	let dueDate = document.getElementById('DateDue');
	let deliveryOffset = document.getElementById('deliveryOffset').value;
	let beginWorkOffset = document.getElementById('beginworkingoffset').value;
	let dueTime = document.getElementById('defaultduetime').value;
	loadScript(getScriptURL(mutationSelect.value));

	dueDateValue.setDate(dueDateValue.getDate() + 12);
	dueDate.value = dueDateValue.toLocaleString('sv').substring(0, 16);
	deliveryOffset = 2;

	for (MR; MR < 3; MR++) {
		console.log(MR, mutationSelect.value)
		MRSwitch:
		switch (MR) {
			// MR 1: Divide delivery day offset by n
			case 0:
				SO = validateDueDate(dueDate, currentDate, deliveryOffset, beginWorkOffset, dueTime);
				FO = validateDueDate(dueDate, currentDate, deliveryOffset / 2, beginWorkOffset, dueTime);

				// check if the source input with its outputted date + the MR is the same as the follow-up output.
				expected = new Date(SO.date);
				expected.setDate(expected.getDate() + (deliveryOffset / 2));
				compareTests(SO, FO, expected, 'MR1', mutationSelect.value);
				break MRSwitch;
			// MR 2: Add n to all dates
			case 1:
				let dateOffset = 2;
				SO = validateDueDate(dueDate, currentDate, deliveryOffset, beginWorkOffset, dueTime);
				let followUpDate = new Date(dueDate.value);
				followUpDate.setDate(followUpDate.getDate() + dateOffset);
				dueDate.value = followUpDate.toLocaleString('sv').substring(0, 16);

				FO = validateDueDate(dueDate, currentDate.setDate(currentDate.getDate() + dateOffset), deliveryOffset, beginWorkOffset, dueTime);


				// check if the source input with its outputted date + the MR is the same as the follow-up output.
				expected = new Date(SO.date);
				expected.setDate(expected.getDate() + 1);
				console.log(SO, FO, expected);
				compareTests(SO, FO, expected, 'MR2', mutationSelect.value);
				break MRSwitch;
			// MR 3: Multiply all dates by -1
			case 2:
				compareTests(SO, FO, expected, 'MR3', mutationSelect.value);
				break MRSwitch;
		}
	}

	mutationSelect.selectedIndex += 1;
}

/**
 * Runs all tests on all available mutants for each metamorphic relation.
 */
function runTests() {
	let mutationSelect = document.getElementById('mutationSelect');

	if (!running) {
		running = true;
		let customerDropdown = document.getElementById("Customer");

		running = false;
	}
}

/**
 * Outputs the results of a test case to the output table at the bottom of the page.
 * @param {String} MR The MR ID
 * @param {String} mutantID The mutant ID
 * @param {Boolean} killed wether the mutant has been killed or not based on the metamorphic relation.
 */
function outputResult(MR, mutantID, killed) {
	let table = document.getElementById(`results_${MR}`);
	let row = document.createElement('tr');
	
	row.innerHTML = `<td>${MR}</td><td>${mutantID}</td><td>${killed ? ' &#10004;' : ''}</td><td></td>`;
	table.appendChild(row);
}

document.getElementById('mutationSelect').addEventListener('change', e => {
	loadScript(getScriptURL(e.target.value));
});
document.getElementById('testRun').onclick = runTest;
