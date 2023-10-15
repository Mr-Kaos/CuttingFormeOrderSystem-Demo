# Die Making Business Order System Demo

## About this repository

This repository is used to demonstrate metamorphic testing through a web-based ordering system for a die-making business.

The ordering system demonstrated has been designed for use in the tool and die making industry. The products listed on the page are some products used in this industry.

This code has been adapted from an in-house project that connects to an SQL database. Because of this, the program here has been heavily modified and has had all necessary values typically retrieved from the database hard-coded and altered for anonymity.

## Repository Structure

The root of the repository contains all necessary files to run the demo.

The metamorphic tests for this program are located in `js/mutants`. These serve as a demonstration as to how they can be applied to the program and used to ensure the program is implemented correctly.

## Metamorphic Relations

The `mutationTester.js` file runs test against three metamorphic relations. They are described as follows:

- MR1: Divide Delivery Day Offset by *n*
	> The delivery day offset input will be divided by *n*, where *n* is a positive integer.
	> 
	> The outputs of the source and follow up inputs can be checked with the following equality: SO/n == FO.
	
	In this implementation, *n* is set to `2`.

- MR2: Add *n* to all dates
	> All date inputs have *n* time added to them where *n* is an integer greater than or equal to 0 and can represents a number of days, minutes and hours. This only affects the due date input.
	>
	> The outputs of the source and follow up inputs can be checked with the following equality: SO+n == FO.

	In this program, *n* is set to `2`.

- MR3: Multiply all dates by -1
	> All date inputs have their numeric values multiplied by -1. Since dates in JavaScript are integers that represent the number of milliseconds from the date baseline of 01/01/1970, multiplying all dates by -1 is feasible.
	>
	> The outputs of the source and follow up inputs can be checked with the following equality: SO*-1 == FO.

When running tests, they are output into their respective table at the bottom of the page.
