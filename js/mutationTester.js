/**
 * Aids in the process of swapping out the "correct" program with the incorrect programs to perform mutation tests.
 */

"use strict";

// Global variable to indicate if tests are being run. Used to prevent test runs from running simultaneously.
let running = false;

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

function compareTests(sourceTest, followUpTest) {

}

/**
 * Runs all tests on all available mutants for each metamorphic relation.
 */
function runTests() {
	let mutationSelect = document.getElementById('mutationSelect');

	if (!running) {
		running = true;
		let customerDropdown = document.getElementById("Customer");
		let MR = 0;
		let mutant = 1;
		let SO;
		let FO;

		for (MR; MR < 3; MR++) {
			// set values for each input by selecting a random customer.
			// let random = Math.floor((Math.random() * (customerDropdown.childElementCount - 1)) + 1);

			// displayDeliveryOffsets(customerDropdown.children[random]);
			customerDropdown.selectedIndex = 3;
			displayDeliveryOffsets(customerDropdown.children[3]);

			let dueDate = document.getElementById('DateDue');
			let deliveryOffset = document.getElementById('deliveryOffset').value;
			let beginWorkOffset = document.getElementById('beginworkingoffset').value;
			let dueTime = document.getElementById('defaultduetime').value;

			let dueDateValue = new Date();
			dueDateValue.setDate(dueDateValue.getDate() + 12);
			dueDate.value = dueDateValue.toLocaleString('sv').substring(0, 16);
			deliveryOffset = 2;

			switch (MR) {
				// MR 1: Divide delivery day offset by n
				case 0:
					for (mutant = 1; mutant <= 30; mutant++) {
						loadScript(getScriptURL(`m${mutant}`));

						console.log(dueDate.value, deliveryOffset, beginWorkOffset, dueTime);
						SO = validateDueDate(dueDate, deliveryOffset, beginWorkOffset, dueTime);
						console.log(dueDate.value, deliveryOffset / 2, beginWorkOffset, dueTime);
						FO = validateDueDate(dueDate, deliveryOffset / 2, beginWorkOffset, dueTime);
						console.log(SO, FO);
					}
					break;
				// MR 2: Add n to all dates
				case 1:

					break;
				// MR 3: Multiply all dates by -1
				case 2:

					break;
			}
		}

		running = false;
	}
}

document.getElementById('mutationSelect').addEventListener('change', e => {
	loadScript(getScriptURL(e.target.value));
});
document.getElementById('testRun').onclick = runTests;
