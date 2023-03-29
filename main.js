
    function generate_combinations(digits) {
        let combos = [];
        for (let i = 0; i < digits.length; i++) {
            for (let j = 0; j < digits.length; j++) {
                for (let k = 0; k < digits.length; k++) {
                    for (let l = 0; l < digits.length; l++) {
                        if (i != j && i != k && i != l && j != k && j != l && k != l) {
                            let combo = digits[i] + digits[j] + digits[k] + digits[l];
                            combos.push(combo);
                        }
                    }
                }
            }
        }
        return combos;
    }

    function f() {

        let x = document.getElementById('n4').value
   /*
        console.log(`4 numbers: ${x}`);
        console.log("List of numbers:");
        console.log(generate_combinations(x));
        console.log("Length of list:");
        console.log(generate_combinations(x).length);
    */
        document.getElementById("text").textContent = generate_combinations(x);
    }

