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

        return {"balanceLog": balanceLog, "interestTotal": interestTotal, "repaymentTotal": repaymentTotal + Number(initialPayoff)}
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
                    callback: function(value, index, values) {
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
                label: function(tooltipItem, data) {
                    var label = data.datasets[tooltipItem.datasetIndex].label || '';

                    if (label) {
                        label += ': ';
                    }
                    label += Math.round(tooltipItem.yLabel/10) * 10;
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
        let tempSal = function(year) { return eval(document.getElementById("salaryFormula").value) };
        test = runSimulation(document.getElementById("loanAmount").value, tempSal, document.getElementById("perYearPayoff").value/100, document.getElementById("initialPayoff").value);
        lineChart.data.datasets[0].data = test["balanceLog"];
        lineChart.update();
        document.getElementById("totalRepaymentInfo").innerText = Math.round(test["repaymentTotal"]).toString();
        document.getElementById("totalInterestInfo").innerText = Math.round(test["interestTotal"]).toString();
        document.getElementById("totalRemainingInfo").innerText = Math.round(test["balanceLog"][test["balanceLog"].length - 1]).toString();
        if(test["balanceLog"][test["balanceLog"].length - 1] < 1) {
            document.getElementById("controls1").style.background = "seagreen";
        } else {
            document.getElementById("controls1").style.background = "";
        }
    }

    updateMainChart();

    let toBePayed = 60000;
    let resultsArray = [];
    let resultsLabels = [];
    for (let initalPayment = 0; initalPayment < 60000; initalPayment += 1000) {
        let results = runSimulation(toBePayed - initalPayment, salary)
        resultsArray.push(results["repaymentTotal"] + initalPayment)
        resultsLabels.push(initalPayment)
    }

    var ctx1 = document.getElementById('repaymentChart').getContext('2d');
    var data1 = {
        labels: resultsLabels,
        datasets: [
            {
                label: "Total repayment amount",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: resultsArray,
                lineTension: 0
            }
        ]
    };

    var lineChart1 = new Chart(ctx1, {
        type: "line",
        data: data1,
        options: options
    });