document.getElementById('loan-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get input values with error handling
    const proposedLoanAmount = parseFloat(document.getElementById('proposed-loan-amount').value) || 0;
    const loanTenure = parseInt(document.getElementById('loan-tenure').value) || 0;
    const businessDays = parseInt(document.getElementById('business-days').value) || 0;
    const dailySale = parseFloat(document.getElementById('daily-sale').value) || 0;
    let margin = parseFloat(document.getElementById('margin').value) / 100 || 0;
    const secondaryIncome1 = parseFloat(document.getElementById('secondary-income-1').value) || 0;
    const secondaryIncome2 = parseFloat(document.getElementById('secondary-income-2').value) || 0;
    const existingEMI = parseFloat(document.getElementById('existing-emi').value) || 0;
    const creditStatus = document.querySelector('input[name="credit-status"]:checked')?.value || 'ntc';

    // Cap profit margin at 20%
    margin = Math.min(margin, 0.2);

    // Validate inputs
    if (loanTenure <= 0 || loanTenure > 36) {
        alert('Loan tenure must be between 1 and 36 months.');
        return;
    }
    if (proposedLoanAmount <= 0) {
        alert('Proposed loan amount must be greater than zero.');
        return;
    }
    if (businessDays < 1 || businessDays > 31) {
        alert('Business days must be between 1 and 31.');
        return;
    }
    if (dailySale < 0) {
        alert('Daily sale cannot be negative.');
        return;
    }
    if (margin < 0) {
        alert('Profit margin cannot be negative.');
        return;
    }
    if (secondaryIncome1 < 0 || secondaryIncome2 < 0) {
        alert('Secondary incomes cannot be negative.');
        return;
    }
    if (existingEMI < 0) {
        alert('Existing EMI cannot be negative.');
        return;
    }

    // Calculate Primary Income
    const primaryIncome = businessDays * dailySale * margin;

    // Calculate Secondary Income
    const totalSecondaryIncome = secondaryIncome1 + secondaryIncome2;
    const maxSecondaryIncome = 0.4 * primaryIncome;
    const consideredSecondaryIncome = totalSecondaryIncome <= maxSecondaryIncome 
        ? totalSecondaryIncome 
        : maxSecondaryIncome;

    // Calculate Total Income
    const totalIncome = primaryIncome + consideredSecondaryIncome;

    // Apply FOIR
    const foirLimit = creditStatus === 'etc' ? 0.5 : 0.4;
    const maxAllowableEMI = totalIncome * foirLimit;

    // Calculate EMI for Proposed Loan Amount
    const monthlyRate = 0.2245 / 12; // 22.45% annual interest rate
    const proposedEMI = proposedLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure) /
                       (Math.pow(1 + monthlyRate, loanTenure) - 1);

    // Check eligibility
    const totalEMI = proposedEMI + existingEMI;
    const isEligible = totalEMI <= maxAllowableEMI;

    // Calculate Maximum Loan Amount
    const availableEMICapacity = maxAllowableEMI - existingEMI;
    const maxLoanAmount = availableEMICapacity * (1 - Math.pow(1 + monthlyRate, -loanTenure)) / monthlyRate;

    // Calculate Self Contribution and Maximum Loan That Can Be Disbursed
    const selfContribution = 0.2 * maxLoanAmount;
    const maxLoanDisbursed = maxLoanAmount - selfContribution;

    // Generate calculation details with escaped characters
    const calcDetails = `
        <div id="calculation-details">
            <p><strong>Calculation Details:</strong></p>
            <p>1. <b>Primary Income</b> = Business Days × Daily Sale × (min(Profit Margin, 20%) / 100)<br>
                = ${businessDays} × ₹${dailySale.toFixed(2)} × (${Math.min(margin * 100, 20).toFixed(2)}% / 100) = ₹${primaryIncome.toFixed(2)}</p>
            <p>2. <b>Considered Secondary Income</b><br>
                Total Secondary Income = Secondary Income 1 + Secondary Income 2 = ₹${secondaryIncome1.toFixed(2)} + ₹${secondaryIncome2.toFixed(2)} = ₹${totalSecondaryIncome.toFixed(2)}<br>
                Max Considered = 40% of Primary Income = 0.4 × ₹${primaryIncome.toFixed(2)} = ₹${maxSecondaryIncome.toFixed(2)}<br>
                Considered = ${totalSecondaryIncome <= maxSecondaryIncome ? 'Total Secondary Income' : 'Max Considered'} = ₹${consideredSecondaryIncome.toFixed(2)}</p>
            <p>3. <b>Total Income</b> = Primary Income + Considered Secondary Income<br>
                = ₹${primaryIncome.toFixed(2)} + ₹${consideredSecondaryIncome.toFixed(2)} = ₹${totalIncome.toFixed(2)}</p>
            <p>4. <b>FOIR Limit</b> = ${creditStatus.toUpperCase()} (${(foirLimit * 100).toFixed(0)}%)<br>
                Max Allowable EMI = FOIR Limit × Total Income = 0.${(foirLimit * 100).toFixed(0)} × ₹${totalIncome.toFixed(2)} = ₹${maxAllowableEMI.toFixed(2)}<br>
                Proposed EMI = Loan Amount × r × (1 + r)^n / ((1 + r)^n - 1), where r = 22.45% / 12, n = ${loanTenure}<br>
                = ₹${proposedLoanAmount.toFixed(2)} × ${monthlyRate.toFixed(6)} × ${Math.pow(1 + monthlyRate, loanTenure).toFixed(6)} / (${Math.pow(1 + monthlyRate, loanTenure).toFixed(6)} - 1) ≈ ₹${proposedEMI.toFixed(2)}<br>
                Total EMI = Proposed EMI + Existing EMI = ₹${proposedEMI.toFixed(2)} + ₹${existingEMI.toFixed(2)} = ₹${totalEMI.toFixed(2)}<br>
                Eligibility: Total EMI (₹${totalEMI.toFixed(2)}) &le; Max Allowable EMI (₹${maxAllowableEMI.toFixed(2)}) &rarr; ${isEligible ? 'Eligible' : 'Not Eligible'}</p>
            <p>5. <b>Available EMI Capacity</b> = Max Allowable EMI - Existing EMI<br>
                = ₹${maxAllowableEMI.toFixed(2)} - ₹${existingEMI.toFixed(2)} = ₹${availableEMICapacity.toFixed(2)}</p>
            <p>6. <b>Maximum Loan Amount</b> = Available EMI Capacity × (1 - (1 + r)^(-n)) / r<br>
                = ₹${availableEMICapacity.toFixed(2)} × (1 - ${Math.pow(1 + monthlyRate, -loanTenure).toFixed(6)}) / ${monthlyRate.toFixed(6)} ≈ ₹${maxLoanAmount.toFixed(2)}</p>
            <p>7. <b>Self Contribution</b> = 20% of Maximum Loan Amount<br>
                = 0.2 × ₹${maxLoanAmount.toFixed(2)} = ₹${selfContribution.toFixed(2)}</p>
            <p>8. <b>Maximum Loan That Can Be Disbursed</b> = Maximum Loan Amount - Self Contribution<br>
                = ₹${maxLoanAmount.toFixed(2)} - ₹${selfContribution.toFixed(2)} = ₹${maxLoanDisbursed.toFixed(2)}</p>
        </div>
    `;

    // Display result
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.className = isEligible ? 'eligible' : 'not-eligible';

    if (isEligible) {
        resultDiv.innerHTML = `
            <h3>Eligible for Proposed Loan!</h3>
            <p>Proposed Loan Amount: ₹${proposedLoanAmount.toFixed(2)}</p>
            <p>Proposed Monthly EMI: ₹${proposedEMI.toFixed(2)}</p>
            <p>Loan Tenure: ${loanTenure} months</p>
            <p>Maximum Loan Amount (before self contribution): ₹${maxLoanAmount.toFixed(2)}</p>
            <p>Self Contribution (20%): ₹${selfContribution.toFixed(2)}</p>
            <p>Maximum Loan That Can Be Disbursed: ₹${maxLoanDisbursed.toFixed(2)}</p>
            <button id="toggle-calculations">Show Calculations</button>
            ${calcDetails}
        `;
    } else {
        resultDiv.innerHTML = `
            <h3>Not Eligible for Proposed Loan</h3>
            <p>Proposed Loan Amount: ₹${proposedLoanAmount.toFixed(2)}</p>
            <p>Proposed Monthly EMI: ₹${proposedEMI.toFixed(2)}</p>
            <p>Loan Tenure: ${loanTenure} months</p>
            <p>Maximum Loan Amount (before self contribution): ₹${maxLoanAmount.toFixed(2)}</p>
            <p>Self Contribution (20%): ₹${selfContribution.toFixed(2)}</p>
            <p>Maximum Loan That Can Be Disbursed: ₹${maxLoanDisbursed.toFixed(2)}</p>
            <p>Your total EMI exceeds the FOIR limit. Consider a lower loan amount or longer tenure.</p>
            <button id="toggle-calculations">Show Calculations</button>
            ${calcDetails}
        `;
    }

    // Add toggle functionality
    const toggleButton = document.getElementById('toggle-calculations');
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            const calcDiv = document.getElementById('calculation-details');
            if (calcDiv) {
                if (calcDiv.style.display === 'none' || calcDiv.style.display === '') {
                    calcDiv.style.display = 'block';
                    this.textContent = 'Hide Calculations';
                } else {
                    calcDiv.style.display = 'none';
                    this.textContent = 'Show Calculations';
                }
            }
        });
    }
});

// Reset button functionality
document.getElementById('reset-button').addEventListener('click', function() {
    document.getElementById('loan-form').reset();
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = '';
});