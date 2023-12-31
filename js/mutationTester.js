/**
 * Aids in the process of swapping out the "correct" program with the incorrect programs to perform mutation tests.
 */

"use strict";

// Global variable to indicate if tests are being run. Used to prevent test runs from running simultaneously.
let running = false;
let testInterval = null;

function loadScript(url) {
	let head = document.head;
	let script = document.createElement('script');
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
 * @param {Object} followUpTest 
 */
function compareTests(testData) {
	let killed = false;
	if (testData.FO.date.toLocaleString() !== testData.SO_MR.toLocaleString() || testData.FO.warning !== testData.SO.warning || testData.SO.error !== testData.FO.error) {
		killed = true;
	}
	outputResult(testData, killed);
}

function runTest() {
	let randomInputBox = document.getElementById("disableRandom");
	let customerDropdown = document.getElementById("Customer");
	let mutationSelect = document.getElementById('mutationSelect');
	let dueDate = document.getElementById('DateDue');
	let MR = 0;

	if (dueDate.value == "") {
		appendErrorMessage(dueDate, 'Please enter a date.');
	} else if (mutationSelect.selectedIndex !== -1 && mutationSelect.selectedIndex !== 0) {
		removeErrorMessage(document.getElementById('testRun'));

		// make sure a customer is selected to prefill the values.
		// If no customer is selected or random inputs are enabled, choose a random customer.
		if (!randomInputBox.checked && customerDropdown.getAttribute('data-deliveryoffset') == null) {
			customerDropdown.selectedIndex = (Math.random() * (customerDropdown.childElementCount - 1)) + 1;
			displayDeliveryOffsets(customerDropdown.children[customerDropdown.selectedIndex]);
		}

		loadScript(getScriptURL(mutationSelect.value));

		for (MR; MR < 3; MR++) {
			// let currentDate = new Date('2023-10-15');
			let currentDate = new Date(Date.now().valueOf());
			let currentDateCopy = new Date(currentDate);
			let currentDateCopy2 = new Date(currentDate);
			// currentDate.setDate(currentDate.getDate() + Math.random() * 10);
			let originalDueDate = dueDate.value;
			let deliveryOffset = document.getElementById('deliveryOffset').value;
			let beginWorkOffset = document.getElementById('beginworkingoffset').value;
			let dueTime = document.getElementById('defaultduetime').value;
			let expected;
			let dueDateValue = new Date(dueDate.value);
			let SO;
			let FO;
			let followUpDate = new Date(dueDate.value);
			let testData = { relation: null, mutant: null, SI: null, FI: null, SO: null, FO: null, SO_MR: null, check: null };
			testData.mutant = mutationSelect.value;

			MRSwitch:
			switch (MR) {
				// MR 1: Divide delivery day offset by n
				case 0:
					let division = 2;
					SO = validateDueDate(dueDate, currentDate, deliveryOffset, beginWorkOffset, dueTime);
					testData.SI = { dueDateValue, currentDate: currentDateCopy, deliveryOffset, beginWorkOffset, dueTime };

					currentDate = new Date(currentDateCopy);
					// Apply the metamorphic relation to the delivery offset
					FO = validateDueDate(dueDate, currentDate, (deliveryOffset / division), beginWorkOffset, dueTime);
					testData.FI = { dueDateValue, currentDate: currentDateCopy, deliveryOffset: (deliveryOffset / division), beginWorkOffset, dueTime };

					// check if the source input with its outputted date + the MR is the same as the follow-up output.
					expected = new Date(SO.date);
					expected.setDate(expected.getDate() + (deliveryOffset / division));

					testData.relation = 'MR1';
					testData.check = `/n`;
					break MRSwitch;
				// MR 2: Add n to all dates
				case 1:
					let dateOffset = 2;
					SO = validateDueDate(dueDate, currentDate, deliveryOffset, beginWorkOffset, dueTime);
					testData.SI = { dueDateValue: new Date(dueDateValue.valueOf()), currentDate: currentDateCopy, deliveryOffset, beginWorkOffset, dueTime };

					// Apply the metamorphic relation test to the current date and due date
					// followUpDate = new Date(dueDate.value);
					currentDate = new Date(currentDateCopy);
					followUpDate.setDate(followUpDate.getDate() + dateOffset);
					dueDate.value = followUpDate.toLocaleString('sv').substring(0, 16);
					currentDate.setDate(currentDate.getDate() + dateOffset);
					dueDateValue.setDate(dueDateValue.getDate() + dateOffset);
					currentDateCopy2.setDate(currentDateCopy2.getDate() + dateOffset);

					FO = validateDueDate(dueDate, currentDate, deliveryOffset, beginWorkOffset, dueTime);
					testData.FI = { dueDateValue: followUpDate, currentDate: currentDateCopy2, deliveryOffset, beginWorkOffset, dueTime };

					// check if the source input with its outputted date + the MR is the same as the follow-up output.
					expected = new Date(SO.date);
					expected.setDate(expected.getDate() + dateOffset);

					testData.relation = 'MR2';
					testData.check = `+n`;
					break MRSwitch;
				// MR 3: Multiply all dates by -1
				case 2:
					SO = validateDueDate(dueDate, currentDate, deliveryOffset, beginWorkOffset, dueTime);
					testData.SI = { dueDateValue: new Date(dueDateValue.valueOf()), currentDate: currentDateCopy, deliveryOffset, beginWorkOffset, dueTime };

					// Apply the metamorphic relation to the current date and due date.
					// followUpDate = new Date(dueDate.value);
					currentDate = new Date(currentDateCopy);
					followUpDate.setDate(followUpDate.getDate() * -1);
					dueDate.value = followUpDate.toLocaleString('sv').substring(0, 16);
					currentDate.setDate(currentDate.getDate() * -1);
					currentDateCopy2.setDate(currentDateCopy.getDate() * -1);

					FO = validateDueDate(dueDate, currentDate, deliveryOffset, beginWorkOffset, dueTime);
					testData.FI = { dueDateValue: followUpDate, currentDate: currentDateCopy2, deliveryOffset, beginWorkOffset, dueTime };

					// check if the source input with its outputted date + the MR is the same as the follow-up output.
					expected = new Date(SO.date);
					expected.setDate(expected.getDate() * -1);
					testData.relation = 'MR3';
					testData.check = `*-1`;
					break MRSwitch;
			}
			testData.SO = SO;
			testData.FO = FO;
			testData.SO_MR = expected;
			compareTests(testData);
			dueDate.value = originalDueDate;
		}
	} else {
		if (testInterval !== null) {
			clearInterval(testInterval);
			mutationSelect.selectedIndex = 0;
			testInterval = null;
		}
		if (mutationSelect.selectedIndex == 0) {
			appendErrorMessage(document.getElementById('testRun'), 'Tests are disabled on the original program.');
		}
	}
	loadScript(getScriptURL(mutationSelect.value));
}

/**
 * Runs all tests on all available mutants for each metamorphic relation.
 */
function runTests() {
	let mutationSelect = document.getElementById('mutationSelect');
	testInterval = setInterval(function () {
		runTest();
		mutationSelect.selectedIndex += 1;
		loadScript(getScriptURL(mutationSelect.value));
	}, 50);
}

/**
 * Outputs the results of a test case to the output table at the bottom of the page.
 * @param {Object} data Data from the test performed. Contains all inputs for each test.
 * @param {Boolean} killed wether the mutant has been killed or not based on the metamorphic relation.
 */
function outputResult(data, killed) {
	let table = document.getElementById(`results_${data.relation}`);
	let row = document.createElement('tr');
	let SI = `<b>DueDate:</b> ${data.SI.dueDateValue.toISOString()}, <b>CurrentDate:</b> ${data.SI.currentDate.toISOString()}, <b>DeliveryOffset:</b> ${data.SI.deliveryOffset}, <b>BeginWorkOffset:</b> ${data.SI.beginWorkOffset}, <b>DueTime:</b> ${data.SI.dueTime}`
	let FI = `<b>DueDate:</b> ${data.FI.dueDateValue.toISOString()}, <b>CurrentDate:</b> ${data.FI.currentDate.toISOString()}, <b>DeliveryOffset:</b> ${data.FI.deliveryOffset}, <b>BeginWorkOffset:</b> ${data.FI.beginWorkOffset}, <b>DueTime:</b> ${data.FI.dueTime}`
	let SO = `<b>DispatchDate:</b> ${data.SO.date.toDateString()}, <b>TimeWarning?:</b> ${data.SO.warning}</b>`;
	let FO = `<b>DispatchDate:</b> ${data.FO.date.toDateString()}, <b>TimeWarning?:</b> ${data.FO.warning}</b>`;
	let SO_MR = `<b>DispatchDate:</b> ${data.SO_MR.toDateString()}, <b>TimeWarning?:</b> ${data.FO.warning}</b>`;

	row.innerHTML = `<td>${data.relation}</td><td>${data.mutant}</td><td>SI: ${SI}<br>FI: ${FI}</td><td>SO: ${SO}<br>SO${data.check}: ${SO_MR}<br>FO: ${FO}</td><td>${killed ? ' &#10004;' : ''}</td>`;

	// let SI = `<b></b> ${data.SI.dueDateValue.toISOString()}, <b></b> ${data.SI.currentDate.toISOString()}, <b></b> ${data.SI.deliveryOffset}, <b></b> ${data.SI.beginWorkOffset}, <b></b> ${data.SI.dueTime}`
	// let FI = `<b></b> ${data.FI.dueDateValue.toISOString()}, <b></b> ${data.FI.currentDate.toISOString()}, <b></b> ${data.FI.deliveryOffset}, <b></b> ${data.FI.beginWorkOffset}, <b></b> ${data.FI.dueTime}`
	// let SO = `<b></b> ${data.SO.date.toDateString()}, <b></b> ${data.SO.warning}</b>`;
	// let FO = `<b></b> ${data.FO.date.toDateString()}, <b></b> ${data.FO.warning}</b>`;
	// let SO_MR = `<b></b> ${data.SO_MR.toDateString()}, <b></b> ${data.FO.warning}</b>`;

	// row.innerHTML = `<td>${data.relation}</td><td>${data.mutant}</td><td>${SI}<br>${FI}</td><td>${SO_MR}<br>${FO}</td><td>${killed ? ' &#10004;' : ''}</td>`;
	table.appendChild(row);
}

document.getElementById('mutationSelect').addEventListener('change', e => {
	removeErrorMessage(document.getElementById('testRun'));
	loadScript(getScriptURL(e.target.value));
});
document.getElementById('testRun').onclick = runTest;
