function salary(year) {
    return 30000 * (1.05 ** year)
}

function DebugInfo(loanAmount, salary, interest, repayment) {
    this.loanAmount = loanAmount;
    this.salary = salary;
    this.interest = interest;
    this.repayment = repayment;
}

function runSimulation(loanAmount, salary, repaymentPercentage, initialPayoff) {
    let debugStr = "";
    let allData = [];
    let changeOrder = false;
    let balanceLog = [];
    let interestTotal = 0;
    let repaymentTotal = 0;

    loanAmount -= initialPayoff;

    for (let year = 0; year < 30; year++) {
        debugStr += "Year " + year.toString() + ": " + loanAmount.toString() + "\n";

        let currentSalary = salary(year);

        let prevLoanAmount = loanAmount;
        let yearInterestTotal = 0;
        let yearPaymentTotal = 0;
        for (let month = 0; month < 12; month++) {
            let currentInterest, currentRepayment;
            if (changeOrder) {
                currentInterest = interest(currentSalary, loanAmount);
                currentRepayment = repayment(currentSalary, loanAmount, repaymentPercentage);
                balanceLog.push(loanAmount);
                loanAmount = loanAmount + currentInterest - currentRepayment;
            } else {
                currentRepayment = repayment(currentSalary, loanAmount, repaymentPercentage);
                balanceLog.push(loanAmount);
                loanAmount -= currentRepayment;
                currentInterest = interest(currentSalary, loanAmount);
                loanAmount += currentInterest;
            }
            interestTotal += currentInterest;
            yearInterestTotal += currentInterest;
            repaymentTotal += currentRepayment;
            yearPaymentTotal += currentRepayment;
        }

        allData.push(new DebugInfo(prevLoanAmount, currentSalary, yearInterestTotal, yearPaymentTotal))
    }

    return {
        "balanceLog": balanceLog,
        "interestTotal": interestTotal,
        "repaymentTotal": repaymentTotal + Number(initialPayoff)
    }
}

function interest(salary, balance) {
    let additional = 0.03;
    let rpi = 0.024;
    let interest = 0;

    if (salary < 25725) {
        interest = rpi * balance;
    } else if (salary > 46305) {
        interest = (rpi + additional) * balance;
    } else {
        let fraction = (salary - 25725) / (46305 - 25725);
        interest = (rpi + fraction * additional) * balance;
    }

    return interest / 12;
}

function repayment(salary, balance, paymentPercentage) {
    let threshold = 25725;
    // let paymentPercentage = 0.09;

    if (salary < threshold) {
        return 0
    } else {
        repayAmount = paymentPercentage * (salary - threshold)
    }

    return Math.min(balance, repayAmount / 12)
}

let labels = [];

for (let year = 0; year < 30; year++) {
    for (let month = 0; month < 12; month++) {
        labels.push(year.toString());
    }
}

var ctx = document.getElementById('loanChart').getContext('2d');
var data = {
    labels: labels,
    datasets: [
        {
            label: "Loan balance",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29],
            lineTension: 0
        }
    ]
};

var options = {
    lineTension: 0,
    maintainAspectRatio: false,
    scales: {
        xAxes: [{
            ticks: {
                min: 3,
                max: 10,
                maxTicks: 10,
                maxTicksLimit: 30
            },
            scaleLabel: {
                display: true,
                labelString: "Year"
            }
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true,
                callback: function (value, index, values) {
                    return '£' + value;
                }
            },
            scaleLabel: {
                display: true,
                labelString: "Loan amount"
            }
        }]
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItem, data) {
                var label = data.datasets[tooltipItem.datasetIndex].label || '';

                if (label) {
                    label += ': ';
                }
                label += Math.round(tooltipItem.yLabel / 10) * 10;
                return label;
            }
        }
    }
};

var lineChart = new Chart(ctx, {
    type: "line",
    data: data,
    options: options
});

function updateMainChart() {
    try {
        tempSal = new Function("year", "return " + document.getElementById("salaryFormula").value);
    } catch(e) {
        document.getElementById("salaryIndicator1").innerText = "✗";
        document.getElementById("salaryIndicator1").title = e;
        return
    }

    document.getElementById("salaryIndicator1").innerText = "✔";
    document.getElementById("salaryIndicator1").title = "Formula correct";

    test = runSimulation(document.getElementById("loanAmount").value, tempSal, document.getElementById("perYearPayoff").value / 100, document.getElementById("initialPayoff").value);
    lineChart.data.datasets[0].data = test["balanceLog"];
    lineChart.update();
    document.getElementById("totalRepaymentInfo").innerText = Math.round(test["repaymentTotal"]).toString();
    document.getElementById("totalInterestInfo").innerText = Math.round(test["interestTotal"]).toString();
    document.getElementById("totalRemainingInfo").innerText = Math.round(test["balanceLog"][test["balanceLog"].length - 1]).toString();
    if (test["balanceLog"][test["balanceLog"].length - 1] < 1) {
        document.getElementById("controls1").style.background = "seagreen";
    } else {
        document.getElementById("controls1").style.background = "";
    }
}

updateMainChart();

var ctx1 = document.getElementById('repaymentChart').getContext('2d');
var data1 = {
    labels: [0, 1000, 2000],
    datasets: [
        {
            label: "Total repayment amount",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [1, 1, 1],
            lineTension: 0
        }
    ]
};

var options = {
    lineTension: 0,
    maintainAspectRatio: false,
    scales: {
        xAxes: [{
            ticks: {
                min: 3,
                max: 10,
                maxTicks: 10,
                maxTicksLimit: 30
            },
            scaleLabel: {
                display: true,
                labelString: "Initial payment"
            }
        }],
        yAxes: [{
            ticks: {
                beginAtZero: true,
                callback: function (value, index, values) {
                    return '£' + value;
                }
            },
            scaleLabel: {
                display: true,
                labelString: "Total repayment"
            }
        }]
    },
    tooltips: {
        callbacks: {
            label: function (tooltipItem, data) {
                var label = data.datasets[tooltipItem.datasetIndex].label || '';

                if (label) {
                    label += ': ';
                }
                label += Math.round(tooltipItem.yLabel / 10) * 10;
                return label;
            }
        }
    }
};

var lineChart1 = new Chart(ctx1, {
    type: "line",
    data: data1,
    options: options
});

function updateChart2() {
    try {
        tempSal = new Function("year", "return " + document.getElementById("salaryFormula2").value);
    } catch(e) {
        document.getElementById("salaryIndicator2").innerText = "✗";
        document.getElementById("salaryIndicator2").title = e;
        return
    }

    document.getElementById("salaryIndicator2").innerText = "✔";
    document.getElementById("salaryIndicator2").title = "Formula correct";

    let toBePayed = document.getElementById("loanAmount2").value;
    let initialPayoff = document.getElementById("initialPayoff2").value;
    let repaymentPercentage = document.getElementById("perYearPayoff2").value / 100;
    let resultsArray = [];
    let resultsLabels = [];

    let selection = document.getElementById("varyingParameter").value;
    console.log(selection);
    if (selection === "initialPayoff") {
        document.getElementById("perYearPayoffControls").style.display = "";
        document.getElementById("initialPayoffControls").style.display = "none";

        for (let initialPayment = 0; initialPayment < toBePayed; initialPayment += 1000) {
            let results = runSimulation(toBePayed, tempSal, repaymentPercentage, initialPayment);
            resultsArray.push(results["repaymentTotal"]);
            resultsLabels.push("£" + initialPayment.toString())
        }

        lineChart1.options.scales.xAxes[0].scaleLabel.labelString = "Initial payment"
    } else if (selection === "percentagePayoff") {
        document.getElementById("perYearPayoffControls").style.display = "none";
        document.getElementById("initialPayoffControls").style.display = "";

        for (let repaymentPercentageV = 0.09; repaymentPercentageV < 1; repaymentPercentageV += 0.01) {
            let results = runSimulation(toBePayed, tempSal, repaymentPercentageV, initialPayoff);
            resultsArray.push(results["repaymentTotal"]);
            resultsLabels.push(Math.round(repaymentPercentageV * 100).toString() + "%")
        }

        lineChart1.options.scales.xAxes[0].scaleLabel.labelString = "Percentage of salary paid into loan"
    }

    let globalMin = -1;
    let globalMinValue = 9999999999999;
    for(let i = 0; i < resultsArray.length; i++) {
        if(globalMinValue > resultsArray[i]) {
            globalMin = i;
            globalMinValue = resultsArray[i];
        }
    }

    if (selection === "initialPayoff") {
        document.getElementById("optimumValueInfo").innerHTML = "Initial payoff of " + resultsLabels[globalMin].toString() + "<br>Results in £" + Math.round(globalMinValue).toString() + " payment";
    } else if (selection === "percentagePayoff") {
        document.getElementById("optimumValueInfo").innerHTML = "Paying off " + resultsLabels[globalMin].toString() + " of your salary<br>Results in £" + Math.round(globalMinValue).toString() + " payment";
    }

    lineChart1.data.labels = resultsLabels;
    lineChart1.data.datasets[0].data = resultsArray;
    lineChart1.update()
}

function updateInterest() {
    let initialPayoff = Number(document.getElementById("initialPayoff2").value);
    let interest = Number(document.getElementById("investmentInterest").value);
    document.getElementById("interestInfo").innerText = Math.round(initialPayoff * (1 + interest/100) ** 30).toString();
}

function updateInterest1() {
    let initialPayoff = Number(document.getElementById("initialPayoff").value);
    let interest = Number(document.getElementById("investmentInterest1").value);
    document.getElementById("interestInfo1").innerText = Math.round(initialPayoff * (1 + interest/100) ** 30).toString();
}

let formMembers = document.getElementById("controls2").getElementsByTagName("*");
for (let i = 0; i < formMembers.length; i++) {
    let el = formMembers[i];
    el.addEventListener("input", updateChart2);
    el.addEventListener("input", updateInterest);
}

document.getElementById("investmentInterest").addEventListener("input", updateInterest);

updateChart2();