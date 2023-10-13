/**
 * Aids in the process of swapping out the "correct" program with the incorrect programs to perform mutation tests.
 */

"use strict";

let mutationSelect = document.getElementById('mutationSelect');

mutationSelect.addEventListener('change', e => {
	let script = 'validateDueDate';
	if (e.target.value != 'original') {
		script = `mutants/${e.target.value}`;
	}

	script = `js/${script}.js`;

	loadScript(script)
});


function loadScript(url, callback)
{
    // Adding the script tag to the head as suggested before
    var head = document.head;
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;

    // Then bind the event to the callback function.
    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}